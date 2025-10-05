# Ox2You – Air Quality Backend (Connected, Updated)

Atualizado com:
- `db.ts` com política de SSL flexível (CA opcional, relaxado por padrão para pooler do Supabase)
- `seed_db.ts` com SSL relaxado (compatível com pooler)
- Logger com `pino-pretty` opcional
- Endpoints: `/health` e `/health/db`
- Seeds com locations + observações

## Rodando
```bash
npm i
cp .env.example .env
npm run seed
npm run dev   # http://localhost:3000/docs
```

## Variáveis úteis (SSL)
- `PG_STRICT_SSL=1` → verificação estrita (use com CA)
- `PG_SKIP_TLS_VERIFY=1` → ignora verificação (apenas se necessário)
- `PG_SSL_CA_PATH=/caminho/ca.pem` ou `PG_SSL_CA="-----BEGIN CERTIFICATE-----..."`

## Testes
```bash
curl http://localhost:3000/health
curl http://localhost:3000/health/db
curl "http://localhost:3000/api/locations/search?q=rio"
curl "http://localhost:3000/api/geo/heatmap?lat=-22.9068&lon=-43.1729&pollutant=AOD&radius_km=100"
```
