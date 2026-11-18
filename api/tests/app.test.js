// Tests de INTEGRACIÓN HTTP con Supertest: levantan la app en memoria (sin listen ni Mongo).
// Solo probamos rutas que responden ANTES de llegar a la base de datos.
const request = require('supertest');
const app = require('../src/app');

describe('API TaskFlow', () => {
  test('GET /health responde 200 aunque no haya base de datos', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', db: 'desconectado' });
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
