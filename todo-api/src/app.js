'use strict';

const express = require('express');
const { TaskStore, ESTADOS_VALIDOS } = require('./taskStore');

function createApp() {
  const app = express();
  app.use(express.json());

  const store = new TaskStore();

  // Endpoint de salud, útil para probar que el contenedor levantó bien.
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', version: process.env.APP_VERSION || '1.0' });
  });

  // Listar tareas. v2.0: soporta filtro por estado via ?status=PENDIENTE
  app.get('/tasks', (req, res) => {
    const { status } = req.query;

    if (status !== undefined) {
      if (!ESTADOS_VALIDOS.includes(status)) {
        return res.status(400).json({
          error: `Estado invalido. Valores permitidos: ${ESTADOS_VALIDOS.join(', ')}`,
        });
      }
      return res.status(200).json(store.listByStatus(status));
    }

    return res.status(200).json(store.list());
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
    const { title, description, status } = req.body || {};

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'El campo "title" es obligatorio' });
    }

    if (status !== undefined && !ESTADOS_VALIDOS.includes(status)) {
      return res.status(400).json({
        error: `Estado invalido. Valores permitidos: ${ESTADOS_VALIDOS.join(', ')}`,
      });
    }

    const task = store.create({
      title: title.trim(),
      description,
      status: status || 'PENDIENTE',
    });
    return res.status(201).json(task);
  });

  // Actualizar una tarea existente (título, descripción y/o estado).
  app.put('/tasks/:id', (req, res) => {
    const { title, description, status } = req.body || {};

    if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
      return res.status(400).json({ error: 'El campo "title" no puede estar vacío' });
    }

    if (status !== undefined && !ESTADOS_VALIDOS.includes(status)) {
      return res.status(400).json({
        error: `Estado invalido. Valores permitidos: ${ESTADOS_VALIDOS.join(', ')}`,
      });
    }

    const changes = {};
    if (title !== undefined) changes.title = title.trim();
    if (description !== undefined) changes.description = description;
    if (status !== undefined) changes.status = status;

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
