/**
 * seed_db.ts — NO-SSL-ISSUES MODE (DEV/HACKATHON)
 * Força TLS relaxado para executar o seed sem erros de certificado.
 */
import 'dotenv/config';
import { readFileSync } from 'fs';
import { Pool } from 'pg';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL não definida no .env');

  // Redundância global
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  const pool = new Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false, requestCert: true }
  });

  const sql = readFileSync('scripts/seed_db.sql', 'utf-8');
  const client = await pool.connect();
  try {
    await client.query('begin');
    await client.query(sql);
    await client.query('commit');
    console.log('[seed] ok');
  } catch (e) {
    await client.query('rollback');
    console.error('[seed] failed', e);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}
main().catch((e) => { console.error('[seed] fatal', e); process.exit(1); });
