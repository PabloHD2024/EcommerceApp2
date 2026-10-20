const assert = require('node:assert/strict');
const http = require('node:http');
const { afterEach, beforeEach, test } = require('node:test');
const jwt = require('jsonwebtoken');
const { createApp } = require('../src/app');

const jwtSecret = 'test-jwt-secret-that-is-long-enough-for-this-suite';
const serviceToken = 'test-service-token-that-is-long-enough-for-this-suite';
let server;
let baseUrl;
let calls;
let pool;

beforeEach(async () => {
  process.env.JWT_SECRET = jwtSecret;
  process.env.SERVICE_TOKEN = serviceToken;
  calls = [];
  pool = {
    async query(sql, values) {
      calls.push({ sql, values });
      if (sql.includes('COUNT(*)')) return { rows: [{ count: 1 }], rowCount: 1 };
      if (sql.includes('SELECT * FROM products')) {
        return {
          rows: [{
            id: '31', name: 'Café', price_cents: '159900', stock: 4, category_name: 'Cocina',
            description: 'Café de prueba', image: null, rating: '4.5', reviews: 7,
            valid_from: null, valid_to: null,
          }],
          rowCount: 1,
        };
      }
      if (sql.includes('INSERT INTO products')) {
        return {
          rows: [{
            id: '31', name: values[0], price_cents: values[1], stock: values[2],
            category_name: values[3], description: values[4], image: values[5],
            rating: '0', reviews: 0, valid_from: null, valid_to: null,
          }],
          rowCount: 1,
        };
      }
      throw new Error(`Unexpected SQL in test: ${sql}`);
    },
    async connect() {
      throw new Error('Unexpected inventory transaction in this test');
    },
  };
  server = http.createServer(createApp(pool));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

afterEach(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
});

test('product listing uses bound filters and formats integer cents as currency', async () => {
  const response = await fetch(`${baseUrl}/api/productos?categoria=Cocina&nombre=Caf&page=1&limit=2`);
  const result = await response.json();
  assert.equal(response.status, 200);
  assert.equal(result.items[0].price, 1599);
  assert.equal(result.items[0].precio, 1599);
  assert.deepEqual(calls[1].values, ['Cocina', '%Caf%', 2, 0]);
  assert.match(calls[1].sql, /name ILIKE \$2/);
});

test('product writes require an administrator JWT', async () => {
  const token = jwt.sign({ sub: 'admin-1', role: 'admin' }, jwtSecret);
  const response = await fetch(`${baseUrl}/api/productos`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ nombre: 'Café', categoria: 'Cocina', precio: 1599.99, stock: 4 }),
  });
  const result = await response.json();
  assert.equal(response.status, 201);
  assert.equal(result.producto.precio, 1599.99);
  assert.equal(calls[0].values[1], 159999);
});

test('inventory writes reject caller JWTs without the service credential', async () => {
  const token = jwt.sign({ sub: 'customer-1', role: 'client' }, jwtSecret);
  const response = await fetch(`${baseUrl}/api/movimientos-stock`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ orderId: '7', idempotencyKey: 'order:7:sale', items: [{ productId: 31, quantity: 1 }] }),
  });
  assert.equal(response.status, 403);
  assert.equal(calls.length, 0);
});

test('inventory returns restore stock and coupon use only once', async () => {
  let stock = 1;
  let couponUses = 1;
  let returnOperation = null;
  const saleItems = [{
    productId: 31,
    quantity: 2,
    productName: 'Café',
    unitPriceCents: 6000,
    subtotalCents: 12000,
  }];
  pool = {
    async query(sql, values) {
      calls.push({ sql, values });
      throw new Error(`Unexpected query: ${sql}`);
    },
    async connect() {
      return {
        async query(sql, values) {
          calls.push({ sql, values });
          if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') return { rows: [], rowCount: 0 };
          if (sql.includes('INSERT INTO inventory_operations')) {
            if (returnOperation) return { rows: [], rowCount: 0 };
            returnOperation = {
              id: 22,
              order_id: values[0],
              idempotency_key: values[1],
              request_hash: values[2],
              status: 'confirmed',
              result: {},
            };
            return { rows: [{ id: returnOperation.id }], rowCount: 1 };
          }
          if (sql.includes('SELECT order_id, idempotency_key')) {
            return { rows: returnOperation ? [{ ...returnOperation }] : [], rowCount: returnOperation ? 1 : 0 };
          }
          if (sql.includes('SELECT result FROM inventory_operations')) {
            return { rows: [{ result: { items: saleItems, couponCode: 'AHORRO' } }], rowCount: 1 };
          }
          if (sql.includes('SELECT id FROM products')) {
            return { rows: [{ id: '31' }], rowCount: 1 };
          }
          if (sql.includes('UPDATE products SET stock = stock +')) {
            stock += Number(values[0]);
            return { rows: [], rowCount: 1 };
          }
          if (sql.includes("INSERT INTO stock_movements")) return { rows: [], rowCount: 1 };
          if (sql.includes('UPDATE coupons SET usage_count')) {
            couponUses -= 1;
            return { rows: [], rowCount: 1 };
          }
          if (sql.includes('UPDATE inventory_operations SET result')) {
            returnOperation.result = JSON.parse(values[0]);
            return { rows: [], rowCount: 1 };
          }
          throw new Error(`Unexpected transaction query: ${sql}`);
        },
        release() {},
      };
    },
  };
  await new Promise((resolve) => server.close(resolve));
  server = http.createServer(createApp(pool));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  const request = () => fetch(`${baseUrl}/api/movimientos-stock`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-service-token': serviceToken,
    },
    body: JSON.stringify({
      action: 'return',
      orderId: '7',
      idempotencyKey: 'order:7:sale',
      items: [{ productId: 31, quantity: 2 }],
    }),
  });

  const first = await request();
  assert.equal(first.status, 201);
  assert.equal(stock, 3);
  assert.equal(couponUses, 0);

  const retry = await request();
  assert.equal(retry.status, 200);
  assert.equal(stock, 3);
  assert.equal(couponUses, 0);
});
