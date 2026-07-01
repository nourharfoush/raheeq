import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger';

// Load Env variables
dotenv.config();

// Import Routes
import authRoutes from './modules/auth/auth.controller';
import halaqatRoutes from './modules/halaqat/halaqat.controller';
import progressRoutes from './modules/progress/progress.controller';
import paymentRoutes from './modules/payments/payments.controller';
import notificationRoutes from './modules/notifications/notifications.controller';

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Security and utility Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Turn off for Swagger and local development ease
}));
app.use(cors({
  origin: '*', // Allow all for local and docker environments
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Main marketing or status endpoint
app.get('/', (_req, res) => {
  res.status(200).json({
    name: 'Tahfez Quran Platform API',
    status: 'ONLINE',
    version: '1.0.0',
    documentation: 'http://localhost:5000/api/docs'
  });
});

// Swagger API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/halaqat', halaqatRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/subscriptions', paymentRoutes);
app.use('/api/notifications', notificationRoutes);

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'حدث خطأ غير متوقع في الخادم الداخلي'
  });
});

// Start Server
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=============================================`);
    console.log(`🕋 Tahfez Platform Server is running!`);
    console.log(`🌐 API Base URL: http://0.0.0.0:${PORT}`);
    console.log(`📚 Swagger documentation at: http://localhost:${PORT}/api/docs`);
    console.log(`=============================================`);
  });
}

export default app;
