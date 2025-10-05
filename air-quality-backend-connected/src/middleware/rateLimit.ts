
import rateLimit from 'express-rate-limit';
import type { Env } from '../services/validators.js';
export function buildGlobalLimiter(env: Env) {
  return rateLimit({ windowMs: env.RATE_LIMIT_WINDOW_MS, max: env.RATE_LIMIT_MAX, standardHeaders: true, legacyHeaders: false });
}
export function buildHeatmapLimiter(env: Env) {
  return rateLimit({ windowMs: env.HEATMAP_RATE_LIMIT_WINDOW_MS, max: env.HEATMAP_RATE_LIMIT_MAX, standardHeaders: true, legacyHeaders: false });
}
