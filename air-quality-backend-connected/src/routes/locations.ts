
import { Router } from 'express';
import { z } from 'zod';
import { findLocationsByName, findLocationsNear } from '../services/dal.js';

export const locationsRouter = Router();

locationsRouter.get('/search', async (req, res) => {
  const p = z.string().min(1).safeParse(req.query.q);
  if (!p.success) return res.status(400).json({ error: 'Invalid query', details: p.error.flatten() });
  const q = p.data;
  const rows = await findLocationsByName(q);
  res.json(rows);
});

locationsRouter.get('/near', async (req, res) => {
  const schema = z.object({
    lat: z.coerce.number().min(-90).max(90),
    lon: z.coerce.number().min(-180).max(180),
    radius_km: z.coerce.number().min(1).max(500).default(50)
  });
  const p = schema.safeParse(req.query);
  if (!p.success) return res.status(400).json({ error: 'Invalid query', details: p.error.flatten() });
  const { lat, lon, radius_km } = p.data;
  const rows = await findLocationsNear(lat, lon, radius_km);
  res.json(rows);
});
