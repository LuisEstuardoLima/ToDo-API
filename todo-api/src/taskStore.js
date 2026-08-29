'use strict';

/**
 * Almacén en memoria para las tareas.
 * En un entorno productivo esto se reemplazaría por una base de datos,
 * pero para efectos del reto se mantiene simple y explicable.
 */
class TaskStore {
  constructor() {
    this.tasks = new Map();
    this.nextId = 1;
  }

  list() {
    return Array.from(this.tasks.values());
  }

  getById(id) {
    return this.tasks.get(id);
  }

  create({ title, description = '', done = false }) {
    const id = String(this.nextId++);
    const task = {
      id,
      title,
      description,
      done: Boolean(done),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
      updatedAt: new Date().toISOString(),
    };
    this.tasks.set(id, updated);
    return updated;
  }

  delete(id) {
    return this.tasks.delete(id);
  }
}

module.exports = TaskStore;
