const { Router } = require('express');
const mongoose = require('mongoose');

// Clase 7: dos preguntas distintas, dos endpoints.
//   /health (liveness):  ¿el proceso vive y responde?  → NO toca la base de datos
//   /ready  (readiness): ¿puede atender tráfico real?   → hace ping a MongoDB
// Si Mongo cae, /health sigue en 200: reiniciar la API no arregla la base de datos.
const router = Router();
const ESTADOS = ['desconectado', 'conectado', 'conectando', 'desconectando'];

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: process.env.APP_VERSION || 'local',   // el commit desplegado (lo usa el smoke test del CD)
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

router.get('/ready', async (req, res) => {
  const estado = mongoose.connection.readyState;
  try {
    if (estado !== 1) throw new Error(`MongoDB ${ESTADOS[estado] || 'desconocido'}`);
    await mongoose.connection.db.admin().ping();
    res.json({ status: 'ready', checks: { mongo: 'up' } });
  } catch (err) {
    req.log.warn({ err: err.message }, 'Readiness falló');
    res.status(503).json({ status: 'not_ready', checks: { mongo: 'down' } });
  }
});

module.exports = router;
