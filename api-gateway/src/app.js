const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

class UpstreamError extends Error {
  constructor(message, status = 502, uncertain = false) {
    super(message);
    this.status = status;
    this.uncertain = uncertain;
  }
}

function createApp({ usersUrl, catalogUrl, ordersUrl, timeoutMs }) {
  const app = express();
  app.use(cors({
    origin: process.env.FRONTEND_ORIGIN
      ? process.env.FRONTEND_ORIGIN.split(',').map((origin) => origin.trim())
      : ['http://127.0.0.1:5500', 'http://localhost:5500'],
    credentials: false,
  }));
  app.use(express.json({ limit: '256kb' }));

  const services = { users: usersUrl, catalog: catalogUrl, orders: ordersUrl };

  async function callService(service, pathname, options = {}) {
    const target = new URL(pathname, services[service]);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(target, {
        method: options.method || 'GET',
        headers: {
          ...(options.headers || {}),
          ...(options.body === undefined ? {} : { 'content-type': 'application/json' }),
          ...(options.internal ? { 'x-service-token': process.env.SERVICE_TOKEN } : {}),
        },
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: controller.signal,
      });
      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        throw new UpstreamError(`${service} returned a non-JSON response`);
      }
      return { status: response.status, data };
    } catch (error) {
      if (error instanceof UpstreamError) throw error;
      if (error.name === 'AbortError') {
        throw new UpstreamError(`${service} did not respond before timeout`, 504, true);
      }
      throw new UpstreamError(`${service} is unavailable`, 503, true);
    } finally {
      clearTimeout(timer);
    }
  }

  function readUser(req) {
    const authorization = req.get('authorization') || '';
    const [scheme, token] = authorization.split(' ');
    if (scheme !== 'Bearer' || !token) return null;
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return null;
    }
  }

  function requireAuth(req, res, next) {
    req.user = readUser(req);
    if (!req.user || !(req.user.sub || req.user.id) || !['admin', 'client'].includes(req.user.role)) {
      return res.status(401).json({ message: 'Autenticación requerida' });
    }
    return next();
  }

  function serviceHeaders(req) {
    return {
      'x-user-id': String(req.user.sub || req.user.id),
      'x-user-email': String(req.user.email || ''),
      'x-user-name': [req.user.name, req.user.apellido].filter(Boolean).join(' '),
      'x-user-role': String(req.user.role || ''),
      ...(req.get('authorization') ? { authorization: req.get('authorization') } : {}),
    };
  }

  app.get('/health', async (_req, res) => {
    const health = {};
    await Promise.all(Object.entries(services).map(async ([name, base]) => {
      try {
        const response = await fetch(new URL('/health', base), { signal: AbortSignal.timeout(timeoutMs) });
        health[name] = response.ok ? 'ok' : 'unavailable';
      } catch {
        health[name] = 'unavailable';
      }
    }));
    const ready = Object.values(health).every((status) => status === 'ok');
    return res.status(ready ? 200 : 503).json({ status: ready ? 'ok' : 'degraded', services: health });
  });

  async function proxy(req, res, service, pathname, extraHeaders = {}) {
    try {
      const upstreamMethod = service === 'users' && pathname === '/api/usuarios/me/carrito' && req.method === 'POST'
        ? 'PUT'
        : req.method;
      let body = req.body;
      if (service === 'users' && pathname === '/api/usuarios/me/carrito' && req.method === 'POST') {
        body = {
          carrito: (Array.isArray(req.body?.carrito) ? req.body.carrito : []).map((item) => ({
            productId: item?.productId ?? item?.id,
            quantity: item?.quantity,
          })),
        };
      }
      const result = await callService(service, pathname, {
        method: upstreamMethod,
        internal: service === 'orders',
        headers: { ...extraHeaders, ...(req.get('authorization') ? { authorization: req.get('authorization') } : {}) },
        ...(upstreamMethod === 'GET' || upstreamMethod === 'HEAD' ? {} : { body }),
      });
      return res.status(result.status).json(result.data);
    } catch (error) {
      console.error(`Gateway request to ${service} failed:`, error.message);
      return res.status(error.status || 502).json({
        message: error.uncertain ? 'El resultado de la operación es incierto; consultá su estado antes de reintentar.' : 'Servicio no disponible',
        uncertain: Boolean(error.uncertain),
      });
    }
  }

  app.post('/api/pedidos', requireAuth, async (req, res) => {
    const idempotencyKey = req.get('idempotency-key');
    if (typeof idempotencyKey !== 'string' || !idempotencyKey.trim() || idempotencyKey.length > 128) {
      return res.status(400).json({ message: 'El header Idempotency-Key es obligatorio y debe tener hasta 128 caracteres' });
    }
    const rawItems = Array.isArray(req.body?.items) ? req.body.items : req.body?.productos;
    const items = Array.isArray(rawItems) ? rawItems.map((item) => ({
      productId: item?.productId ?? item?.productoId,
      quantity: item?.quantity ?? item?.cantidad,
    })) : rawItems;
    const couponCode = req.body?.couponCode ?? req.body?.cupon ?? null;
    const pending = await callService('orders', '/api/pedidos', {
      method: 'POST',
      internal: true,
      headers: {
        ...serviceHeaders(req),
        'idempotency-key': idempotencyKey,
      },
      body: { items, couponCode },
    }).catch((error) => {
      console.error('Could not create or recover pending order:', error.message);
      if (error.uncertain) {
        res.status(202).json({ estado: 'pendiente', attemptId: idempotencyKey, uncertain: true });
        return null;
      }
      res.status(error.status || 502).json({ message: 'No se pudo crear el pedido' });
      return null;
    });
    if (!pending) return;
    if (pending.status >= 400) return res.status(pending.status).json(pending.data);

    const order = pending.data;
    if (order.estado === 'confirmed' || order.estado === 'paid') {
      return res.status(pending.status === 201 ? 201 : 200).json(order);
    }
    if (order.estado === 'rejected' || order.estado === 'cancelled') {
      return res.status(409).json(order);
    }

    return confirmOrder(order).then((confirmed) => {
      if (confirmed.kind === 'confirmed') {
        return res.status(pending.status === 201 ? 201 : 200).json(confirmed.order);
      }
      if (confirmed.kind === 'rejected') {
        return res.status(409).json(confirmed.order);
      }
      return res.status(202).json({
        pedidoId: order.id,
        estado: 'pending',
        attemptId: idempotencyKey,
        uncertain: true,
      });
    }).catch((error) => {
      console.error('Order confirmation failed:', error.message);
      return res.status(error.status || 502).json({
        pedidoId: order.id,
        estado: 'pending',
        uncertain: true,
        message: 'El pedido sigue pendiente de conciliación.',
      });
    });
  });

  app.get('/api/pedidos/operaciones/:attemptId', requireAuth, async (req, res) => {
    try {
      const result = await callService(
        'orders',
        `/api/pedidos/internal/intentos/${encodeURIComponent(req.params.attemptId)}`,
        { internal: true, headers: serviceHeaders(req) },
      );
      if (result.status !== 200) return res.status(result.status).json(result.data);
      const order = result.data;
      if (order.estado === 'pending') {
        const recovered = await confirmOrder(order);
        if (recovered.kind === 'confirmed') return res.status(200).json(recovered.order);
        if (recovered.kind === 'rejected') return res.status(409).json(recovered.order);
        return res.status(202).json({ pedidoId: order.id, estado: 'pending', attemptId: order.attemptId, uncertain: true });
      }
      return res.status(order.estado === 'rejected' ? 409 : 200).json(order);
    } catch (error) {
      console.error('Could not query order attempt:', error.message);
      return res.status(error.status || 502).json({
        message: error.uncertain ? 'No se pudo determinar todavía el resultado.' : 'No se pudo consultar el pedido',
        uncertain: Boolean(error.uncertain),
      });
    }
  });

  async function confirmOrder(order) {
    const items = (order.detalles || []).map((item) => ({
      productId: item.productoId,
      quantity: item.cantidad,
    }));
    let inventory;
    try {
      inventory = await callService('catalog', '/api/movimientos-stock', {
        method: 'POST',
        internal: true,
        body: {
          orderId: String(order.id),
          idempotencyKey: `order:${order.id}:sale`,
          items,
          couponCode: order.cuponCodigo || null,
        },
      });
    } catch (error) {
      if (error.uncertain) return { kind: 'pending' };
      throw error;
    }

    if (inventory.status === 409) {
      const rejected = await callService('orders', `/api/pedidos/${order.id}`, {
        method: 'PATCH',
        internal: true,
        body: { estado: 'rejected' },
      });
      return { kind: 'rejected', order: rejected.data };
    }
    if (![200, 201].includes(inventory.status)) {
      throw new UpstreamError('Catalog did not confirm the inventory operation', 502, true);
    }

    let finalized;
    try {
      finalized = await callService('orders', `/api/pedidos/${order.id}`, {
        method: 'PATCH',
        internal: true,
        body: { estado: 'confirmed', inventory: inventory.data },
      });
    } catch (error) {
      if (error.uncertain) return { kind: 'pending' };
      throw error;
    }
    if (finalized.status >= 400) throw new UpstreamError('Orders could not persist the confirmation', 502, true);
    return { kind: 'confirmed', order: finalized.data };
  }

  async function reconcilePendingOrders() {
    try {
      const pending = await callService('orders', '/api/pedidos/internal/pendientes', { internal: true });
      if (pending.status !== 200 || !Array.isArray(pending.data)) {
        throw new UpstreamError('Orders returned an invalid reconciliation response');
      }
      for (const order of pending.data) {
        try {
          await confirmOrder(order);
        } catch (error) {
          console.error(`Could not reconcile order ${order.id}:`, error.message);
        }
      }
    } catch (error) {
      console.error('Pending-order reconciliation failed:', error.message);
    }
    try {
      const cancellations = await callService('orders', '/api/pedidos/internal/cancelaciones', { internal: true });
      if (cancellations.status !== 200 || !Array.isArray(cancellations.data)) {
        throw new UpstreamError('Orders returned an invalid cancellation response');
      }
      for (const order of cancellations.data) {
        try {
          await completeCancellation(order, {
            'x-user-id': String(order.userId),
            'x-user-role': 'client',
          });
        } catch (error) {
          console.error(`Could not reconcile cancellation for order ${order.id}:`, error.message);
        }
      }
    } catch (error) {
      console.error('Pending-cancellation reconciliation failed:', error.message);
    }
  }

  async function completeCancellation(order, headers) {
    if (order.estado === 'cancelled') return { kind: 'cancelled', order };
    if (order.estado !== 'cancelling') throw new UpstreamError('Order is not awaiting cancellation', 409);
    const returned = await callService('catalog', '/api/movimientos-stock', {
      method: 'POST',
      internal: true,
      body: {
        action: 'return',
        orderId: String(order.id),
        idempotencyKey: `order:${order.id}:sale`,
        items: (order.detalles || []).map((item) => ({
          productId: item.productoId,
          quantity: item.cantidad,
        })),
      },
    });
    if (![200, 201].includes(returned.status)) {
      throw new UpstreamError(returned.data?.message || 'Catalog could not return the order inventory', returned.status, returned.status >= 500);
    }
    const finalized = await callService('orders', `/api/pedidos/${order.id}`, {
      method: 'PATCH',
      internal: true,
      headers,
      body: { estado: 'cancelled' },
    });
    if (finalized.status >= 400) {
      throw new UpstreamError('Orders could not persist the cancellation', 502, true);
    }
    return { kind: 'cancelled', order: finalized.data };
  }

  app.patch('/api/pedidos/:id/cancelar', requireAuth, async (req, res) => {
    if (req.user.role !== 'client') {
      return res.status(403).json({ mensaje: 'Solo el cliente puede cancelar este pedido' });
    }
    if (!/^\d+$/.test(req.params.id)) return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    const headers = serviceHeaders(req);
    try {
      const started = await callService('orders', `/api/pedidos/${req.params.id}`, {
        method: 'PATCH',
        internal: true,
        headers,
        body: { estado: 'cancelling' },
      });
      if (started.status >= 400) return res.status(started.status).json(started.data);
      const result = await completeCancellation(started.data, headers);
      return res.json({ mensaje: 'Pedido cancelado y stock restituido', pedido: result.order });
    } catch (error) {
      console.error(`Order cancellation failed for ${req.params.id}:`, error.message);
      if (error.uncertain) {
        return res.status(202).json({
          mensaje: 'La cancelación sigue pendiente de sincronizar; consultá el pedido nuevamente.',
          estado: 'cancelling',
          uncertain: true,
        });
      }
      return res.status(error.status || 502).json({ mensaje: error.message });
    }
  });

  app.use('/api', async (req, res) => {
    const method = req.method.toUpperCase();
    const pathname = req.originalUrl;
    let service;
    let target;
    let headers = {};

    if (pathname.startsWith('/api/auth/login')) {
      service = 'users';
      target = pathname.replace('/api/auth/login', '/api/sesiones');
    } else if (pathname.startsWith('/api/auth/register')) {
      service = 'users';
      target = pathname.replace('/api/auth/register', '/api/usuarios');
    } else if (pathname.startsWith('/api/auth/profile')) {
      service = 'users';
      target = pathname.replace('/api/auth/profile', '/api/usuarios/me');
    } else if (pathname.startsWith('/api/auth/admin-session')) {
      service = 'users';
      target = pathname.replace('/api/auth/admin-session', '/api/usuarios/admin-session');
    } else if (pathname.startsWith('/api/sesiones')) {
      service = 'users';
      target = pathname;
    } else if (pathname.startsWith('/api/clientes/carrito/recuperar')) {
      service = 'users';
      target = pathname.replace('/api/clientes/carrito/recuperar', '/api/usuarios/me/carrito');
    } else if (pathname.startsWith('/api/clientes/carrito')) {
      service = 'users';
      target = pathname.replace('/api/clientes/carrito', '/api/usuarios/me/carrito');
    } else if (pathname === '/api/usuarios' && method === 'POST' && readUser(req)?.role === 'admin') {
      service = 'users';
      target = '/api/usuarios/admin';
    } else if (pathname.startsWith('/api/usuarios')) {
      service = 'users';
      target = pathname;
    } else if (pathname.startsWith('/api/productos') || pathname.startsWith('/api/categorias')) {
      service = 'catalog';
      target = pathname;
    } else if (pathname.startsWith('/api/cupones/aplicar/')) {
      service = 'catalog';
      target = pathname.replace('/api/cupones/aplicar/', '/api/cupones/code/');
    } else if (pathname.startsWith('/api/cupones')) {
      service = 'catalog';
      target = pathname;
      const couponId = pathname.match(/^\/api\/cupones\/(\d+)/)?.[1];
      if (couponId && (method === 'GET' || method === 'PUT' || method === 'DELETE')) {
        target = `/api/cupones/admin/${couponId}`;
      } else if (method === 'GET' && /^\/api\/cupones\/[^/]+/.test(pathname)) {
        const couponCode = pathname.match(/^\/api\/cupones\/([^/?]+)/)?.[1];
        if (couponCode && couponCode !== 'code' && couponCode !== 'aplicar') {
          target = `/api/cupones/code/${encodeURIComponent(couponCode)}`;
        }
      }
    } else if (pathname.startsWith('/api/pedidos')) {
      service = 'orders';
      target = pathname;
    } else {
      return res.status(404).json({ message: 'Ruta no encontrada' });
    }

    const publicRegistration = service === 'users' && method === 'POST'
      && (pathname === '/api/usuarios' || pathname === '/api/sesiones' || pathname.startsWith('/api/auth/register'));
    const couponValidation = service === 'catalog' && method === 'GET'
      && pathname.startsWith('/api/cupones/aplicar/');
    const protectedCouponRead = service === 'catalog' && method === 'GET'
      && (pathname === '/api/cupones' || /^\/api\/cupones\/\d+/.test(pathname));
    if (service === 'orders' || (service === 'users' && !publicRegistration
      && !pathname.startsWith('/api/auth/login')) || (service === 'catalog'
        && (method !== 'GET' || protectedCouponRead) && !couponValidation)) {
      req.user = readUser(req);
      if (!req.user) return res.status(401).json({ message: 'Autenticación requerida' });
      headers = serviceHeaders(req);
    }

    if (service === 'orders') {
      if (pathname.startsWith('/api/pedidos/internal/')) {
        return res.status(403).json({ message: 'La ruta interna no está disponible para clientes' });
      }
      if (method === 'PUT' && /^\/api\/pedidos\/\d+$/.test(pathname)) {
        if (req.user.role !== 'admin') {
          return res.status(403).json({ message: 'Se requieren permisos de administrador' });
        }
        const nextState = { Enviado: 'shipped', Entregado: 'delivered' }[req.body?.estado];
        if (!nextState) return res.status(400).json({ message: 'Transición de pedido inválida' });
        try {
          const result = await callService('orders', pathname, {
            method: 'PATCH',
            internal: true,
            headers,
            body: { estado: nextState },
          });
          return res.status(result.status).json(result.data);
        } catch (error) {
          console.error('Gateway request to orders failed:', error.message);
          return res.status(error.status || 502).json({ message: 'Servicio no disponible' });
        }
      }
      if (method === 'PATCH') {
        return res.status(403).json({ message: 'La transición de estado es una operación interna' });
      }
      return proxy(req, res, service, target, {
        ...headers,
        ...(req.get('idempotency-key') ? { 'idempotency-key': req.get('idempotency-key') } : {}),
      });
    }
    return proxy(req, res, service, target, headers);
  });

  app.locals.reconcilePendingOrders = reconcilePendingOrders;
  return app;
}

module.exports = { createApp, UpstreamError };
