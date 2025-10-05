/**
 * db.ts — NO-SSL-ISSUES MODE (DEV/HACKATHON)
 * Força TLS relaxado em todos os cenários (não verificar cadeia/CA).
 * ⚠️ Use somente em desenvolvimento ou ambiente controlado.
 */
import { Pool } from 'pg';
import { logger } from './logger.js';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL não definida no .env');

// Desliga verificação de certificado para o processo (redundância útil em alguns ambientes)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export const pool = new Pool({
  connectionString: url,
  ssl: { rejectUnauthorized: false, requestCert: true }
});

export async function query<T = any>(text: string, params: any[] = []) {
  const start = Date.now();
  const client = await pool.connect();
  try {
    const res = await client.query<T>(text, params);
    const d = Date.now() - start;
    logger.info({ rows: (res as any).rowCount, ms: d }, 'db.query');
    return res;
  } finally {
    client.release();
  }
}
