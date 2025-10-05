
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { httpLogger } from './services/logger.js';
import { envSchema } from './services/validators.js';
import { buildGlobalLimiter, buildHeatmapLimiter } from './middleware/rateLimit.js';
import { errorHandler } from './middleware/errorHandler.js';
import { locationsRouter } from './routes/locations.js';
import { geoRouter } from './routes/geo.js';
import { airRouter } from './routes/air.js';
import { healthRouter } from './routes/health.js';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import YAML from 'yaml';

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('[env] invalid configuration', parsed.error.flatten());
  process.exit(1);
}
const env = parsed.data;

const app = express();
app.use(httpLogger);
app.use(express.json());

const origins = env.CORS_ORIGINS.split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || origins.length === 0 || origins.includes(origin)) return cb(null, true);
    return cb(new Error('CORS: origin not allowed'), false);
  }
}));

app.use(buildGlobalLimiter(env));
app.use('/api/geo', buildHeatmapLimiter(env));

app.use('/api/locations', locationsRouter);
app.use('/api/geo', geoRouter);
app.use('/api/air', airRouter);
app.use('/health', healthRouter);

const yamlPath = path.join(process.cwd(), 'docs', 'openapi.yaml');
const raw = fs.readFileSync(yamlPath, 'utf-8');
const spec = YAML.parse(raw);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));
app.get('/docs/openapi.json', (_req, res) => res.json(spec));

app.use(errorHandler);
const PORT = env.PORT;
app.listen(PORT, () => console.log(`[server] http://localhost:${PORT}`));
