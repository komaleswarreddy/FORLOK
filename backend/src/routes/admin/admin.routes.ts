import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { adminService } from '../../services/admin.service';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware';
import { ApiResponse } from '../../types';

export async function adminRoutes(fastify: FastifyInstance) {
  /**
   * GET /api/admin/dashboard/stats
   * Get dashboard statistics (admin)
   */
  fastify.get(
    '/dashboard/stats',
    {
      preHandler: [authenticate, requireAdmin],
    },
    async (_request: FastifyRequest, reply: FastifyReply) => {
      const stats = await adminService.getDashboardStats();

      const response: ApiResponse = {
        success: true,
        message: 'Dashboard statistics retrieved successfully',
        data: stats,
      };

      return reply.status(200).send(response);
    }
  );

  /**
   * GET /api/admin/users
   * Get all users (admin)
   */
  fastify.get(
    '/users',
    {
      preHandler: [authenticate, requireAdmin],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const query = request.query as {
        status?: string;
        userType?: string;
        verified?: string;
        page?: string;
        limit?: string;
      };

      const filters: any = {};
      if (query.status) filters.status = query.status;
      if (query.userType) filters.userType = query.userType;
      if (query.verified !== undefined) filters.verified = query.verified === 'true';
      if (query.page) filters.page = parseInt(query.page);
      if (query.limit) filters.limit = parseInt(query.limit);

      const result = await adminService.getAllUsers(filters);

      const response: ApiResponse = {
        success: true,
        message: 'Users retrieved successfully',
        data: result,
      };

      return reply.status(200).send(response);
    }
  );

  /**
   * GET /api/admin/users/:userId
   * Get user details (admin)
   */
  fastify.get(
    '/users/:userId',
    {
      preHandler: [authenticate, requireAdmin],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { userId } = request.params as { userId: string };

      const userDetails = await adminService.getUserDetails(userId);

      const response: ApiResponse = {
        success: true,
        message: 'User details retrieved successfully',
        data: userDetails,
      };

      return reply.status(200).send(response);
    }
  );

  /**
   * PUT /api/admin/users/:userId/verify
   * Verify user (admin)
   */
  fastify.put(
    '/users/:userId/verify',
    {
      preHandler: [authenticate, requireAdmin],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { userId } = request.params as { userId: string };

      const user = await adminService.verifyUser(userId);

      const response: ApiResponse = {
        success: true,
        message: 'User verified successfully',
        data: user,
      };

      return reply.status(200).send(response);
    }
  );

  /**
   * PUT /api/admin/users/:userId/suspend
   * Suspend user (admin)
   */
  fastify.put(
    '/users/:userId/suspend',
    {
      preHandler: [authenticate, requireAdmin],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { userId } = request.params as { userId: string };

      const user = await adminService.suspendUser(userId);

      const response: ApiResponse = {
        success: true,
        message: 'User suspended successfully',
        data: user,
      };

      return reply.status(200).send(response);
    }
  );

  /**
   * PUT /api/admin/users/:userId/activate
   * Activate user (admin)
   */
  fastify.put(
    '/users/:userId/activate',
    {
      preHandler: [authenticate, requireAdmin],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { userId } = request.params as { userId: string };

      const user = await adminService.activateUser(userId);

      const response: ApiResponse = {
        success: true,
        message: 'User activated successfully',
        data: user,
      };

      return reply.status(200).send(response);
    }
  );

  /**
   * GET /api/admin/pooling/offers
   * Get all pooling offers (admin)
   */
  fastify.get(
    '/pooling/offers',
    {
      preHandler: [authenticate, requireAdmin],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const query = request.query as {
        status?: string;
        page?: string;
        limit?: string;
      };

      const filters: any = {};
      if (query.status) filters.status = query.status;
      if (query.page) filters.page = parseInt(query.page);
      if (query.limit) filters.limit = parseInt(query.limit);

      const result = await adminService.getAllPoolingOffers(filters);

      const response: ApiResponse = {
        success: true,
        message: 'Pooling offers retrieved successfully',
        data: result,
      };

      return reply.status(200).send(response);
    }
  );

  /**
   * PUT /api/admin/pooling/offers/:offerId/approve
   * Approve pooling offer (admin)
   */
  fastify.put(
    '/pooling/offers/:offerId/approve',
    {
      preHandler: [authenticate, requireAdmin],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { offerId } = request.params as { offerId: string };

      const offer = await adminService.approvePoolingOffer(offerId);

      const response: ApiResponse = {
        success: true,
        message: 'Pooling offer approved successfully',
        data: offer,
      };

      return reply.status(200).send(response);
    }
  );

  /**
   * PUT /api/admin/pooling/offers/:offerId/suspend
   * Suspend pooling offer (admin)
   */
  fastify.put(
    '/pooling/offers/:offerId/suspend',
    {
      preHandler: [authenticate, requireAdmin],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { offerId } = request.params as { offerId: string };

      const offer = await adminService.suspendPoolingOffer(offerId);

      const response: ApiResponse = {
        success: true,
        message: 'Pooling offer suspended successfully',
        data: offer,
      };

      return reply.status(200).send(response);
    }
  );

  /**
   * GET /api/admin/rental/offers
   * Get all rental offers (admin)
   */
  fastify.get(
    '/rental/offers',
    {
      preHandler: [authenticate, requireAdmin],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const query = request.query as {
        status?: string;
        page?: string;
        limit?: string;
      };

      const filters: any = {};
      if (query.status) filters.status = query.status;
      if (query.page) filters.page = parseInt(query.page);
      if (query.limit) filters.limit = parseInt(query.limit);

      const result = await adminService.getAllRentalOffers(filters);

      const response: ApiResponse = {
        success: true,
        message: 'Rental offers retrieved successfully',
        data: result,
      };

      return reply.status(200).send(response);
    }
  );

  /**
   * PUT /api/admin/rental/offers/:offerId/approve
   * Approve rental offer (admin)
   */
  fastify.put(
    '/rental/offers/:offerId/approve',
    {
      preHandler: [authenticate, requireAdmin],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { offerId } = request.params as { offerId: string };

      const offer = await adminService.approveRentalOffer(offerId);

      const response: ApiResponse = {
        success: true,
        message: 'Rental offer approved successfully',
        data: offer,
      };

      return reply.status(200).send(response);
    }
  );

  /**
   * PUT /api/admin/rental/offers/:offerId/suspend
   * Suspend rental offer (admin)
   */
  fastify.put(
    '/rental/offers/:offerId/suspend',
    {
      preHandler: [authenticate, requireAdmin],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { offerId } = request.params as { offerId: string };

      const offer = await adminService.suspendRentalOffer(offerId);

      const response: ApiResponse = {
        success: true,
        message: 'Rental offer suspended successfully',
        data: offer,
      };

      return reply.status(200).send(response);
    }
  );

  /**
   * GET /api/admin/bookings
   * Get all bookings (admin)
   */
  fastify.get(
    '/bookings',
    {
      preHandler: [authenticate, requireAdmin],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const query = request.query as {
        status?: string;
        serviceType?: string;
        page?: string;
        limit?: string;
      };

      const filters: any = {};
      if (query.status) filters.status = query.status;
      if (query.serviceType) filters.serviceType = query.serviceType;
      if (query.page) filters.page = parseInt(query.page);
      if (query.limit) filters.limit = parseInt(query.limit);

      const result = await adminService.getAllBookings(filters);

      const response: ApiResponse = {
        success: true,
        message: 'Bookings retrieved successfully',
        data: result,
      };

      return reply.status(200).send(response);
    }
  );

  /**
   * GET /api/admin/feedback
   * Get all feedback (admin)
   */
  fastify.get(
    '/feedback',
    {
      preHandler: [authenticate, requireAdmin],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const query = request.query as {
        status?: string;
        type?: string;
        priority?: string;
        page?: string;
        limit?: string;
      };

      const filters: any = {};
      if (query.status) filters.status = query.status;
      if (query.type) filters.type = query.type;
      if (query.priority) filters.priority = query.priority;
      if (query.page) filters.page = parseInt(query.page);
      if (query.limit) filters.limit = parseInt(query.limit);

      const result = await adminService.getAllFeedback(filters);

      const response: ApiResponse = {
        success: true,
        message: 'Feedback retrieved successfully',
        data: result,
      };

      return reply.status(200).send(response);
    }
  );

  /**
   * PUT /api/admin/feedback/:feedbackId/resolve
   * Resolve feedback (admin)
   */
  fastify.put(
    '/feedback/:feedbackId/resolve',
    {
      preHandler: [authenticate, requireAdmin],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const adminId = (request as any).user.userId;
      const { feedbackId } = request.params as { feedbackId: string };
      const { response } = request.body as { response?: string };

      const feedback = await adminService.resolveFeedback(feedbackId, adminId, response);

      const responseData: ApiResponse = {
        success: true,
        message: 'Feedback resolved successfully',
        data: feedback,
      };

      return reply.status(200).send(responseData);
    }
  );
}
