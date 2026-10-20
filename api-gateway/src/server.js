require('dotenv').config();
const { createApp } = require('./app');

const required = ['JWT_SECRET', 'SERVICE_TOKEN', 'USERS_SERVICE_URL', 'CATALOG_SERVICE_URL', 'ORDERS_SERVICE_URL'];
for (const key of required) {
  if (!process.env[key]) throw new Error(`${key} is required`);
}
if (process.env.JWT_SECRET.length < 32 || process.env.SERVICE_TOKEN.length < 32) {
  throw new Error('JWT_SECRET and SERVICE_TOKEN must contain at least 32 characters');
}

const app = createApp({
  usersUrl: process.env.USERS_SERVICE_URL,
  catalogUrl: process.env.CATALOG_SERVICE_URL,
  ordersUrl: process.env.ORDERS_SERVICE_URL,
  timeoutMs: Math.max(Number(process.env.UPSTREAM_TIMEOUT_MS || 5000), 500),
});
const port = Number(process.env.PORT || 3000);
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`API Gateway listening on port ${port}`);
  app.locals.reconcilePendingOrders();
});
const reconciliationTimer = setInterval(() => app.locals.reconcilePendingOrders(), 30_000);
reconciliationTimer.unref();

function shutdown() {
  clearInterval(reconciliationTimer);
  server.close(() => process.exit(0));
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
