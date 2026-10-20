const assert = require('node:assert/strict');
const http = require('node:http');
const { afterEach, beforeEach, test } = require('node:test');
const jwt = require('jsonwebtoken');
const { createApp } = require('../src/app');

const jwtSecret = 'test-jwt-secret-that-is-long-enough-for-this-suite';
const serviceToken = 'test-service-token-that-is-long-enough-for-this-suite';
const servers = [];

function createServer(handler) {
  const server = http.createServer(handler);
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      servers.push(server);
      resolve(`http://127.0.0.1:${server.address().port}`);
    });
  });
}

async function readRequest(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks).toString();
  return body ? JSON.parse(body) : null;
}

let gateway;
let gatewayServer;
let gatewayUrl;
let observed = [];
let catalogDelayMs = 0;
let services;

beforeEach(async () => {
  process.env.JWT_SECRET = jwtSecret;
  process.env.SERVICE_TOKEN = serviceToken;
  observed = [];
  catalogDelayMs = 0;
  const usersUrl = await createServer(async (req, res) => {
    const body = await readRequest(req);
    observed.push({ service: 'users', method: req.method, url: req.url, body });
    res.writeHead(201, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ token: 'issued', user: { id: 'u-1', role: 'client' } }));
  });
  const catalogUrl = await createServer(async (req, res) => {
    const body = await readRequest(req);
    observed.push({ service: 'catalog', method: req.method, url: req.url, body });
    if (req.url === '/api/movimientos-stock') {
      if (body?.action === 'return') {
        res.writeHead(201, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ orderId: '7', status: 'returned' }));
        return;
      }
      if (catalogDelayMs) await new Promise((resolve) => setTimeout(resolve, catalogDelayMs));
      res.writeHead(201, { 'content-type': 'application/json' });
      res.end(JSON.stringify({
        orderId: '7',
        items: [{ productId: 31, quantity: 2, productName: 'Café', unitPriceCents: 159900, subtotalCents: 319800 }],
        subtotalCents: 319800,
        discountCents: 0,
        totalCents: 319800,
        couponCode: null,
      }));
      return;
    }
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ id: 31 }));
  });
  const ordersUrl = await createServer(async (req, res) => {
    const body = await readRequest(req);
    observed.push({
      service: 'orders',
      method: req.method,
      url: req.url,
      body,
      serviceToken: req.headers['x-service-token'],
      idempotencyKey: req.headers['idempotency-key'],
      userId: req.headers['x-user-id'],
    });
    if (req.method === 'POST') {
      res.writeHead(201, { 'content-type': 'application/json' });
      res.end(JSON.stringify({
        id: 7,
        estado: 'pending',
        detalles: [{ productoId: 31, cantidad: 2 }],
        cuponCodigo: null,
      }));
      return;
    }
    if (req.method === 'PATCH' && req.url === '/api/pedidos/7') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({
        id: 7,
        userId: 'u-1',
        estado: body.estado,
        detalles: [{ productoId: 31, cantidad: 2 }],
      }));
      return;
    }
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ id: 7, estado: 'confirmed', total: 3198 }));
  });
  services = { usersUrl, catalogUrl, ordersUrl };
  gateway = createApp({
    ...services,
    timeoutMs: 1000,
  });
  gatewayServer = http.createServer(gateway);
  await new Promise((resolve) => gatewayServer.listen(0, '127.0.0.1', resolve));
  gatewayUrl = `http://127.0.0.1:${gatewayServer.address().port}`;
});

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => new Promise((resolve) => server.close(resolve))));
  if (gatewayServer) await new Promise((resolve) => gatewayServer.close(resolve));
});

test('adapts the legacy login route to the session resource', async () => {
  const response = await fetch(`${gatewayUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'client@example.com', password: 'password' }),
  });
  assert.equal(response.status, 201);
  assert.equal(observed[0].url, '/api/sesiones');
});

test('coordinates a pending order, idempotent stock operation, and persisted confirmation', async () => {
  const token = jwt.sign({ sub: 'u-1', id: 'u-1', email: 'client@example.com', role: 'client' }, jwtSecret);
  const response = await fetch(`${gatewayUrl}/api/pedidos`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      'idempotency-key': 'attempt-abc',
    },
    body: JSON.stringify({
      productos: [{ productoId: 31, cantidad: 2 }],
      cupon: 'AHORRO',
      total: 1,
    }),
  });
  assert.equal(response.status, 201);
  assert.equal(observed[0].service, 'orders');
  assert.equal(observed[0].serviceToken, serviceToken);
  assert.equal(observed[0].idempotencyKey, 'attempt-abc');
  assert.equal(observed[0].userId, 'u-1');
  assert.deepEqual(observed[0].body, {
    items: [{ productId: 31, quantity: 2 }],
    couponCode: 'AHORRO',
  });
  assert.equal(observed[1].service, 'catalog');
  assert.deepEqual(observed[1].body.items, [{ productId: 31, quantity: 2 }]);
  assert.equal(observed[2].method, 'PATCH');
  assert.equal(observed[2].body.estado, 'confirmed');
});

test('rejects order creation without a valid user token', async () => {
  const response = await fetch(`${gatewayUrl}/api/pedidos`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ items: [{ productId: 31, quantity: 2 }] }),
  });
  assert.equal(response.status, 401);
  assert.equal(observed.length, 0);
});

test('blocks client access to internal order reconciliation and state transitions', async () => {
  const token = jwt.sign({ sub: 'u-1', role: 'client' }, jwtSecret);
  const headers = { authorization: `Bearer ${token}` };
  const pendingResponse = await fetch(`${gatewayUrl}/api/pedidos/internal/pendientes`, { headers });
  const updateResponse = await fetch(`${gatewayUrl}/api/pedidos/7`, {
    method: 'PATCH',
    headers: { ...headers, 'content-type': 'application/json' },
    body: JSON.stringify({ estado: 'confirmed', totalCents: 1 }),
  });
  assert.equal(pendingResponse.status, 403);
  assert.equal(updateResponse.status, 403);
  assert.equal(observed.length, 0);
});

test('keeps the order pending when catalog confirmation times out', async () => {
  catalogDelayMs = 200;
  await new Promise((resolve) => gatewayServer.close(resolve));
  gateway = createApp({ ...services, timeoutMs: 30 });
  gatewayServer = http.createServer(gateway);
  await new Promise((resolve) => gatewayServer.listen(0, '127.0.0.1', resolve));
  gatewayUrl = `http://127.0.0.1:${gatewayServer.address().port}`;

  const token = jwt.sign({ sub: 'u-1', email: 'client@example.com', role: 'client' }, jwtSecret);
  const response = await fetch(`${gatewayUrl}/api/pedidos`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      'idempotency-key': 'attempt-uncertain',
    },
    body: JSON.stringify({ items: [{ productId: 31, quantity: 2 }] }),
  });
  const result = await response.json();
  assert.equal(response.status, 202);
  assert.equal(result.estado, 'pending');
  assert.equal(result.uncertain, true);
  assert.equal(observed.some((call) => call.method === 'PATCH'), false);
});

test('cancellation returns inventory idempotently before finalizing the order', async () => {
  const token = jwt.sign({ sub: 'u-1', email: 'client@example.com', role: 'client' }, jwtSecret);
  const response = await fetch(`${gatewayUrl}/api/pedidos/7/cancelar`, {
    method: 'PATCH',
    headers: { authorization: 'Bearer ' + token },
  });
  const result = await response.json();
  assert.equal(response.status, 200);
  assert.equal(result.pedido.estado, 'cancelled');
  const updates = observed.filter((call) => call.service === 'orders' && call.method === 'PATCH');
  assert.deepEqual(updates.map((call) => call.body.estado), ['cancelling', 'cancelled']);
  const returnCall = observed.find((call) => call.service === 'catalog' && call.body?.action === 'return');
  assert.equal(returnCall.body.orderId, '7');
  assert.equal(returnCall.body.idempotencyKey, 'order:7:sale');
});

test('payment routes are authenticated and forwarded only to Orders', async () => {
  const token = jwt.sign({ sub: 'u-1', email: 'client@example.com', role: 'client' }, jwtSecret);
  const response = await fetch(`${gatewayUrl}/api/pedidos/7/pagar`, {
    method: 'POST',
    headers: {
      authorization: 'Bearer ' + token,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ metodo: 'tarjeta', resultadoSimulado: 'aprobado' }),
  });
  assert.equal(response.status, 201);
  assert.equal(observed[0].service, 'orders');
  assert.equal(observed[0].url, '/api/pedidos/7/pagar');
  assert.equal(observed[0].serviceToken, serviceToken);
  assert.equal(observed[0].userId, 'u-1');
});

test('only administrators can advance shipping state through the legacy order update', async () => {
  const clientToken = jwt.sign({ sub: 'u-1', role: 'client' }, jwtSecret);
  const denied = await fetch(`${gatewayUrl}/api/pedidos/7`, {
    method: 'PUT',
    headers: { authorization: 'Bearer ' + clientToken, 'content-type': 'application/json' },
    body: JSON.stringify({ estado: 'Enviado' }),
  });
  assert.equal(denied.status, 403);

  const adminToken = jwt.sign({ sub: 'admin-1', role: 'admin' }, jwtSecret);
  const response = await fetch(`${gatewayUrl}/api/pedidos/7`, {
    method: 'PUT',
    headers: { authorization: 'Bearer ' + adminToken, 'content-type': 'application/json' },
    body: JSON.stringify({ estado: 'Enviado' }),
  });
  assert.equal(response.status, 200);
  const stateUpdate = observed.find((call) => call.service === 'orders' && call.method === 'PATCH');
  assert.equal(stateUpdate.body.estado, 'shipped');
  assert.equal(stateUpdate.serviceToken, serviceToken);
});
