const { randomUUID } = require('node:crypto');
const express = require('express');
const cors = require('cors');
const pinoHttp = require('pino-http');
const logger = require('./lib/logger');
const healthRouter = require('./routes/health');
const tareasRouter = require('./routes/tareas');

// Clase 4: app.js solo CONFIGURA Express y exporta la app.
// No conecta a Mongo ni hace listen → los tests pueden importarla sin base de datos.
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:8080,http://localhost:5173';

const app = express();
// Clase 6: en Render, CORS_ORIGIN=https://taskflow-xxxx.vercel.app (varias URLs separadas por coma).
// Se quitan espacios y la barra final: el navegador envía el Origin sin "/".
const origenes = CORS_ORIGIN.split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);
app.use(cors({ origin: origenes, exposedHeaders: ['x-request-id'] }));
app.use(express.json());

// Clase 7: un log JSON por petición, con un requestId para seguirla de punta a punta.
// Se ve con: docker compose logs -f api   ·   en Render: pestaña Logs
app.use(pinoHttp({
  logger,
  // Reutiliza el x-request-id si viene del cliente; si no, genera uno y lo devuelve en la respuesta
  genReqId: (req, res) => {
    const id = req.headers['x-request-id'] || randomUUID();
    res.setHeader('x-request-id', id);
    return id;
  },
  customLogLevel: (req, res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  // El health check de Docker y el monitor de uptime llaman cada pocos segundos: no ensuciemos los logs
  autoLogging: { ignore: (req) => ['/health', '/ready'].includes(req.url) },
}));

// Antes de cualquier autenticación futura: el monitor de uptime no tiene credenciales
app.use(healthRouter);

app.use('/api/tareas', tareasRouter);

app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// Clase 7: manejador de errores global (va al FINAL, con 4 parámetros)
app.use((err, req, res, next) => {
  // Errores de validación de Mongoose: culpa del cliente, el mensaje es seguro de mostrar
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message, requestId: req.id });
  }
  const status = err.status || err.statusCode || 500;
  res.err = err;   // pino-http lo incluye en el log de la petición
  req.log.error({ err }, 'Error no controlado');
  res.status(status).json({
    // En un 500 nunca exponemos el detalle interno: el usuario nos reporta el requestId
    error: status >= 500 ? 'Error interno del servidor' : err.message,
    requestId: req.id,
  });
});

module.exports = app;
