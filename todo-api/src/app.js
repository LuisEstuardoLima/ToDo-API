'use strict';

const express = require('express');
const TaskStore = require('./taskStore');

function createApp() {
  const app = express();
  app.use(express.json());

  const store = new TaskStore();

  // Endpoint de salud, útil para probar que el contenedor levantó bien.
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // Listar todas las tareas.
  app.get('/tasks', (_req, res) => {
    res.status(200).json(store.list());
  });

  // Obtener una tarea puntual por id.
  app.get('/tasks/:id', (req, res) => {
    const task = store.getById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    return res.status(200).json(task);
  });

  // Crear una tarea nueva.
  app.post('/tasks', (req, res) => {
    const { title, description, done } = req.body || {};

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'El campo "title" es obligatorio' });
    }

    const task = store.create({ title: title.trim(), description, done });
    return res.status(201).json(task);
  });

  // Actualizar una tarea existente (título, descripción y/o estado).
  app.put('/tasks/:id', (req, res) => {
    const { title, description, done } = req.body || {};

    if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
      return res.status(400).json({ error: 'El campo "title" no puede estar vacío' });
    }

    const changes = {};
    if (title !== undefined) changes.title = title.trim();
    if (description !== undefined) changes.description = description;
    if (done !== undefined) changes.done = Boolean(done);

    const updated = store.update(req.params.id, changes);
    if (!updated) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    return res.status(200).json(updated);
  });

  // Eliminar una tarea.
  app.delete('/tasks/:id', (req, res) => {
    const deleted = store.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    return res.status(204).send();
  });

  // Manejador para rutas no definidas.
  app.use((_req, res) => {
    res.status(404).json({ error: 'Recurso no encontrado' });
  });

  return app;
}

module.exports = createApp;
