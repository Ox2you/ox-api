
type Pt = { lat: number; lon: number; value: number; color?: string; band?: string; unit?: string };
type Meta = { pollutant: string; radius_km: number };
export function makeGeoJSON(points: Pt[], meta: Meta) {
  return {
    type: 'FeatureCollection',
    features: points.map(p => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [p.lon, p.lat] },
      properties: { value: p.value, pollutant: meta.pollutant, radius_km: meta.radius_km, color: p.color, band: p.band, unit: p.unit }
    })),
    properties: { ...meta }
  };
}
