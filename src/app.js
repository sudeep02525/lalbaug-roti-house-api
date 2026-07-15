import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { errorHandler, notFound } from './middleware/error.middleware.js';

import adminRoutes from './routes/admin.routes.js';
import deliveryBoyRoutes from './routes/deliveryBoy.routes.js';
import catalogRoutes from './routes/catalog.routes.js';
import orderRoutes from './routes/order.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import videoRoutes from './routes/video.routes.js';
import reviewRoutes from './routes/review.routes.js';
import userRoutes from './routes/user.routes.js';
import cmsRoutes from './routes/cms.routes.js';
import pushRoutes from './routes/push.routes.js';

const app = express();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: function (origin, callback) {
    callback(null, true);
  },
  credentials: true
}));
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Global API Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict Auth Rate Limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per `window`
  message: { message: 'Too many login attempts from this IP, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiter to all API routes
app.use('/api/', apiLimiter);

// Apply strict limiter to sensitive auth routes
const authRoutes = [
  '/api/v1/users/login',
  '/api/v1/users/signup',
  '/api/v1/users/verify-otp',
  '/api/v1/users/forgot-password',
  '/api/v1/admin/login',
  '/api/v1/admin/forgot-password',
  '/api/v1/delivery-boy/login',
  '/api/v1/cms/login'
];
app.use(authRoutes, authLimiter);

// Serve static files from the public directory
app.use(express.static(path.join(process.cwd(), 'public')));

// Basic route
app.get('/', (req, res) => {
  res.send('Lalbaug Roti House API is running...');
});

// Health check routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

app.get('/api', (req, res) => {
  res.status(200).json({ status: 'API is running', version: 'v1', timestamp: new Date() });
});

// Routes will be mounted here
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/delivery-boy', deliveryBoyRoutes);
app.use('/api/v1/catalog', catalogRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/videos', videoRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/cms', cmsRoutes);
app.use('/api/v1/push', pushRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

export default app;
