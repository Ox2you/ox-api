
import { z } from 'zod';
export const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  CORS_ORIGINS: z.string().default(''),
  DATABASE_URL: z.string().min(1),
  HEATMAP_CACHE_TTL: z.coerce.number().default(300),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX: z.coerce.number().default(120),
  HEATMAP_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  HEATMAP_RATE_LIMIT_MAX: z.coerce.number().default(60),
  REDIS_URL: z.string().optional(),
  PG_STRICT_SSL: z.string().optional(),
  PG_SKIP_TLS_VERIFY: z.string().optional(),
  PG_SSL_CA_PATH: z.string().optional(),
  PG_SSL_CA: z.string().optional()
});
export type Env = z.infer<typeof envSchema>;
