// Reglas de negocio de una tarea, en una función pura (sin Express ni Mongo):
// fácil de probar con tests unitarios.
const PRIORIDADES = ['baja', 'media', 'alta'];
const MAX_TITULO = 100;

function validarTarea(datos = {}) {
  const errores = [];
  const titulo = typeof datos.titulo === 'string' ? datos.titulo.trim() : '';

  if (!titulo) {
    errores.push('El título es obligatorio');
  } else if (titulo.length > MAX_TITULO) {
    errores.push(`El título no puede superar ${MAX_TITULO} caracteres`);
  }

  if (datos.prioridad !== undefined && !PRIORIDADES.includes(datos.prioridad)) {
    errores.push(`Prioridad no válida (usa: ${PRIORIDADES.join(', ')})`);
  }

  return { valida: errores.length === 0, errores };
}

module.exports = { validarTarea, PRIORIDADES, MAX_TITULO };
