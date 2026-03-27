import pino from 'pino';
import { pinoHttp } from 'pino-http';
import { env } from '../config/environment.js';

const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie'],
    remove: true
  }
});

export const requestLogger = pinoHttp({
  logger,
  autoLogging: env.ENABLE_REQUEST_LOGGING,
  customAttributeKeys: {
    req: 'request',
    res: 'response'
  }
});
