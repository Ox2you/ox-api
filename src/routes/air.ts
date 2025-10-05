
import { Router } from 'express';
export const airRouter = Router();
airRouter.get('/summary', (_req, res) => {
  res.json({ ok: true, note: 'summary placeholder — integrar NASA GIBS/TEMPO depois' });
});
