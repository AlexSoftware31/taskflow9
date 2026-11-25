const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
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
app.use(cors({ origin: origenes }));
app.use(express.json());

// Log sencillo de cada petición (se ve con: docker compose logs -f api)
// En los tests (NODE_ENV=test, lo pone Jest) se omite para no ensuciar la salida.
if (process.env.NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    const inicio = Date.now();
    res.on('finish', () => {
      console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - inicio}ms`);
    });
    next();
  });
}

app.get('/health', (req, res) => {
  const estados = ['desconectado', 'conectado', 'conectando', 'desconectando'];
  res.json({ status: 'ok', db: estados[mongoose.connection.readyState] || 'desconocido' });
});

app.use('/api/tareas', tareasRouter);

app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

module.exports = app;
