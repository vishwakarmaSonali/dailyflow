import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import rateLimit from 'express-rate-limit';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { healthRouter } from './routes/health.routes';

const logger = pino();
const app = express();
const PORT = process.env.GATEWAY_PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(pinoHttp({ logger }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests, please try again later.',
});
app.use(limiter);

// Health routes (no auth required)
app.use('/health', healthRouter);

// API Routes with proxy to downstream services
const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const habitServiceUrl = process.env.HABIT_SERVICE_URL || 'http://localhost:3002';
const expenseServiceUrl = process.env.EXPENSE_SERVICE_URL || 'http://localhost:3003';
const analyticsServiceUrl = process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3004';
const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3005';
const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Proxy routes
app.use(
  '/auth',
  createProxyMiddleware({
    target: authServiceUrl,
    changeOrigin: true,
    pathRewrite: { '^/auth': '' },
  })
);

app.use(
  '/habits',
  createProxyMiddleware({
    target: habitServiceUrl,
    changeOrigin: true,
    pathRewrite: { '^/habits': '' },
  })
);

app.use(
  '/expenses',
  createProxyMiddleware({
    target: expenseServiceUrl,
    changeOrigin: true,
    pathRewrite: { '^/expenses': '' },
  })
);

app.use(
  '/analytics',
  createProxyMiddleware({
    target: analyticsServiceUrl,
    changeOrigin: true,
    pathRewrite: { '^/analytics': '' },
  })
);

app.use(
  '/notifications',
  createProxyMiddleware({
    target: notificationServiceUrl,
    changeOrigin: true,
    pathRewrite: { '^/notifications': '' },
  })
);

app.use(
  '/ai',
  createProxyMiddleware({
    target: aiServiceUrl,
    changeOrigin: true,
    pathRewrite: { '^/ai': '' },
  })
);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error(err, 'Unhandled error');
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  logger.info(`API Gateway listening on http://localhost:${PORT}`);
});

export default app;
