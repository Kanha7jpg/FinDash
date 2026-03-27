import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/environment.js';
import { collectMetrics, metricsContentType } from '../middleware/monitoring.js';

function verifyMonitoringAccess(req: Request, res: Response, next: NextFunction) {
  if (!env.MONITORING_API_KEY) {
    return next();
  }

  const key = req.headers['x-monitoring-key'];

  if (typeof key !== 'string' || key !== env.MONITORING_API_KEY) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  return next();
}

export const monitoringRouter = Router();

monitoringRouter.get('/monitoring/healthz', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

monitoringRouter.get('/monitoring/metrics', verifyMonitoringAccess, async (_req: Request, res: Response) => {
  const metrics = await collectMetrics();
  res.setHeader('Content-Type', metricsContentType());
  res.status(200).send(metrics);
});
