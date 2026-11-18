// Tests UNITARIOS: prueban una función pura, sin servidor ni base de datos.
const { validarTarea } = require('../src/validaciones/tarea');

describe('validarTarea', () => {
  test('acepta una tarea válida', () => {
    const r = validarTarea({ titulo: 'Preparar la clase 4', prioridad: 'alta' });
    expect(r.valida).toBe(true);
    expect(r.errores).toHaveLength(0);
  });

  test('acepta una tarea sin prioridad (el modelo pone "media")', () => {
    expect(validarTarea({ titulo: 'Sin prioridad' }).valida).toBe(true);
  });

  test('rechaza una tarea sin título', () => {
    const r = validarTarea({ prioridad: 'baja' });
    expect(r.valida).toBe(false);
    expect(r.errores).toContain('El título es obligatorio');
  });

  test('rechaza un título con solo espacios', () => {
    expect(validarTarea({ titulo: '   ' }).valida).toBe(false);
  });

  test('rechaza un título de más de 100 caracteres', () => {
    expect(validarTarea({ titulo: 'a'.repeat(101) }).valida).toBe(false);
  });

  test('rechaza una prioridad que no existe', () => {
    const r = validarTarea({ titulo: 'Tarea', prioridad: 'urgente' });
    expect(r.valida).toBe(false);
    expect(r.errores[0]).toMatch(/Prioridad no válida/);
  });
});
