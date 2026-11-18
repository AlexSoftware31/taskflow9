// Importamos describe/test/expect desde vitest de forma explícita:
// así ESLint no marca "no-undef" y no hace falta configurar globals.
import { describe, test, expect } from 'vitest';
import { contarPendientes, filtrarPorEstado, ordenarPorPrioridad } from './tareas.js';

const tareas = [
  { _id: '1', titulo: 'Instalar Docker', completada: true, prioridad: 'media' },
  { _id: '2', titulo: 'Escribir el Dockerfile', completada: false, prioridad: 'alta' },
  { _id: '3', titulo: 'Crear el workflow de CI', completada: false, prioridad: 'baja' },
];

describe('utilidades de tareas', () => {
  test('cuenta las tareas pendientes', () => {
    expect(contarPendientes(tareas)).toBe(2);
  });

  test('devuelve 0 pendientes con una lista vacía', () => {
    expect(contarPendientes([])).toBe(0);
  });

  test('filtra por estado', () => {
    expect(filtrarPorEstado(tareas, 'pendientes')).toHaveLength(2);
    expect(filtrarPorEstado(tareas, 'completadas')).toHaveLength(1);
    expect(filtrarPorEstado(tareas)).toHaveLength(3);
  });

  test('ordena por prioridad (alta → baja) sin modificar la lista original', () => {
    const ordenadas = ordenarPorPrioridad(tareas);
    expect(ordenadas.map((t) => t.prioridad)).toEqual(['alta', 'media', 'baja']);
    expect(tareas[0].prioridad).toBe('media');
  });
});
