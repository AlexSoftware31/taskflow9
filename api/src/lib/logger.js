const pino = require('pino');

// Clase 7: logs estructurados en JSON a stdout (12-Factor, factor XI).
// Render / Docker los recogen; nosotros solo escribimos.
const NODE_ENV = process.env.NODE_ENV || 'development';

const logger = pino({
  // En los tests (Jest pone NODE_ENV=test) no se imprime nada
  level: process.env.LOG_LEVEL || (NODE_ENV === 'test' ? 'silent' : 'info'),
  base: {
    service: 'taskflow-api',
    env: NODE_ENV,
    version: process.env.APP_VERSION || 'local',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  // Nunca registrar secretos ni datos sensibles
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'],
    censor: '[REDACTED]',
  },
  // Legible en local (npm run dev); JSON puro en Docker y en Render (NODE_ENV=production)
  transport: NODE_ENV === 'development'
    ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:HH:MM:ss' } }
    : undefined,
});

module.exports = logger;
