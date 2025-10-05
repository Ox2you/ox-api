
import Redis from 'ioredis';
const url = process.env.REDIS_URL;
let client: Redis | null = null;
if (url) {
  client = new Redis(url);
  client.on('connect', () => console.log('[redis] connected'));
  client.on('error', (e) => console.error('[redis] error', e));
}
const store = new Map<string, { expires: number, value: unknown }>();
export async function cacheGet<T>(key: string): Promise<T | null> {
  if (client) {
    const raw = await client.get(key);
    return raw ? JSON.parse(raw) as T : null;
  } else {
    const hit = store.get(key);
    if (!hit) return null;
    if (hit.expires < Date.now()) { store.delete(key); return null; }
    return hit.value as T;
  }
}
export async function cacheSet<T>(key: string, value: T, ttlSeconds: number) {
  if (client) {
    await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } else {
    store.set(key, { value, expires: Date.now() + ttlSeconds * 1000 });
  }
}
