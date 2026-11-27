const { z } = require('zod');

// Clase 7: la configuración vive en el entorno (12-Factor, factor III).
// Si falta algo obligatorio, la API se niega a arrancar con un mensaje claro,
// en vez de fallar más tarde cuando un usuario toque la ruta que lo usa.
const esquema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  MONGO_URI: z
    .string({ error: 'Es obligatoria' })
    .regex(/^mongodb(\+srv)?:\/\//, 'Debe empezar por mongodb:// o mongodb+srv://'),
  CORS_ORIGIN: z.string().default('http://localhost:8080,http://localhost:5173'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  APP_VERSION: z.string().default('local'),
  MONGO_RETRIES: z.coerce.number().int().positive().default(5),
  MONGO_RETRY_DELAY_MS: z.coerce.number().int().nonnegative().default(3000),
});

// Devuelve { ok, env } o { ok: false, errores } sin terminar el proceso (así se puede testear)
function validarEnv(fuente = process.env) {
  const resultado = esquema.safeParse(fuente);
  if (resultado.success) return { ok: true, env: Object.freeze(resultado.data) };
  // Solo NOMBRES de variables y el problema: nunca sus valores (podrían ser secretos)
  const errores = resultado.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
  return { ok: false, errores };
}

// Lo usa server.js al arrancar: si la configuración no es válida, sale con código 1
function cargarEnv(fuente = process.env) {
  const { ok, env, errores } = validarEnv(fuente);
  if (!ok) {
    console.error('[taskflow-api] Variables de entorno inválidas:');
    errores.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }
  return env;
}

module.exports = { validarEnv, cargarEnv };
