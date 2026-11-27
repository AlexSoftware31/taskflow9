// Clase 7: la validación de variables de entorno se prueba sin arrancar la API
const { validarEnv } = require('../src/config/env');

describe('validarEnv', () => {
  test('falla si falta MONGO_URI y nombra la variable', () => {
    const { ok, errores } = validarEnv({});
    expect(ok).toBe(false);
    expect(errores.join(' ')).toMatch(/MONGO_URI/);
  });

  test('falla si MONGO_URI no es una cadena de MongoDB', () => {
    const { ok } = validarEnv({ MONGO_URI: 'http://localhost' });
    expect(ok).toBe(false);
  });

  test('acepta mongodb+srv:// y aplica los valores por defecto', () => {
    const { ok, env } = validarEnv({ MONGO_URI: 'mongodb+srv://u:p@cluster.mongodb.net/taskflow' });
    expect(ok).toBe(true);
    expect(env.PORT).toBe(3000);
    expect(env.LOG_LEVEL).toBe('info');
    expect(env.APP_VERSION).toBe('local');
  });

  test('convierte PORT a número', () => {
    const { env } = validarEnv({ MONGO_URI: 'mongodb://mongo:27017/taskflow', PORT: '8080' });
    expect(env.PORT).toBe(8080);
  });

  test('nunca incluye el valor de las variables en los errores', () => {
    const { errores } = validarEnv({ MONGO_URI: 'secreto-que-no-debe-salir', PORT: 'abc' });
    expect(errores.join(' ')).not.toMatch(/secreto-que-no-debe-salir/);
  });
});
