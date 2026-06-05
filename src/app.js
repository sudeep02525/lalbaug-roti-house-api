import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve static files from the public directory
app.use(express.static(path.join(process.cwd(), 'public')));

// Basic route
app.get('/', (req, res) => {
  res.send('Lalbaug Roti House API is running...');
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

// Error Handling
app.use(notFound);
app.use(errorHandler);

export default app;
