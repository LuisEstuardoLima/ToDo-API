'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const createApp = require('../src/app');

function listenOnRandomPort(app) {
  return new Promise((resolve) => {
    const server = app.listen(0, () => resolve(server));
  });
}

function request(server, method, path, body) {
  return new Promise((resolve, reject) => {
    const { port } = server.address();
    const data = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        method,
        port,
        path,
        headers: data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {},
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          const parsed = raw ? JSON.parse(raw) : null;
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

test('GET /health responde ok', async () => {
  const app = createApp();
  const server = await listenOnRandomPort(app);
  const res = await request(server, 'GET', '/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
  server.close();
});

test('flujo completo: crear, listar, actualizar (estado) y eliminar una tarea', async () => {
  const app = createApp();
  const server = await listenOnRandomPort(app);

  const created = await request(server, 'POST', '/tasks', { title: 'Comprar pan' });
  assert.equal(created.status, 201);
  assert.equal(created.body.title, 'Comprar pan');
  assert.equal(created.body.status, 'PENDIENTE');

  const list = await request(server, 'GET', '/tasks');
  assert.equal(list.status, 200);
  assert.equal(list.body.length, 1);

  const updated = await request(server, 'PUT', `/tasks/${created.body.id}`, { status: 'COMPLETADA' });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.status, 'COMPLETADA');

  const deleted = await request(server, 'DELETE', `/tasks/${created.body.id}`);
  assert.equal(deleted.status, 204);

  const afterDelete = await request(server, 'GET', `/tasks/${created.body.id}`);
  assert.equal(afterDelete.status, 404);

  server.close();
});

test('POST /tasks sin title responde 400', async () => {
  const app = createApp();
  const server = await listenOnRandomPort(app);
  const res = await request(server, 'POST', '/tasks', { description: 'sin titulo' });
  assert.equal(res.status, 400);
  server.close();
});

test('POST /tasks con estado invalido responde 400', async () => {
  const app = createApp();
  const server = await listenOnRandomPort(app);
  const res = await request(server, 'POST', '/tasks', { title: 'x', status: 'NO_EXISTE' });
  assert.equal(res.status, 400);
  server.close();
});

test('v2.0 - GET /tasks?status=X filtra correctamente', async () => {
  const app = createApp();
  const server = await listenOnRandomPort(app);

  await request(server, 'POST', '/tasks', { title: 'Tarea 1', status: 'PENDIENTE' });
  await request(server, 'POST', '/tasks', { title: 'Tarea 2', status: 'EN_PROGRESO' });
  await request(server, 'POST', '/tasks', { title: 'Tarea 3', status: 'COMPLETADA' });

  const pendientes = await request(server, 'GET', '/tasks?status=PENDIENTE');
  assert.equal(pendientes.status, 200);
  assert.equal(pendientes.body.length, 1);
  assert.equal(pendientes.body[0].title, 'Tarea 1');

  const invalido = await request(server, 'GET', '/tasks?status=NO_EXISTE');
  assert.equal(invalido.status, 400);

  server.close();
});

test('operaciones sobre id inexistente responden 404', async () => {
  const app = createApp();
  const server = await listenOnRandomPort(app);
  const getRes = await request(server, 'GET', '/tasks/999');
  const putRes = await request(server, 'PUT', '/tasks/999', { title: 'x' });
  const delRes = await request(server, 'DELETE', '/tasks/999');
  assert.equal(getRes.status, 404);
  assert.equal(putRes.status, 404);
  assert.equal(delRes.status, 404);
  server.close();
});
