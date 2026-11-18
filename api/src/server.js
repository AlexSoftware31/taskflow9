const mongoose = require('mongoose');
const app = require('./app');

// Clase 4: server.js ARRANCA la app (conexión a Mongo + listen).
// La configuración de Express vive en app.js para poder testearla.
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('[taskflow-api] Falta la variable de entorno MONGO_URI');
  process.exit(1);
}

// Reintenta la conexión: en Compose, Mongo puede tardar unos segundos en estar listo,
// y en la nube no existe depends_on (la base de datos puede reiniciarse en cualquier momento).
const INTENTOS = Number(process.env.MONGO_RETRIES || 5);
const ESPERA_MS = Number(process.env.MONGO_RETRY_DELAY_MS || 3000);

async function conectarConReintentos() {
  for (let intento = 1; intento <= INTENTOS; intento++) {
    try {
      await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
      console.log('[taskflow-api] Conectado a MongoDB');
      return;
    } catch (err) {
      console.error(`[taskflow-api] Intento ${intento}/${INTENTOS} falló: ${err.message}`);
      if (intento === INTENTOS) throw err;
      await new Promise((r) => setTimeout(r, ESPERA_MS));
    }
  }
}

conectarConReintentos()
  .then(() => {
    app.listen(PORT, () => console.log(`[taskflow-api] Escuchando en el puerto ${PORT}`));
  })
  .catch(() => {
    console.error('[taskflow-api] No se pudo conectar a MongoDB. Saliendo.');
    process.exit(1);
  });

// Apagado limpio cuando Docker envía SIGTERM (docker stop)
process.on('SIGTERM', async () => {
  console.log('[taskflow-api] SIGTERM recibido, cerrando...');
  await mongoose.connection.close();
  process.exit(0);
});
