
import { Request, Response, NextFunction } from 'express';
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = typeof err?.status === 'number' ? err.status : 500;
  const payload: any = { error: err?.message || 'Internal Server Error' };
  if (err?.details) payload.details = err.details;
  res.status(status).json(payload);
}
