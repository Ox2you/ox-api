import { Pool } from 'pg';
import type { QueryResult, QueryResultRow } from 'pg';
import { logger } from './logger.js';

const url = process.env.DATABASE_URL!;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // se estiver no modo no-ssl-issues

export const pool = new Pool({
  connectionString: url,
  ssl: { rejectUnauthorized: false, requestCert: true } // <= sua política SSL atual
});

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: any[] = []
): Promise<QueryResult<T>> {
  const start = Date.now();
  const client = await pool.connect();
  try {
    const res = await client.query<T>(text, params);
    logger.info({ rows: (res as any).rowCount, ms: Date.now() - start }, 'db.query');
    return res;
  } finally {
    client.release();
  }
}