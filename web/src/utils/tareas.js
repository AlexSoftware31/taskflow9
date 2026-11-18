// Funciones puras sobre la lista de tareas (sin React): fáciles de testear con Vitest.

export function contarPendientes(tareas) {
  return tareas.filter((t) => !t.completada).length;
}

export function filtrarPorEstado(tareas, estado = 'todas') {
  if (estado === 'pendientes') return tareas.filter((t) => !t.completada);
  if (estado === 'completadas') return tareas.filter((t) => t.completada);
  return tareas;
}

const ORDEN_PRIORIDAD = { alta: 0, media: 1, baja: 2 };

export function ordenarPorPrioridad(tareas) {
  return [...tareas].sort(
    (a, b) => (ORDEN_PRIORIDAD[a.prioridad] ?? 3) - (ORDEN_PRIORIDAD[b.prioridad] ?? 3)
  );
}
