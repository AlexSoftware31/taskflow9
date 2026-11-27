// Tests de INTEGRACIÓN HTTP con Supertest: levantan la app en memoria (sin listen ni Mongo).
// Solo probamos rutas que responden ANTES de llegar a la base de datos.
const request = require('supertest');
const app = require('../src/app');

describe('API TaskFlow', () => {
  // Clase 7: /health (liveness) no depende de la base de datos
  test('GET /health responde 200 aunque no haya base de datos', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('version');
    expect(typeof res.body.uptime).toBe('number');
  });

  // Clase 7: /ready (readiness) sí depende de MongoDB → sin conexión responde 503
  test('GET /ready responde 503 si MongoDB no está conectado', async () => {
    const res = await request(app).get('/ready');
    expect(res.status).toBe(503);
    expect(res.body).toEqual({ status: 'not_ready', checks: { mongo: 'down' } });
  });

  test('cada respuesta trae un x-request-id (y respeta el que envía el cliente)', async () => {
    const generado = await request(app).get('/health');
    expect(generado.headers['x-request-id']).toBeDefined();

    const propio = await request(app).get('/health').set('x-request-id', 'abc-123');
    expect(propio.headers['x-request-id']).toBe('abc-123');
  });

  test('POST /api/tareas sin título responde 400', async () => {
    const res = await request(app).post('/api/tareas').send({ prioridad: 'alta' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('El título es obligatorio');
  });

  test('POST /api/tareas con prioridad inválida responde 400', async () => {
    const res = await request(app).post('/api/tareas').send({ titulo: 'Tarea', prioridad: 'urgente' });
    expect(res.status).toBe(400);
  });

  test('GET /api/tareas/:id con un id mal formado responde 400', async () => {
    const res = await request(app).get('/api/tareas/123');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Id no válido');
  });

  test('una ruta inexistente responde 404', async () => {
    const res = await request(app).get('/no-existe');
    expect(res.status).toBe(404);
  });
});
