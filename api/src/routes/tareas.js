const { Router } = require('express');
const { isValidObjectId } = require('mongoose');
const Tarea = require('../models/Tarea');
const { validarTarea } = require('../validaciones/tarea');

const router = Router();

const validarId = (req, res, next) =>
  isValidObjectId(req.params.id) ? next() : res.status(400).json({ error: 'Id no válido' });

router.get('/', async (req, res, next) => {
  try {
    res.json(await Tarea.find().sort({ creadaEn: -1 }));
  } catch (err) { next(err); }
});

router.get('/:id', validarId, async (req, res, next) => {
  try {
    const tarea = await Tarea.findById(req.params.id);
    tarea ? res.json(tarea) : res.status(404).json({ error: 'Tarea no encontrada' });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { titulo, prioridad } = req.body;
    // Clase 4: se valida ANTES de tocar la base de datos (y así se puede testear sin Mongo)
    const { valida, errores } = validarTarea({ titulo, prioridad });
    if (!valida) return res.status(400).json({ error: errores[0], errores });
    const tarea = await Tarea.create({ titulo, prioridad });
    req.log.info({ tareaId: tarea._id }, 'Tarea creada');   // Clase 7: log de negocio con requestId
    res.status(201).json(tarea);
  } catch (err) { next(err); }
});

router.patch('/:id', validarId, async (req, res, next) => {
  try {
    const { titulo, completada, prioridad } = req.body;
    const tarea = await Tarea.findByIdAndUpdate(
      req.params.id,
      { $set: Object.fromEntries(Object.entries({ titulo, completada, prioridad }).filter(([, v]) => v !== undefined)) },
      { new: true, runValidators: true }
    );
    tarea ? res.json(tarea) : res.status(404).json({ error: 'Tarea no encontrada' });
  } catch (err) { next(err); }
});

router.delete('/:id', validarId, async (req, res, next) => {
  try {
    const tarea = await Tarea.findByIdAndDelete(req.params.id);
    tarea ? res.status(204).end() : res.status(404).json({ error: 'Tarea no encontrada' });
  } catch (err) { next(err); }
});

// Clase 7: los errores (next(err)) los atiende el manejador global de app.js

module.exports = router;
