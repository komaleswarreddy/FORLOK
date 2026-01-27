import Rating from '../models/Rating';
import Booking from '../models/Booking';
import User from '../models/User';
import { generateUserId } from '../utils/helpers';
import { NotFoundError, ConflictError } from '../utils/errors';
import logger from '../utils/logger';
import { ServiceType } from '../types';

class RatingService {
  /**
   * Create rating
   */
  async createRating(data: {
    bookingId: string;
    userId: string;
    ratedUserId: string;
    serviceType: ServiceType;
    overallRating: number;
    punctuality?: number;
    vehicleCondition?: number;
    driving?: number;
    service?: number;
    comment?: string;
  }): Promise<any> {
    try {
      // Check if booking exists
      const booking = await Booking.findOne({ bookingId: data.bookingId });
      if (!booking) {
        throw new NotFoundError('Booking not found');
      }

      // Check if booking is completed
      if (booking.status !== 'completed') {
        throw new ConflictError('Can only rate completed bookings');
      }

      // Check if rating already exists
      const existingRating = await Rating.findOne({
        bookingId: data.bookingId,
        userId: data.userId,
      });

      if (existingRating) {
        throw new ConflictError('Rating already exists for this booking');
      }

      // Create rating
      const ratingId = generateUserId('RAT');
      const rating = await Rating.create({
        ratingId,
        ...data,
      });

      // Update user rating (aggregate)
      await this.updateUserRating(data.ratedUserId, data.serviceType);

      logger.info(`Rating created: ${ratingId}`);

      return rating.toJSON();
    } catch (error) {
      logger.error('Error creating rating:', error);
      throw error;
    }
  }

  /**
   * Get rating by ID
   */
  async getRatingById(ratingId: string): Promise<any> {
    try {
      const rating = await Rating.findOne({ ratingId });
      if (!rating) {
        throw new NotFoundError('Rating not found');
      }
      return rating.toJSON();
    } catch (error) {
      logger.error('Error getting rating by ID:', error);
      throw error;
    }
  }

  /**
   * Get user ratings
   */
  async getUserRatings(ratedUserId: string, serviceType?: ServiceType): Promise<any[]> {
    try {
      const query: any = { ratedUserId };
      if (serviceType) {
        query.serviceType = serviceType;
      }

      const ratings = await Rating.find(query)
        .sort({ createdAt: -1 })
        .limit(50);

      return ratings.map((r) => r.toJSON());
    } catch (error) {
      logger.error('Error getting user ratings:', error);
      throw error;
    }
  }

  /**
   * Get booking rating
   */
  async getBookingRating(bookingId: string): Promise<any | null> {
    try {
      const rating = await Rating.findOne({ bookingId });
      return rating ? rating.toJSON() : null;
    } catch (error) {
      logger.error('Error getting booking rating:', error);
      throw error;
    }
  }

  /**
   * Update rating
   */
  async updateRating(
    ratingId: string,
    userId: string,
    data: {
      overallRating?: number;
      punctuality?: number;
      vehicleCondition?: number;
      driving?: number;
      service?: number;
      comment?: string;
    }
  ): Promise<any> {
    try {
      const rating = await Rating.findOne({ ratingId, userId });
      if (!rating) {
        throw new NotFoundError('Rating not found');
      }

      // Update fields
      if (data.overallRating !== undefined) rating.overallRating = data.overallRating;
      if (data.punctuality !== undefined) rating.punctuality = data.punctuality;
      if (data.vehicleCondition !== undefined) rating.vehicleCondition = data.vehicleCondition;
      if (data.driving !== undefined) rating.driving = data.driving;
      if (data.service !== undefined) rating.service = data.service;
      if (data.comment !== undefined) rating.comment = data.comment;

      await rating.save();

      // Update user rating (aggregate)
      await this.updateUserRating(rating.ratedUserId, rating.serviceType);

      logger.info(`Rating updated: ${ratingId}`);

      return rating.toJSON();
    } catch (error) {
      logger.error('Error updating rating:', error);
      throw error;
    }
  }

  /**
   * Delete rating
   */
  async deleteRating(ratingId: string, userId: string): Promise<void> {
    try {
      const rating = await Rating.findOne({ ratingId, userId });
      if (!rating) {
        throw new NotFoundError('Rating not found');
      }

      const ratedUserId = rating.ratedUserId;
      const serviceType = rating.serviceType;

      await Rating.deleteOne({ ratingId });

      // Update user rating (aggregate)
      await this.updateUserRating(ratedUserId, serviceType);

      logger.info(`Rating deleted: ${ratingId}`);
    } catch (error) {
      logger.error('Error deleting rating:', error);
      throw error;
    }
  }

  /**
   * Update user rating aggregate
   */
  private async updateUserRating(ratedUserId: string, serviceType: ServiceType): Promise<void> {
    try {
      const ratings = await Rating.find({ ratedUserId, serviceType });
      
      if (ratings.length === 0) {
        return;
      }

      const totalRating = ratings.reduce((sum, r) => sum + r.overallRating, 0);
      const averageRating = totalRating / ratings.length;

      const user = await User.findOne({ userId: ratedUserId });
      if (user) {
        user.rating = parseFloat(averageRating.toFixed(2));
        user.totalReviews = ratings.length;
        await user.save();
      }
    } catch (error) {
      logger.error('Error updating user rating:', error);
    }
  }
}

export const ratingService = new RatingService();
export default ratingService;
