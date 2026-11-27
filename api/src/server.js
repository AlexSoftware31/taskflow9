const mongoose = require('mongoose');
const { cargarEnv } = require('./config/env');

// Clase 7: validar la configuración ANTES de cargar nada más
const env = cargarEnv();
const logger = require('./lib/logger');
const app = require('./app');

// Clase 4: server.js ARRANCA la app (conexión a Mongo + listen).
// La configuración de Express vive en app.js para poder testearla.

// Reintenta la conexión: en Compose, Mongo puede tardar unos segundos en estar listo,
// y en la nube no existe depends_on (la base de datos puede reiniciarse en cualquier momento).
async function conectarConReintentos() {
  for (let intento = 1; intento <= env.MONGO_RETRIES; intento++) {
    try {
      await mongoose.connect(env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
      logger.info('Conectado a MongoDB');
      return;
    } catch (err) {
      logger.warn({ intento, de: env.MONGO_RETRIES, err: err.message }, 'Conexión a MongoDB falló');
      if (intento === env.MONGO_RETRIES) throw err;
      await new Promise((r) => setTimeout(r, env.MONGO_RETRY_DELAY_MS));
    }
  }
}

let server;

// Clase 7: apagado graceful. Docker y Render envían SIGTERM al detener el contenedor
// (deploy, escalado, docker compose stop). Dejamos de aceptar conexiones, terminamos
// las peticiones en curso, cerramos Mongo y salimos.
function apagar(senal) {
  logger.info({ senal }, 'Señal recibida, apagando...');
  // Si algo se cuelga, forzamos la salida a los 10 s
  setTimeout(() => {
    logger.error('Apagado forzado: se superaron 10 s');
    process.exit(1);
  }, 10_000).unref();

  const cerrarMongo = async () => {
    await mongoose.connection.close();
    logger.info('Apagado limpio');
    process.exit(0);
  };
  if (server) server.close(cerrarMongo);
  else cerrarMongo();
}

process.on('SIGTERM', () => apagar('SIGTERM'));
process.on('SIGINT', () => apagar('SIGINT'));   // Ctrl+C en local

// Un error que nadie atrapó deja el proceso en estado desconocido:
// lo registramos y salimos con 1 para que Docker/Render lo reinicien limpio.
process.on('unhandledRejection', (reason) => {
  logger.fatal({ err: reason }, 'unhandledRejection');
  process.exit(1);
});
process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'uncaughtException');
  process.exit(1);
});

conectarConReintentos()
  .then(() => {
    // Mongo puede desconectarse con la API ya corriendo: lo dejamos registrado (y /ready dará 503)
    mongoose.connection.on('disconnected', () => logger.warn('MongoDB desconectado'));
    mongoose.connection.on('reconnected', () => logger.info('MongoDB reconectado'));

    server = app.listen(env.PORT, () => {
      logger.info({ port: env.PORT, version: env.APP_VERSION }, 'API escuchando');
    });
  })
  .catch((err) => {
    logger.fatal({ err: err.message }, 'No se pudo conectar a MongoDB. Saliendo.');
    process.exit(1);
  });
