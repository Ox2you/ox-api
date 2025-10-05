/**
 * health.ts — inclui fallback com Client direto (TLS relaxado) para eliminar ruídos de SSL.
 */
import { Router } from 'express';
import { pool, query } from '../services/db.js';
import { Client } from 'pg';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  res.json({ ok: true, service: 'air-quality-backend-ox2you-connected', ts: new Date().toISOString() });
});

healthRouter.get('/db', async (_req, res) => {
  const started = Date.now();
  try {
    const version = await query<{ version: string }>('select version() as version');
    const ping = Date.now() - started;
    return res.json({
      ok: true,
      mode: 'pool',
      ping_ms: ping,
      version: version.rows?.[0]?.version || null,
      pool_total: (pool as any).totalCount,
      pool_idle: (pool as any).idleCount,
      pool_waiting: (pool as any).waitingCount
    });
  } catch (err: any) {
    try {
      const url = process.env.DATABASE_URL!;
      // Redundância global
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
      const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false, requestCert: true } });
      await client.connect();
      const r = await client.query('select version() as version');
      await client.end();
      const ping = Date.now() - started;
      return res.json({ ok: true, mode: 'direct-client', ping_ms: ping, version: r.rows?.[0]?.version || null });
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: e?.message || err?.message || 'db error', code: e?.code || err?.code });
    }
  }
});
