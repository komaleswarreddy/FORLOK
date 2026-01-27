import Payment from '../models/Payment';
import Booking from '../models/Booking';
import { generateUserId } from '../utils/helpers';
import { NotFoundError, ConflictError } from '../utils/errors';
import logger from '../utils/logger';
import { getRazorpayInstance } from '../config/razorpay';
import { PaymentMethod, PaymentStatus } from '../types';

class PaymentService {
  /**
   * Create payment order
   */
  async createPayment(data: {
    bookingId: string;
    userId: string;
    amount: number;
    platformFee: number;
    totalAmount: number;
    paymentMethod: PaymentMethod;
  }): Promise<any> {
    try {
      // Get booking
      const booking = await Booking.findOne({ bookingId: data.bookingId });
      if (!booking) {
        throw new NotFoundError('Booking not found');
      }

      if (booking.userId !== data.userId) {
        throw new ConflictError('Booking does not belong to user');
      }

      // Check if payment already exists
      const existingPayment = await Payment.findOne({
        bookingId: data.bookingId,
        status: { $in: ['pending', 'paid'] },
      });

      if (existingPayment) {
        throw new ConflictError('Payment already exists for this booking');
      }

      // Create Razorpay order
      const razorpay = getRazorpayInstance();
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(data.totalAmount * 100), // Convert to paise
        currency: 'INR',
        receipt: `receipt_${data.bookingId}_${Date.now()}`,
        notes: {
          bookingId: data.bookingId,
          userId: data.userId,
          serviceType: booking.serviceType,
        },
      });

      // Create payment record
      const paymentId = generateUserId('PAY');
      const payment = await Payment.create({
        paymentId,
        bookingId: data.bookingId,
        userId: data.userId,
        amount: data.amount,
        platformFee: data.platformFee,
        totalAmount: data.totalAmount,
        paymentMethod: data.paymentMethod,
        status: 'pending',
        razorpayOrderId: razorpayOrder.id,
        metadata: {
          razorpayOrder: razorpayOrder,
        },
      });

      // Update booking with payment ID
      booking.paymentId = paymentId;
      await booking.save();

      logger.info(`Payment order created: ${paymentId} - Razorpay Order: ${razorpayOrder.id}`);

      return {
        payment: payment.toJSON(),
        razorpayOrder: {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          key: process.env.RAZORPAY_KEY_ID || '',
        },
      };
    } catch (error) {
      logger.error('Error creating payment:', error);
      throw error;
    }
  }

  /**
   * Verify payment
   */
  async verifyPayment(data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): Promise<any> {
    try {
      const crypto = require('crypto');
      const { config } = await import('../config/env');

      // Verify signature
      const text = `${data.razorpayOrderId}|${data.razorpayPaymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', config.payment.razorpay.keySecret)
        .update(text)
        .digest('hex');

      if (expectedSignature !== data.razorpaySignature) {
        throw new ConflictError('Invalid payment signature');
      }

      // Get payment by order ID
      const payment = await Payment.findOne({
        razorpayOrderId: data.razorpayOrderId,
      });

      if (!payment) {
        throw new NotFoundError('Payment not found');
      }

      if (payment.status === 'paid') {
        throw new ConflictError('Payment already verified');
      }

      // Verify with Razorpay
      const razorpay = getRazorpayInstance();
      const razorpayPayment = await razorpay.payments.fetch(data.razorpayPaymentId);

      if (razorpayPayment.status !== 'captured') {
        throw new ConflictError('Payment not captured');
      }

      // Update payment
      payment.status = 'paid';
      payment.razorpayPaymentId = data.razorpayPaymentId;
      payment.razorpaySignature = data.razorpaySignature;
      payment.transactionId = razorpayPayment.id;
      await payment.save();

      // Update booking
      const booking = await Booking.findOne({ bookingId: payment.bookingId });
      if (booking) {
        booking.paymentStatus = 'paid';
        booking.status = 'confirmed';
        await booking.save();
      }

      logger.info(`Payment verified: ${payment.paymentId}`);

      return payment.toJSON();
    } catch (error) {
      logger.error('Error verifying payment:', error);
      throw error;
    }
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: string, userId?: string): Promise<any> {
    try {
      const query: any = { paymentId };
      if (userId) {
        query.userId = userId;
      }

      const payment = await Payment.findOne(query);
      if (!payment) {
        throw new NotFoundError('Payment not found');
      }

      return payment.toJSON();
    } catch (error) {
      logger.error('Error getting payment by ID:', error);
      throw error;
    }
  }

  /**
   * Get user payments
   */
  async getUserPayments(userId: string, filters?: {
    status?: PaymentStatus;
    page?: number;
    limit?: number;
  }): Promise<{ payments: any[]; total: number; page: number; limit: number }> {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const skip = (page - 1) * limit;

      const query: any = { userId };

      if (filters?.status) {
        query.status = filters.status;
      }

      const total = await Payment.countDocuments(query);
      const payments = await Payment.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return {
        payments: payments.map((p) => p.toJSON()),
        total,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Error getting user payments:', error);
      throw error;
    }
  }

  /**
   * Process refund
   */
  async processRefund(data: {
    paymentId: string;
    userId: string;
    refundAmount?: number;
    reason?: string;
  }): Promise<any> {
    try {
      const payment = await Payment.findOne({
        paymentId: data.paymentId,
        userId: data.userId,
      });

      if (!payment) {
        throw new NotFoundError('Payment not found');
      }

      if (payment.status === 'refunded') {
        throw new ConflictError('Payment already refunded');
      }

      if (payment.status !== 'paid') {
        throw new ConflictError('Payment must be paid to process refund');
      }

      if (!payment.razorpayPaymentId) {
        throw new ConflictError('Razorpay payment ID not found');
      }

      // Calculate refund amount (default to full refund)
      const refundAmount = data.refundAmount || payment.totalAmount;

      if (refundAmount > payment.totalAmount) {
        throw new ConflictError('Refund amount cannot exceed payment amount');
      }

      // Process refund with Razorpay
      const razorpay = getRazorpayInstance();
      const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
        amount: Math.round(refundAmount * 100), // Convert to paise
        notes: {
          reason: data.reason || 'User requested refund',
          bookingId: payment.bookingId,
        },
      });

      // Update payment
      payment.status = 'refunded';
      payment.refundAmount = refundAmount;
      payment.refundReason = data.reason;
      payment.refundedAt = new Date();
      payment.metadata = {
        ...payment.metadata,
        razorpayRefund: refund,
      };
      await payment.save();

      // Update booking
      const booking = await Booking.findOne({ bookingId: payment.bookingId });
      if (booking) {
        booking.paymentStatus = 'refunded';
        await booking.save();
      }

      logger.info(`Refund processed: ${payment.paymentId} - Amount: ${refundAmount}`);

      return payment.toJSON();
    } catch (error) {
      logger.error('Error processing refund:', error);
      throw error;
    }
  }

  /**
   * Calculate refund amount based on cancellation policy
   */
  calculateRefundAmount(
    totalAmount: number,
    bookingDate: Date,
    serviceType: 'pooling' | 'rental'
  ): number {
    const now = new Date();
    const hoursUntilBooking = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (serviceType === 'pooling') {
      if (hoursUntilBooking >= 24) {
        return totalAmount; // Full refund
      } else if (hoursUntilBooking >= 12) {
        return totalAmount * 0.5; // 50% refund
      } else {
        return 0; // No refund
      }
    } else {
      // Rental
      if (hoursUntilBooking >= 48) {
        return totalAmount; // Full refund
      } else if (hoursUntilBooking >= 24) {
        return totalAmount * 0.5; // 50% refund
      } else {
        return 0; // No refund
      }
    }
  }
}

export const paymentService = new PaymentService();
export default paymentService;
