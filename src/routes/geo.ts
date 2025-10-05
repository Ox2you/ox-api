
import { Router } from 'express';
import { z } from 'zod';
import { getObservationsInArea, findLocationById } from '../services/dal.js';
import { makeGeoJSON } from '../services/geojson.js';
import { colorFor } from '../services/scales.js';
import { cacheGet, cacheSet } from '../services/cache.js';
import crypto from 'crypto';

export const geoRouter = Router();
const schema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  pollutant: z.enum(['AOD','NO2','SO2']).default('SO2'),
  radius_km: z.coerce.number().min(10).max(1000).default(100)
});

function etagFor(obj: any) {
  const json = JSON.stringify(obj);
  return 'W/"' + crypto.createHash('sha1').update(json).digest('hex') + '"';
}

geoRouter.get('/heatmap', async (req, res) => {
  const p = schema.safeParse(req.query);
  if (!p.success) return res.status(400).json({ error: 'Invalid query', details: p.error.flatten() });
  const { lat, lon, radius_km, pollutant } = p.data;
  const day = p.data.date ?? new Date().toISOString().slice(0,10);
  const cacheKey = `heatmap:${pollutant}:${day}:${lat.toFixed(3)},${lon.toFixed(3)}:${radius_km}`;
  const ttl = Number(process.env.HEATMAP_CACHE_TTL || 300);
  const cached = await cacheGet<any>(cacheKey);
  // if (cached) {
  //   const tag = etagFor(cached);
  //   if (req.headers['if-none-match'] === tag) return res.status(304).end();
  //   res.setHeader('ETag', tag);
  //   res.setHeader('Cache-Control', `public, max-age=${ttl}`);
  //   return res.json(cached);
  // }

  const ddeg = radius_km / 111.0;
  //console.log('ENTROU!');
  const rows = await getObservationsInArea(day, 'SO2', lat - ddeg, lat + ddeg, lon - ddeg, lon + ddeg);
  const cell = 0.2;
  const buckets = new Map<string, { lat: number; lon: number; values: number[] }>();
  for (const r of rows) {
    if (r.value == null) continue;
    const gx = Math.round(Number(r.lat) / cell) * cell;
    const gy = Math.round(Number(r.lon) / cell) * cell;
    const key = `${gx.toFixed(3)},${gy.toFixed(3)}`;
    const b = buckets.get(key) || { lat: gx, lon: gy, values: [] };
    b.values.push(Number(r.value));
    buckets.set(key, b);
  }

  const points = [...buckets.values()].map(b => {
    const v = b.values.reduce((a,c)=>a+c,0) / b.values.length;
    const { color, band, unit } = colorFor(pollutant, v);
    return { lat: b.lat, lon: b.lon, value: v, color, band, unit };
  });
  const fc = makeGeoJSON(points as any, { pollutant, radius_km });
  await cacheSet(cacheKey, fc, ttl);

  const tag = etagFor(fc);
  res.setHeader('ETag', tag);
  res.setHeader('Cache-Control', `public, max-age=${ttl}`);
  res.json(fc);
});

geoRouter.get('/heatmap/by-location/:id', async (req, res) => {
  const idRes = z.string().uuid().safeParse(req.params.id);
  if (!idRes.success) return res.status(400).json({ error: 'Invalid location id', details: idRes.error.flatten() });
  const id = idRes.data;
  const qschema = z.object({
    pollutant: z.enum(['AOD','NO2']).default('AOD'),
    radius_km: z.coerce.number().min(1).max(500).default(100),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
  });
  const qp = qschema.safeParse(req.query);
  if (!qp.success) return res.status(400).json({ error: 'Invalid query', details: qp.error.flatten() });
  const pollutant = qp.data.pollutant;
  const radius_km = qp.data.radius_km;
  const day = qp.data.date ?? new Date().toISOString().slice(0,10);
  const loc = await findLocationById(id);
  if (!loc) return res.status(404).json({ error: 'location not found' });
  const lat = Number(loc.lat), lon = Number(loc.lon);

  const cacheKey = `heatmap:${pollutant}:${day}:loc:${id}:${radius_km}`;
  const ttl = Number(process.env.HEATMAP_CACHE_TTL || 300);
  const cached = await cacheGet<any>(cacheKey);
  if (cached) {
    const tag = etagFor(cached);
    if (req.headers['if-none-match'] === tag) return res.status(304).end();
    res.setHeader('ETag', tag);
    res.setHeader('Cache-Control', `public, max-age=${ttl}`);
    return res.json(cached);
  }

  const ddeg = radius_km / 111.0;
  const rows = await getObservationsInArea(day, pollutant, lat - ddeg, lat + ddeg, lon - ddeg, lon + ddeg);

  const cell = 0.2;
  const buckets = new Map<string, { lat: number; lon: number; values: number[] }>();
  for (const r of rows) {
    if (r.value == null) continue;
    const gx = Math.round(Number(r.lat) / cell) * cell;
    const gy = Math.round(Number(r.lon) / cell) * cell;
    const key = `${gx.toFixed(3)},${gy.toFixed(3)}`;
    const b = buckets.get(key) || { lat: gx, lon: gy, values: [] };
    b.values.push(Number(r.value));
    buckets.set(key, b);
  }

  const points = [...buckets.values()].map(b => {
    const v = b.values.reduce((a,c)=>a+c,0) / b.values.length;
    const { color, band, unit } = colorFor(pollutant, v);
    return { lat: b.lat, lon: b.lon, value: v, color, band, unit };
  });
  const fc = makeGeoJSON(points as any, { pollutant, radius_km });
  await cacheSet(cacheKey, fc, ttl);

  const tag = etagFor(fc);
  res.setHeader('ETag', tag);
  res.setHeader('Cache-Control', `public, max-age=${ttl}`);
  res.json(fc);
});
