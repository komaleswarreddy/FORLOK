// Route index file
import { FastifyInstance } from 'fastify';
import { authRoutes } from './auth/auth.routes';
import { adminAuthRoutes } from './admin/auth.routes';
import { foodRoutes } from './food/food.routes';
import { userRoutes } from './users/user.routes';
import { companyRoutes } from './companies/company.routes';
import { vehicleRoutes } from './vehicles/vehicle.routes';
import { documentRoutes } from './documents/document.routes';
import { poolingRoutes } from './pooling/pooling.routes';
import { rentalRoutes } from './rental/rental.routes';
import { bookingRoutes } from './bookings/booking.routes';
import { paymentRoutes } from './payments/payment.routes';
import { ratingRoutes } from './ratings/rating.routes';
import { notificationRoutes } from './notifications/notification.routes';
import { feedbackRoutes } from './feedback/feedback.routes';
import { adminRoutes } from './admin/admin.routes';
import { trackingRoutes } from './tracking/tracking.routes';
import { dashboardRoutes } from './dashboard/dashboard.routes';
import { chatRoutes } from './chat/index';

export async function registerRoutes(app: FastifyInstance) {
  // Auth routes
  await app.register(authRoutes, { prefix: '/api/auth' });

  // Admin auth routes
  await app.register(adminAuthRoutes, { prefix: '/api/admin/auth' });

  // Food routes
  await app.register(foodRoutes, { prefix: '/api/food' });

  // User routes
  await app.register(userRoutes, { prefix: '/api/users' });

  // Company routes
  await app.register(companyRoutes, { prefix: '/api/companies' });

  // Vehicle routes
  await app.register(vehicleRoutes, { prefix: '/api/vehicles' });

  // Document routes
  await app.register(documentRoutes, { prefix: '/api/documents' });

  // Pooling routes
  await app.register(poolingRoutes, { prefix: '/api/pooling' });

  // Rental routes
  await app.register(rentalRoutes, { prefix: '/api/rental' });

  // Booking routes
  await app.register(bookingRoutes, { prefix: '/api/bookings' });

  // Payment routes
  await app.register(paymentRoutes, { prefix: '/api/payments' });

  // Rating routes
  await app.register(ratingRoutes, { prefix: '/api/ratings' });

  // Notification routes
  await app.register(notificationRoutes, { prefix: '/api/notifications' });

  // Feedback routes
  await app.register(feedbackRoutes, { prefix: '/api/feedback' });

  // Admin routes
  await app.register(adminRoutes, { prefix: '/api/admin' });

  // Tracking routes
  await app.register(trackingRoutes, { prefix: '/api/tracking' });

  // Dashboard routes
  await app.register(dashboardRoutes, { prefix: '/api/dashboard' });

  // Chat routes
  await app.register(chatRoutes, { prefix: '/api/chat' });

  // Other routes will be registered here as we implement them
  // await app.register(userRoutes, { prefix: '/api/users' });
  // await app.register(companyRoutes, { prefix: '/api/companies' });
  // await app.register(vehicleRoutes, { prefix: '/api/vehicles' });
  // await app.register(poolingRoutes, { prefix: '/api/pooling' });
  // await app.register(rentalRoutes, { prefix: '/api/rental' });
  // await app.register(bookingRoutes, { prefix: '/api/bookings' });
  // await app.register(paymentRoutes, { prefix: '/api/payments' });
  // await app.register(documentRoutes, { prefix: '/api/documents' });
  // await app.register(ratingRoutes, { prefix: '/api/ratings' });
  // await app.register(notificationRoutes, { prefix: '/api/notifications' });
  // await app.register(feedbackRoutes, { prefix: '/api/feedback' });

  app.log.info('✅ Routes registered');
}
