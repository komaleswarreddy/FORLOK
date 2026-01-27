import Feedback from '../models/Feedback';
import { generateUserId } from '../utils/helpers';
import { NotFoundError } from '../utils/errors';
import logger from '../utils/logger';
import { FeedbackType, FeedbackStatus, FeedbackPriority } from '../types';

class FeedbackService {
  /**
   * Submit feedback
   */
  async submitFeedback(data: {
    userId: string;
    type: FeedbackType;
    subject: string;
    description: string;
    priority?: FeedbackPriority;
  }): Promise<any> {
    try {
      const feedbackId = generateUserId('FB');
      const feedback = await Feedback.create({
        feedbackId,
        ...data,
        priority: data.priority || 'medium',
        status: 'pending',
      });

      logger.info(`Feedback submitted: ${feedbackId}`);

      return feedback.toJSON();
    } catch (error) {
      logger.error('Error submitting feedback:', error);
      throw error;
    }
  }

  /**
   * Get user feedback
   */
  async getUserFeedback(
    userId: string,
    filters?: {
      status?: FeedbackStatus;
      type?: FeedbackType;
      page?: number;
      limit?: number;
    }
  ): Promise<{ feedback: any[]; total: number; page: number; limit: number }> {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const skip = (page - 1) * limit;

      const query: any = { userId };

      if (filters?.status) {
        query.status = filters.status;
      }

      if (filters?.type) {
        query.type = filters.type;
      }

      const total = await Feedback.countDocuments(query);
      const feedback = await Feedback.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return {
        feedback: feedback.map((f) => f.toJSON()),
        total,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Error getting user feedback:', error);
      throw error;
    }
  }

  /**
   * Get feedback by ID
   */
  async getFeedbackById(feedbackId: string, userId?: string): Promise<any> {
    try {
      const query: any = { feedbackId };
      if (userId) {
        query.userId = userId;
      }

      const feedback = await Feedback.findOne(query);
      if (!feedback) {
        throw new NotFoundError('Feedback not found');
      }

      return feedback.toJSON();
    } catch (error) {
      logger.error('Error getting feedback by ID:', error);
      throw error;
    }
  }
}

export const feedbackService = new FeedbackService();
export default feedbackService;
