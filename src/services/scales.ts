export type Band = { max: number, label: string, color: string };
export type Scale = { pollutant: 'AOD'|'NO2'|'SO2', unit: string, bands: Band[] };

export const SCALES: Record<'AOD'|'NO2'|'SO2', Scale> = {
  AOD: { pollutant: 'AOD', unit: 'unitless', bands: [
    { max: 0.10, label: 'Excelente', color: '#2DC937' },
    { max: 0.20, label: 'Bom',       color: '#99C140' },
    { max: 0.30, label: 'Moderado',  color: '#E7B416' },
    { max: 0.40, label: 'Ruim',      color: '#DB7B2B' },
    { max: 1.00, label: 'Muito Ruim',color: '#CC3232' },
  ]},
  NO2: { pollutant: 'NO2', unit: 'mol/m^2', bands: [
    { max: 0.00005, label: 'Excelente', color: '#2DC937' },
    { max: 0.00010, label: 'Bom',       color: '#99C140' },
    { max: 0.00020, label: 'Moderado',  color: '#E7B416' },
    { max: 0.00030, label: 'Ruim',      color: '#DB7B2B' },
    { max: 1.00000, label: 'Muito Ruim',color: '#CC3232' },
  ]},
  SO2: { pollutant: 'SO2', unit: 'mol/m^2', bands: [
    { max: 0,       label: 'Excelente', color: '#2DC937' }, // negativos também entram aqui
    { max: 0.00010, label: 'Bom',       color: '#99C140' },
    { max: 0.00020, label: 'Moderado',  color: '#E7B416' },
    { max: 0.00040, label: 'Ruim',      color: '#DB7B2B' },
    { max: 1.00000, label: 'Muito Ruim',color: '#CC3232' },
  ]}
};

export function colorFor(pollutant: 'AOD'|'NO2'|'SO2', value: number) {
  const scale = SCALES[pollutant];
  const band = scale.bands.find(b => value <= b.max) || scale.bands[scale.bands.length-1];
  return { color: band.color, band: band.label, unit: scale.unit };
}
