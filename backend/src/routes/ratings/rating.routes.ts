import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ratingService } from '../../services/rating.service';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { z } from 'zod';
import { ApiResponse, ServiceType } from '../../types';

// Request schemas
const createRatingSchema = z.object({
  bookingId: z.string(),
  ratedUserId: z.string(),
  serviceType: z.enum(['pooling', 'rental']),
  overallRating: z.number().min(1).max(5),
  punctuality: z.number().min(1).max(5).optional(),
  vehicleCondition: z.number().min(1).max(5).optional(),
  driving: z.number().min(1).max(5).optional(),
  service: z.number().min(1).max(5).optional(),
  comment: z.string().max(1000).optional(),
});

const updateRatingSchema = z.object({
  overallRating: z.number().min(1).max(5).optional(),
  punctuality: z.number().min(1).max(5).optional(),
  vehicleCondition: z.number().min(1).max(5).optional(),
  driving: z.number().min(1).max(5).optional(),
  service: z.number().min(1).max(5).optional(),
  comment: z.string().max(1000).optional(),
});

export async function ratingRoutes(fastify: FastifyInstance) {
  /**
   * POST /api/ratings
   * Create rating (authenticated)
   */
  fastify.post(
    '/',
    {
      preHandler: [authenticate, validate(createRatingSchema)],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = (request as any).user.userId;
      const data = request.body as any;

      const rating = await ratingService.createRating({
        userId,
        ...data,
      });

      const response: ApiResponse = {
        success: true,
        message: 'Rating submitted successfully',
        data: rating,
      };

      return reply.status(201).send(response);
    }
  );

  /**
   * GET /api/ratings/:ratingId
   * Get rating by ID
   */
  fastify.get(
    '/:ratingId',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { ratingId } = request.params as { ratingId: string };

      const rating = await ratingService.getRatingById(ratingId);

      const response: ApiResponse = {
        success: true,
        message: 'Rating retrieved successfully',
        data: rating,
      };

      return reply.status(200).send(response);
    }
  );

  /**
   * GET /api/ratings/user/:userId
   * Get user ratings
   */
  fastify.get(
    '/user/:userId',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { userId } = request.params as { userId: string };
      const { serviceType } = request.query as { serviceType?: string };

      const ratings = await ratingService.getUserRatings(
        userId,
        serviceType as ServiceType | undefined
      );

      const response: ApiResponse = {
        success: true,
        message: 'Ratings retrieved successfully',
        data: ratings,
      };

      return reply.status(200).send(response);
    }
  );

  /**
   * GET /api/ratings/booking/:bookingId
   * Get booking rating
   */
  fastify.get(
    '/booking/:bookingId',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { bookingId } = request.params as { bookingId: string };

      const rating = await ratingService.getBookingRating(bookingId);

      const response: ApiResponse = {
        success: true,
        message: 'Rating retrieved successfully',
        data: rating,
      };

      return reply.status(200).send(response);
    }
  );

  /**
   * PUT /api/ratings/:ratingId
   * Update rating (authenticated)
   */
  fastify.put(
    '/:ratingId',
    {
      preHandler: [authenticate, validate(updateRatingSchema)],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = (request as any).user.userId;
      const { ratingId } = request.params as { ratingId: string };
      const data = request.body as any;

      const rating = await ratingService.updateRating(ratingId, userId, data);

      const response: ApiResponse = {
        success: true,
        message: 'Rating updated successfully',
        data: rating,
      };

      return reply.status(200).send(response);
    }
  );

  /**
   * DELETE /api/ratings/:ratingId
   * Delete rating (authenticated)
   */
  fastify.delete(
    '/:ratingId',
    {
      preHandler: [authenticate],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = (request as any).user.userId;
      const { ratingId } = request.params as { ratingId: string };

      await ratingService.deleteRating(ratingId, userId);

      const response: ApiResponse = {
        success: true,
        message: 'Rating deleted successfully',
      };

      return reply.status(200).send(response);
    }
  );
}
