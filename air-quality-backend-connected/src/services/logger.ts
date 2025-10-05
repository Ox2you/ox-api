
import pino from 'pino';
import pinoHttp from 'pino-http';
function buildLogger() {
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) return pino({ level: process.env.LOG_LEVEL || 'info' });
  try {
    return pino({
      level: process.env.LOG_LEVEL || 'info',
      transport: { target: 'pino-pretty', options: { colorize: true } }
    });
  } catch {
    return pino({ level: process.env.LOG_LEVEL || 'info' });
  }
}
export const logger = buildLogger();
export const httpLogger = pinoHttp({ logger });
