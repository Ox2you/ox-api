
insert into public.locations (id, name, country_code, admin1, lat, lon) values
  ('00000000-0000-0000-0000-000000000001','São Paulo','BR','SP',-23.5505,-46.6333),
  ('00000000-0000-0000-0000-000000000002','Rio de Janeiro','BR','RJ',-22.9068,-43.1729),
  ('00000000-0000-0000-0000-000000000003','Brasília','BR','DF',-15.7939,-47.8828)
on conflict do nothing;

insert into public.air_quality_observations (source_id, location_id, lat, lon, observed_at, pollutant, value, unit)
select null, '00000000-0000-0000-0000-000000000001',
       -23.55 + (random()-0.5)*0.6, -46.63 + (random()-0.5)*0.6,
       (current_date)::timestamptz + (random()*23||' hours')::interval,
       'AOD', 0.15 + random()*0.3, 'unitless'
from generate_series(1, 90);

insert into public.air_quality_observations (source_id, location_id, lat, lon, observed_at, pollutant, value, unit)
select null, '00000000-0000-0000-0000-000000000001',
       -23.55 + (random()-0.5)*0.6, -46.63 + (random()-0.5)*0.6,
       (current_date)::timestamptz + (random()*23||' hours')::interval,
       'NO2', 0.00005 + random()*0.0003, 'mol/m^2'
from generate_series(1, 90);
