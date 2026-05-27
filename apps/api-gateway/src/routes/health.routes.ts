import { Router } from 'express';
import axios from 'axios';

export const healthRouter = Router();

interface ServiceHealth {
  service: string;
  status: 'up' | 'down';
  responseTime: number;
}

async function checkServiceHealth(name: string, url: string): Promise<ServiceHealth> {
  const startTime = Date.now();
  try {
    await axios.get(`${url}/health`, { timeout: 5000 });
    return {
      service: name,
      status: 'up',
      responseTime: Date.now() - startTime,
    };
  } catch {
    return {
      service: name,
      status: 'down',
      responseTime: Date.now() - startTime,
    };
  }
}

healthRouter.get('/', async (req, res) => {
  try {
    const services = [
      { name: 'auth', url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001' },
      { name: 'habit', url: process.env.HABIT_SERVICE_URL || 'http://localhost:3002' },
      { name: 'expense', url: process.env.EXPENSE_SERVICE_URL || 'http://localhost:3003' },
      { name: 'analytics', url: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3004' },
      {
        name: 'notification',
        url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3005',
      },
      { name: 'ai', url: process.env.AI_SERVICE_URL || 'http://localhost:8000' },
    ];

    const healthChecks = await Promise.all(
      services.map((s) => checkServiceHealth(s.name, s.url))
    );

    const allHealthy = healthChecks.every((h) => h.status === 'up');
    const statusCode = allHealthy ? 200 : 503;

    res.status(statusCode).json({
      status: allHealthy ? 'healthy' : 'degraded',
      gateway: 'up',
      timestamp: new Date().toISOString(),
      services: healthChecks,
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: 'Failed to check health',
      timestamp: new Date().toISOString(),
    });
  }
});
