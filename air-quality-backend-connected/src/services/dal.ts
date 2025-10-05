
import { query } from './db.js';

export async function findLocationsByName(q: string) {
  const like = `%${q}%`;
  const sql = `select * from public.locations where name ilike $1 order by name asc limit 10`;
  const res = await query(sql, [like]);
  return res.rows;
}

export async function findLocationsNear(lat: number, lon: number, radiusKm: number) {
  const d = radiusKm / 111.0;
  const sql = `
    select * from public.locations
    where lat between $1 and $2
      and lon between $3 and $4
    limit 20`;
  const res = await query(sql, [lat - d, lat + d, lon - d, lon + d]);
  return res.rows;
}

export async function findLocationById(id: string) {
  const res = await query(`select * from public.locations where id = $1 limit 1`, [id]);
  return res.rows[0] || null;
}

export async function getObservationsInArea(day: string, pollutant: 'AOD'|'NO2', minLat: number, maxLat: number, minLon: number, maxLon: number) {
  const sql = `
    select lat, lon, value, unit, observed_at
    from public.air_quality_observations
    where lat between $1 and $2 and lon between $3 and $4
      and pollutant = $5
      and observed_at >= $6::timestamptz
      and observed_at <= $7::timestamptz
    limit 2000`;
  const fromTs = `${day}T00:00:00Z`;
  const toTs   = `${day}T23:59:59Z`;
  const res = await query(sql, [minLat, maxLat, minLon, maxLon, pollutant, fromTs, toTs]);
  return res.rows;
}

export async function getDailyForLocation(locationId: string, day: string) {
  const res = await query(`select * from public.daily_air_quality where location_id = $1 and date = $2 limit 1`, [locationId, day]);
  return res.rows[0] || null;
}
