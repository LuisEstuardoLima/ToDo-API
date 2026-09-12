'use strict';

/**
 * Almacén en memoria para las tareas.
 * En un entorno productivo esto se reemplazaría por una base de datos,
 * pero para efectos del reto se mantiene simple y explicable.
 */

const ESTADOS_VALIDOS = ['PENDIENTE', 'EN_PROGRESO', 'COMPLETADA'];

class TaskStore {
  constructor() {
    this.tasks = new Map();
    this.nextId = 1;
  }

  list() {
    return Array.from(this.tasks.values());
  }

  listByStatus(status) {
    return this.list().filter((task) => task.status === status);
  }

  getById(id) {
    return this.tasks.get(id);
  }

  create({ title, description = '', status = 'PENDIENTE' }) {
    const id = String(this.nextId++);
    const now = new Date().toISOString();
    const task = {
      id,
      title,
      description,
      status,
      createdAt: now,
      updatedAt: now,
    };
    this.tasks.set(id, task);
    return task;
  }

  update(id, changes) {
    const existing = this.tasks.get(id);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...changes,
      id: existing.id, // el id nunca cambia
      createdAt: existing.createdAt, // la fecha de creación tampoco
      updatedAt: new Date().toISOString(),
    };
    this.tasks.set(id, updated);
    return updated;
  }

  delete(id) {
    return this.tasks.delete(id);
  }
}

module.exports = { TaskStore, ESTADOS_VALIDOS };
