import User from '../models/User';
import Booking from '../models/Booking';
import PoolingOffer from '../models/PoolingOffer';
import RentalOffer from '../models/RentalOffer';
import { NotFoundError } from '../utils/errors';
import logger from '../utils/logger';

class DashboardService {
  /**
   * Get dashboard statistics for a user
   */
  async getDashboardStats(userId: string): Promise<any> {
    try {
      const user = await User.findOne({ userId });
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Get inflow and outflow amounts
      const inflowAmount = user.inflowAmount || 0;
      const outflowAmount = user.outflowAmount || 0;

      // Get booking statistics
      const totalBookings = await Booking.countDocuments({
        $or: [{ userId }, { 'driver.userId': userId }, { 'owner.userId': userId }],
      });

      const activeBookings = await Booking.countDocuments({
        $or: [{ userId }, { 'driver.userId': userId }, { 'owner.userId': userId }],
        status: { $in: ['pending', 'confirmed', 'in_progress'] },
      });

      const completedBookings = await Booking.countDocuments({
        $or: [{ userId }, { 'driver.userId': userId }, { 'owner.userId': userId }],
        status: 'completed',
      });

      // Get offer statistics (for drivers)
      const totalOffers = await PoolingOffer.countDocuments({ driverId: userId });
      const totalRentalOffers = await RentalOffer.countDocuments({ ownerId: userId });
      const activeOffers = await PoolingOffer.countDocuments({
        driverId: userId,
        status: { $in: ['active', 'pending', 'booked'] },
      });

      // Get recent bookings
      const recentBookings = await Booking.find({
        $or: [{ userId }, { 'driver.userId': userId }, { 'owner.userId': userId }],
      })
        .sort({ createdAt: -1 })
        .limit(5);

      // Get upcoming trips
      const upcomingTrips = await Booking.find({
        $or: [{ userId }, { 'driver.userId': userId }, { 'owner.userId': userId }],
        status: { $in: ['pending', 'confirmed'] },
        date: { $gte: new Date() },
      })
        .sort({ date: 1 })
        .limit(5);

      return {
        user: {
          name: user.name,
          rating: user.rating,
          totalTrips: user.totalTrips,
          totalEarnings: user.totalEarnings,
          totalSpent: user.totalSpent,
        },
        financial: {
          inflowAmount: parseFloat(inflowAmount.toFixed(2)),
          outflowAmount: parseFloat(outflowAmount.toFixed(2)),
          netAmount: parseFloat((inflowAmount - outflowAmount).toFixed(2)),
        },
        bookings: {
          total: totalBookings,
          active: activeBookings,
          completed: completedBookings,
        },
        offers: {
          total: totalOffers + totalRentalOffers,
          active: activeOffers,
        },
        recentBookings: recentBookings.map((b) => b.toJSON()),
        upcomingTrips: upcomingTrips.map((b) => b.toJSON()),
      };
    } catch (error) {
      logger.error('Error getting dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Get user's financial summary
   */
  async getFinancialSummary(userId: string): Promise<any> {
    try {
      const user = await User.findOne({ userId });
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Get all completed bookings where user is driver
      const driverBookings = await Booking.find({
        'driver.userId': userId,
        status: 'completed',
      });

      // Get all completed bookings where user is owner
      const ownerBookings = await Booking.find({
        'owner.userId': userId,
        status: 'completed',
      });

      const allDriverBookings = [...driverBookings, ...ownerBookings];

      // Calculate total earnings
      const totalEarnings = allDriverBookings.reduce(
        (sum, booking) => sum + (booking.amount || 0),
        0
      );

      // Calculate total platform fees
      const totalPlatformFees = allDriverBookings.reduce(
        (sum, booking) => sum + (booking.platformFee || 0),
        0
      );

      // Get pending settlements
      const pendingSettlements = await Booking.find({
        $or: [{ 'driver.userId': userId }, { 'owner.userId': userId }],
        status: 'completed',
        settlementStatus: 'driver_requested',
        paymentMethod: { $ne: 'offline_cash' },
      });

      const pendingSettlementAmount = pendingSettlements.reduce(
        (sum, booking) => sum + (booking.driverSettlementAmount || 0),
        0
      );

      return {
        inflowAmount: parseFloat((user.inflowAmount || 0).toFixed(2)),
        outflowAmount: parseFloat((user.outflowAmount || 0).toFixed(2)),
        netAmount: parseFloat(((user.inflowAmount || 0) - (user.outflowAmount || 0)).toFixed(2)),
        totalEarnings: parseFloat(totalEarnings.toFixed(2)),
        totalPlatformFees: parseFloat(totalPlatformFees.toFixed(2)),
        pendingSettlementAmount: parseFloat(pendingSettlementAmount.toFixed(2)),
      };
    } catch (error) {
      logger.error('Error getting financial summary:', error);
      throw error;
    }
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
