import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { paymentService } from '../../services/payment.service';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { verifyWebhookSignature } from '../../config/razorpay';
import { z } from 'zod';
import { ApiResponse, PaymentMethod } from '../../types';

// Request schemas
const createPaymentSchema = z.object({
  bookingId: z.string(),
  paymentMethod: z.enum(['upi', 'card', 'wallet', 'net_banking']),
});

const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});

const processRefundSchema = z.object({
  refundAmount: z.number().min(0).optional(),
  reason: z.string().optional(),
});

export async function paymentRoutes(fastify: FastifyInstance) {
  /**
   * POST /api/payments/create
   * Create payment order (authenticated)
   */
  fastify.post(
    '/create',
    {
      preHandler: [authenticate, validate(createPaymentSchema)],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = (request as any).user.userId;
      const { bookingId, paymentMethod } = request.body as {
        bookingId: string;
        paymentMethod: PaymentMethod;
      };

      // Get booking to get amounts
      const { bookingService } = await import('../../services/booking.service');
      const booking = await bookingService.getBookingById(bookingId, userId);

      const result = await paymentService.createPayment({
        bookingId,
        userId,
        amount: booking.amount,
        platformFee: booking.platformFee,
        totalAmount: booking.totalAmount,
        paymentMethod,
      });

      const response: ApiResponse = {
        success: true,
        message: 'Payment order created successfully',
        data: result,
      };

      return reply.status(201).send(response);
    }
  );

  /**
   * POST /api/payments/verify
   * Verify payment (authenticated)
   */
  fastify.post(
    '/verify',
    {
      preHandler: [authenticate, validate(verifyPaymentSchema)],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const data = request.body as {
        razorpayOrderId: string;
        razorpayPaymentId: string;
        razorpaySignature: string;
      };

      const payment = await paymentService.verifyPayment(data);

      const response: ApiResponse = {
        success: true,
        message: 'Payment verified successfully',
        data: payment,
      };

      return reply.status(200).send(response);
    }
  );

  /**
   * GET /api/payments/:paymentId
   * Get payment details (authenticated)
   */
  fastify.get(
    '/:paymentId',
    {
      preHandler: [authenticate],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = (request as any).user.userId;
      const { paymentId } = request.params as { paymentId: string };

      const payment = await paymentService.getPaymentById(paymentId, userId);

      const response: ApiResponse = {
        success: true,
        message: 'Payment retrieved successfully',
        data: payment,
      };

      return reply.status(200).send(response);
    }
  );

  /**
   * GET /api/payments
   * Get user payments (authenticated)
   */
  fastify.get(
    '/',
    {
      preHandler: [authenticate],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = (request as any).user.userId;
      const query = request.query as {
        status?: string;
        page?: string;
        limit?: string;
      };

      const filters: any = {};
      if (query.status) filters.status = query.status;
      if (query.page) filters.page = parseInt(query.page);
      if (query.limit) filters.limit = parseInt(query.limit);

      const result = await paymentService.getUserPayments(userId, filters);

      const response: ApiResponse = {
        success: true,
        message: 'Payments retrieved successfully',
        data: result,
      };

      return reply.status(200).send(response);
    }
  );

  /**
   * POST /api/payments/:paymentId/refund
   * Process refund (authenticated)
   */
  fastify.post(
    '/:paymentId/refund',
    {
      preHandler: [authenticate, validate(processRefundSchema)],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = (request as any).user.userId;
      const { paymentId } = request.params as { paymentId: string };
      const { refundAmount, reason } = request.body as {
        refundAmount?: number;
        reason?: string;
      };

      const payment = await paymentService.processRefund({
        paymentId,
        userId,
        refundAmount,
        reason,
      });

      const response: ApiResponse = {
        success: true,
        message: 'Refund processed successfully',
        data: payment,
      };

      return reply.status(200).send(response);
    }
  );

  /**
   * GET /api/payments/methods
   * Get available payment methods
   */
  fastify.get('/methods', async (_request: FastifyRequest, reply: FastifyReply) => {
    const methods = [
      {
        id: 'upi',
        name: 'UPI',
        description: 'Pay using UPI apps',
        icon: 'upi',
      },
      {
        id: 'card',
        name: 'Credit/Debit Card',
        description: 'Pay using card',
        icon: 'card',
      },
      {
        id: 'wallet',
        name: 'Wallet',
        description: 'Pay using digital wallets',
        icon: 'wallet',
      },
      {
        id: 'net_banking',
        name: 'Net Banking',
        description: 'Pay using net banking',
        icon: 'netbanking',
      },
    ];

    const response: ApiResponse = {
      success: true,
      message: 'Payment methods retrieved successfully',
      data: methods,
    };

    return reply.status(200).send(response);
  });

  /**
   * POST /api/payments/webhook
   * Razorpay webhook handler
   */
  fastify.post('/webhook', async (request: FastifyRequest, reply: FastifyReply) => {
    const signature = request.headers['x-razorpay-signature'] as string;
    const webhookBody = JSON.stringify(request.body);

    if (!signature) {
      return reply.status(400).send({
        success: false,
        message: 'Missing signature',
      });
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(webhookBody, signature);
    if (!isValid) {
      return reply.status(400).send({
        success: false,
        message: 'Invalid signature',
      });
    }

    const event = (request.body as any).event;
    const payload = (request.body as any).payload;

    try {
      // Handle different webhook events
      if (event === 'payment.captured') {
        // Payment was captured
        const paymentId = payload.payment.entity.id;
        const orderId = payload.payment.entity.order_id;

        const payment = await Payment.findOne({ razorpayOrderId: orderId });
        if (payment && payment.status === 'pending') {
          payment.status = 'paid';
          payment.razorpayPaymentId = paymentId;
          payment.transactionId = paymentId;
          await payment.save();

          // Update booking
          const { bookingService } = await import('../../services/booking.service');
          const booking = await bookingService.getBookingById(payment.bookingId);
          if (booking) {
            booking.paymentStatus = 'paid';
            booking.status = 'confirmed';
            await booking.save();
          }
        }
      } else if (event === 'payment.failed') {
        // Payment failed
        const orderId = payload.payment.entity.order_id;
        const payment = await Payment.findOne({ razorpayOrderId: orderId });
        if (payment) {
          payment.status = 'failed';
          payment.failureReason = payload.payment.entity.error_description || 'Payment failed';
          await payment.save();
        }
      }

      return reply.status(200).send({ success: true });
    } catch (error) {
      logger.error('Error processing webhook:', error);
      return reply.status(500).send({
        success: false,
        message: 'Error processing webhook',
      });
    }
  });
}

// Import Payment model and logger for webhook
import Payment from '../../models/Payment';
import logger from '../../utils/logger';
