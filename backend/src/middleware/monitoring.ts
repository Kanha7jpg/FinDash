import type { NextFunction, Request, Response } from 'express';
import { collectDefaultMetrics, Counter, Histogram, Registry } from 'prom-client';

const registry = new Registry();

collectDefaultMetrics({
  register: registry,
  prefix: 'findash_'
});

const httpRequestDurationMs = new Histogram({
  name: 'findash_http_request_duration_ms',
  help: 'HTTP request duration in milliseconds',
  labelNames: ['method', 'route', 'status_code'] as const,
  buckets: [5, 10, 25, 50, 100, 200, 400, 800, 1500, 3000],
  registers: [registry]
});

const httpRequestsTotal = new Counter({
  name: 'findash_http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code'] as const,
  registers: [registry]
});

function getRouteLabel(req: Request): string {
  return req.route?.path ? `${req.baseUrl || ''}${req.route.path}` : req.path;
}

export function monitoringMiddleware(req: Request, res: Response, next: NextFunction) {
  const endTimer = httpRequestDurationMs.startTimer();

  res.on('finish', () => {
    const method = req.method;
    const route = getRouteLabel(req);
    const statusCode = String(res.statusCode);

    httpRequestsTotal.inc({ method, route, status_code: statusCode });
    endTimer({ method, route, status_code: statusCode });
  });

  next();
}

export function metricsContentType(): string {
  return registry.contentType;
}

export async function collectMetrics(): Promise<string> {
  return registry.metrics();
}
