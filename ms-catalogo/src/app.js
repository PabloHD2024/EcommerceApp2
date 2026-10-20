const express = require('express');
const { requireAdmin, requireService, requireUser } = require('./auth');

const moneyToCents = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? Math.round((amount + Number.EPSILON) * 100) : null;
};

const formatProduct = (row) => ({
  id: Number(row.id),
  name: row.name,
  nombre: row.name,
  price: Number(row.price_cents) / 100,
  precio: Number(row.price_cents) / 100,
  stock: row.stock,
  categoria: row.category_name,
  descripcion: row.description,
  image: row.image,
  rating: Number(row.rating),
  reviews: row.reviews,
  validFrom: row.valid_from,
  validTo: row.valid_to,
});

function createApp(pool) {
  const app = express();
  app.use(express.json({ limit: '256kb' }));

  app.get('/health', async (_req, res) => {
    try {
      await pool.query('SELECT 1');
      res.json({ status: 'ok', service: 'catalog' });
    } catch (error) {
      console.error('Catalog health check failed:', error);
      res.status(503).json({ status: 'unavailable', service: 'catalog' });
    }
  });

  app.get('/api/productos', async (req, res) => {
    try {
      const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
      const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 6, 1), 100);
      const sortColumn = { nombre: 'name', precio: 'price_cents', id: 'id' }[req.query.sortBy] || 'id';
      const sortOrder = String(req.query.sortOrder || 'ASC').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      const filters = ['active = TRUE', '(valid_from IS NULL OR valid_from <= NOW())', '(valid_to IS NULL OR valid_to >= NOW())'];
      const values = [];

      if (typeof req.query.categoria === 'string' && req.query.categoria.trim()) {
        values.push(req.query.categoria.trim());
        filters.push(`category_name = $${values.length}`);
      }
      if (typeof req.query.nombre === 'string' && req.query.nombre.trim()) {
        values.push(`%${req.query.nombre.trim()}%`);
        filters.push(`name ILIKE $${values.length}`);
      }

      const where = filters.join(' AND ');
      const countResult = await pool.query(`SELECT COUNT(*)::int AS count FROM products WHERE ${where}`, values);
      const count = countResult.rows[0].count;
      const rows = await pool.query(
        `SELECT * FROM products WHERE ${where} ORDER BY ${sortColumn} ${sortOrder} LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
        [...values, limit, (page - 1) * limit],
      );
      res.json({
        items: rows.rows.map(formatProduct),
        pagination: {
          page,
          limit,
          totalItems: count,
          totalPages: Math.ceil(count / limit),
          hasPreviousPage: page > 1,
          hasNextPage: page < Math.ceil(count / limit),
        },
      });
    } catch (error) {
      console.error('Failed to list catalog products:', error);
      res.status(500).json({ message: 'No se pudo consultar el catálogo' });
    }
  });

  app.get('/api/productos/:id', async (req, res) => {
    try {
      if (!/^\d+$/.test(req.params.id)) return res.status(404).json({ message: 'Producto no encontrado' });
      const result = await pool.query(
        `SELECT * FROM products
         WHERE id = $1 AND active = TRUE
           AND (valid_from IS NULL OR valid_from <= NOW())
           AND (valid_to IS NULL OR valid_to >= NOW())`,
        [req.params.id],
      );
      if (!result.rowCount) return res.status(404).json({ message: 'Producto no encontrado' });
      return res.json(formatProduct(result.rows[0]));
    } catch (error) {
      console.error('Failed to get catalog product:', error);
      return res.status(500).json({ message: 'No se pudo consultar el producto' });
    }
  });

  app.get('/api/categorias', async (_req, res) => {
    try {
      const result = await pool.query('SELECT DISTINCT category_name AS name FROM products WHERE active = TRUE ORDER BY category_name ASC');
      res.json(result.rows.map((row) => row.name));
    } catch (error) {
      console.error('Failed to list catalog categories:', error);
      res.status(500).json({ message: 'No se pudieron consultar las categorías' });
    }
  });

  app.get('/api/cupones', requireUser, requireAdmin, async (req, res) => {
    try {
      const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
      const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 100);
      const countResult = await pool.query('SELECT COUNT(*)::int AS count FROM coupons');
      const result = await pool.query(
        'SELECT * FROM coupons ORDER BY id ASC LIMIT $1 OFFSET $2',
        [limit, (page - 1) * limit],
      );
      const items = result.rows.map((coupon) => ({
        id: Number(coupon.id),
        codigo: coupon.code,
        descuento: coupon.discount_percent,
        fecha_vencimiento: coupon.expires_on,
        limite_stock: coupon.usage_limit,
        usos_actuales: coupon.usage_count,
        activo: coupon.active,
      }));
      const count = countResult.rows[0].count;
      return res.json({
        items,
        pagination: {
          page, limit, totalItems: count, totalPages: Math.ceil(count / limit),
          hasPreviousPage: page > 1, hasNextPage: page < Math.ceil(count / limit),
        },
      });
    } catch (error) {
      console.error('Failed to list coupons:', error);
      return res.status(500).json({ message: 'No se pudieron consultar los cupones' });
    }
  });

  app.post('/api/cupones', requireUser, requireAdmin, async (req, res) => {
    const { codigo, descuento, fecha_vencimiento, limite_stock, activo = true } = req.body || {};
    if (typeof codigo !== 'string' || !codigo.trim() || !Number.isInteger(Number(descuento))
      || Number(descuento) < 1 || Number(descuento) > 100 || !Number.isInteger(Number(limite_stock))
      || Number(limite_stock) < 1 || !/^\d{4}-\d{2}-\d{2}$/.test(String(fecha_vencimiento))
      || typeof activo !== 'boolean') {
      return res.status(400).json({ message: 'Datos de cupón inválidos' });
    }
    try {
      const result = await pool.query(
        `INSERT INTO coupons (code, discount_percent, expires_on, usage_limit, active)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [codigo.trim().toUpperCase(), Number(descuento), fecha_vencimiento, Number(limite_stock), activo],
      );
      const coupon = result.rows[0];
      return res.status(201).json({ success: true, cupon: {
        id: Number(coupon.id), codigo: coupon.code, descuento: coupon.discount_percent,
        fecha_vencimiento: coupon.expires_on, limite_stock: coupon.usage_limit,
        usos_actuales: coupon.usage_count, activo: coupon.active,
      } });
    } catch (error) {
      if (error.code === '23505') return res.status(409).json({ message: 'El código de cupón ya existe' });
      console.error('Failed to create coupon:', error);
      return res.status(500).json({ message: 'No se pudo crear el cupón' });
    }
  });

  app.get('/api/cupones/code/:code', async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT code, discount_percent, expires_on, usage_limit, usage_count, active
         FROM coupons WHERE code = $1`,
        [req.params.code.trim().toUpperCase()],
      );
      const coupon = result.rows[0];
      const valid = coupon
        && coupon.active
        && coupon.expires_on >= new Date().toISOString().slice(0, 10)
        && coupon.usage_count < coupon.usage_limit;
      if (!valid) return res.status(404).json({ valido: false, mensaje: 'El cupón no existe, venció o no está disponible' });
      return res.json({ valido: true, codigo: coupon.code, descuento: coupon.discount_percent });
    } catch (error) {
      console.error('Failed to validate coupon:', error);
      return res.status(500).json({ message: 'No se pudo validar el cupón' });
    }
  });

  app.put('/api/cupones/admin/:id', requireUser, requireAdmin, async (req, res) => {
    const { codigo, descuento, fecha_vencimiento, limite_stock, activo } = req.body || {};
    if (!/^\d+$/.test(req.params.id) || typeof codigo !== 'string' || !codigo.trim()
      || !Number.isInteger(Number(descuento)) || Number(descuento) < 1 || Number(descuento) > 100
      || !Number.isInteger(Number(limite_stock)) || Number(limite_stock) < 1
      || !/^\d{4}-\d{2}-\d{2}$/.test(String(fecha_vencimiento)) || typeof activo !== 'boolean') {
      return res.status(400).json({ message: 'Datos de cupón inválidos' });
    }
    try {
      const result = await pool.query(
        `UPDATE coupons SET code = $1, discount_percent = $2, expires_on = $3,
          usage_limit = $4, active = $5 WHERE id = $6 RETURNING *`,
        [codigo.trim().toUpperCase(), Number(descuento), fecha_vencimiento, Number(limite_stock), activo, req.params.id],
      );
      if (!result.rowCount) return res.status(404).json({ message: 'Cupón no encontrado' });
      const coupon = result.rows[0];
      return res.json({ success: true, cupon: {
        id: Number(coupon.id), codigo: coupon.code, descuento: coupon.discount_percent,
        fecha_vencimiento: coupon.expires_on, limite_stock: coupon.usage_limit,
        usos_actuales: coupon.usage_count, activo: coupon.active,
      } });
    } catch (error) {
      if (error.code === '23505') return res.status(409).json({ message: 'El código de cupón ya existe' });
      console.error('Failed to update coupon:', error);
      return res.status(500).json({ message: 'No se pudo actualizar el cupón' });
    }
  });

  app.delete('/api/cupones/admin/:id', requireUser, requireAdmin, async (req, res) => {
    if (!/^\d+$/.test(req.params.id)) return res.status(404).json({ message: 'Cupón no encontrado' });
    try {
      const result = await pool.query('UPDATE coupons SET active = FALSE WHERE id = $1', [req.params.id]);
      if (!result.rowCount) return res.status(404).json({ message: 'Cupón no encontrado' });
      return res.status(204).end();
    } catch (error) {
      console.error('Failed to deactivate coupon:', error);
      return res.status(500).json({ message: 'No se pudo eliminar el cupón' });
    }
  });

  app.post('/api/productos', requireUser, requireAdmin, async (req, res) => {
    const { nombre, categoria, descripcion = '', image = null, validFrom = null, validTo = null } = req.body || {};
    const priceCents = moneyToCents(req.body?.precio);
    const stock = Number(req.body?.stock);
    if (typeof nombre !== 'string' || !nombre.trim() || typeof categoria !== 'string' || !categoria.trim()
      || priceCents === null || !Number.isInteger(stock) || stock < 0) {
      return res.status(400).json({ message: 'Datos de producto inválidos' });
    }
    try {
      const created = await pool.query(
        `INSERT INTO products (name, price_cents, stock, category_name, description, image, valid_from, valid_to)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [nombre.trim(), priceCents, stock, categoria.trim(), String(descripcion).trim(), image, validFrom, validTo],
      );
      return res.status(201).json({ producto: formatProduct(created.rows[0]) });
    } catch (error) {
      console.error('Failed to create catalog product:', error);
      return res.status(500).json({ message: 'No se pudo crear el producto' });
    }
  });

  app.put('/api/productos/:id', requireUser, requireAdmin, async (req, res) => {
    const { nombre, categoria, descripcion = '', image = null, validFrom = null, validTo = null } = req.body || {};
    const priceCents = moneyToCents(req.body?.precio);
    const stock = Number(req.body?.stock);
    if (!/^\d+$/.test(req.params.id) || typeof nombre !== 'string' || !nombre.trim()
      || typeof categoria !== 'string' || !categoria.trim() || priceCents === null
      || !Number.isInteger(stock) || stock < 0) {
      return res.status(400).json({ message: 'Datos de producto inválidos' });
    }
    try {
      const result = await pool.query(
        `UPDATE products SET name = $1, price_cents = $2, stock = $3, category_name = $4,
          description = $5, image = $6, valid_from = $7, valid_to = $8, updated_at = NOW()
         WHERE id = $9 RETURNING *`,
        [nombre.trim(), priceCents, stock, categoria.trim(), String(descripcion).trim(), image, validFrom, validTo, req.params.id],
      );
      if (!result.rowCount) return res.status(404).json({ message: 'Producto no encontrado' });
      return res.json({ producto: formatProduct(result.rows[0]) });
    } catch (error) {
      console.error('Failed to update catalog product:', error);
      return res.status(500).json({ message: 'No se pudo actualizar el producto' });
    }
  });

  app.delete('/api/productos/:id', requireUser, requireAdmin, async (req, res) => {
    if (!/^\d+$/.test(req.params.id)) return res.status(404).json({ message: 'Producto no encontrado' });
    try {
      const result = await pool.query('UPDATE products SET active = FALSE, updated_at = NOW() WHERE id = $1', [req.params.id]);
      if (!result.rowCount) return res.status(404).json({ message: 'Producto no encontrado' });
      return res.status(204).end();
    } catch (error) {
      console.error('Failed to deactivate catalog product:', error);
      return res.status(500).json({ message: 'No se pudo eliminar el producto' });
    }
  });

  app.post('/api/movimientos-stock', requireService, async (req, res) => {
    const { orderId, idempotencyKey, items, couponCode = null, action = 'sale' } = req.body || {};
    if (typeof orderId !== 'string' || !orderId || typeof idempotencyKey !== 'string' || !idempotencyKey
      || !Array.isArray(items) || items.length === 0 || items.length > 100
      || !['sale', 'return'].includes(action)) {
      return res.status(400).json({ message: 'Solicitud de inventario inválida' });
    }
    if (couponCode !== null && typeof couponCode !== 'string') {
      return res.status(400).json({ message: 'El código de cupón debe ser texto' });
    }

    const quantities = new Map();
    for (const item of items) {
      const productId = Number(item.productId);
      const quantity = Number(item.quantity);
      if (!Number.isSafeInteger(productId) || productId <= 0 || !Number.isSafeInteger(quantity) || quantity <= 0) {
        return res.status(400).json({ message: 'Cada artículo requiere producto y cantidad válidos' });
      }
      quantities.set(productId, (quantities.get(productId) || 0) + quantity);
      if (!Number.isSafeInteger(quantities.get(productId))) {
        return res.status(400).json({ message: 'La cantidad total excede el límite permitido' });
      }
    }
    const canonicalItems = [...quantities.entries()]
      .sort(([a], [b]) => a - b)
      .map(([productId, quantity]) => ({ productId, quantity }));
    if (action === 'return') {
      if (orderId.length > 100 || couponCode !== null) {
        return res.status(400).json({ message: 'Solicitud de devolución inválida' });
      }
      const returnOrderId = `${orderId}:return`;
      const returnKey = `${idempotencyKey}:return`;
      const returnHash = require('node:crypto').createHash('sha256')
        .update(JSON.stringify({ orderId: returnOrderId, items: canonicalItems, couponCode: null }))
        .digest('hex');
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const inserted = await client.query(
          `INSERT INTO inventory_operations (order_id, idempotency_key, request_hash, status, result)
           VALUES ($1, $2, $3, 'confirmed', '{}'::jsonb)
           ON CONFLICT DO NOTHING RETURNING id`,
          [returnOrderId, returnKey, returnHash],
        );
        if (!inserted.rowCount) {
          const prior = await client.query(
            'SELECT order_id, idempotency_key, request_hash, status, result FROM inventory_operations WHERE order_id = $1 OR idempotency_key = $2',
            [returnOrderId, returnKey],
          );
          await client.query('COMMIT');
          const operation = prior.rows[0];
          if (!operation || operation.request_hash !== returnHash || operation.order_id !== returnOrderId
            || operation.idempotency_key !== returnKey) {
            return res.status(409).json({ message: 'La clave de devolución ya fue usada con otra solicitud' });
          }
          return res.status(200).json(operation.result);
        }

        const sale = await client.query(
          "SELECT result FROM inventory_operations WHERE order_id = $1 AND status = 'confirmed' FOR UPDATE",
          [orderId],
        );
        const soldItems = sale.rows[0]?.result?.items;
        const returnedItems = Array.isArray(soldItems)
          ? [...soldItems].sort((left, right) => Number(left.productId) - Number(right.productId))
          : [];
        const matchesSale = returnedItems.length === canonicalItems.length && canonicalItems.every((item, index) => (
          Number(returnedItems[index].productId) === item.productId
          && Number(returnedItems[index].quantity) === item.quantity
        ));
        if (!matchesSale) {
          await client.query('ROLLBACK');
          return res.status(409).json({ message: 'No se encontró una venta confirmada coincidente para devolver' });
        }

        const locked = await client.query(
          'SELECT id FROM products WHERE id = ANY($1::bigint[]) ORDER BY id FOR UPDATE',
          [canonicalItems.map((item) => item.productId)],
        );
        if (locked.rowCount !== canonicalItems.length) {
          await client.query('ROLLBACK');
          return res.status(409).json({ message: 'No se pudo restituir el stock de todos los productos' });
        }
        for (const item of returnedItems) {
          await client.query('UPDATE products SET stock = stock + $1, updated_at = NOW() WHERE id = $2', [
            Number(item.quantity),
            Number(item.productId),
          ]);
          await client.query(
            `INSERT INTO stock_movements (operation_id, product_id, quantity, unit_price_cents, product_name, movement_type)
             VALUES ($1, $2, $3, $4, $5, 'return')`,
            [inserted.rows[0].id, Number(item.productId), Number(item.quantity), Number(item.unitPriceCents), item.productName],
          );
        }
        if (sale.rows[0].result.couponCode) {
          await client.query(
            'UPDATE coupons SET usage_count = GREATEST(usage_count - 1, 0) WHERE code = $1',
            [sale.rows[0].result.couponCode],
          );
        }
        const result = { orderId, status: 'returned', items: returnedItems };
        await client.query(
          'UPDATE inventory_operations SET result = $1::jsonb WHERE id = $2',
          [JSON.stringify(result), inserted.rows[0].id],
        );
        await client.query('COMMIT');
        return res.status(201).json(result);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error('Failed to return inventory:', error);
        return res.status(500).json({ message: 'No se pudo restituir el inventario' });
      } finally {
        client.release();
      }
    }

    const canonicalRequest = JSON.stringify({ orderId, items: canonicalItems, couponCode: couponCode?.trim().toUpperCase() || null });
    const { createHash } = require('node:crypto');
    const requestHash = createHash('sha256').update(canonicalRequest).digest('hex');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const inserted = await client.query(
        `INSERT INTO inventory_operations (order_id, idempotency_key, request_hash, status, result)
         VALUES ($1, $2, $3, 'confirmed', '{}'::jsonb)
         ON CONFLICT DO NOTHING RETURNING id`,
        [orderId, idempotencyKey, requestHash],
      );
      if (!inserted.rowCount) {
        const prior = await client.query(
          'SELECT order_id, idempotency_key, request_hash, status, result FROM inventory_operations WHERE order_id = $1 OR idempotency_key = $2',
          [orderId, idempotencyKey],
        );
        await client.query('COMMIT');
        const operation = prior.rows[0];
        if (!operation || operation.request_hash !== requestHash || operation.order_id !== orderId
          || operation.idempotency_key !== idempotencyKey) {
          return res.status(409).json({ message: 'La clave de idempotencia ya fue usada con otra solicitud' });
        }
        return res.status(operation.status === 'confirmed' ? 200 : 409).json(operation.result);
      }

      const locked = await client.query(
        `SELECT id, name, price_cents, stock, active, valid_from, valid_to
         FROM products WHERE id = ANY($1::bigint[]) ORDER BY id FOR UPDATE`,
        [canonicalItems.map((item) => item.productId)],
      );
      const byId = new Map(locked.rows.map((row) => [Number(row.id), row]));
      const unavailable = canonicalItems.find((item) => {
        const product = byId.get(item.productId);
        return !product || !product.active || product.stock < item.quantity
          || (product.valid_from && new Date(product.valid_from) > new Date())
          || (product.valid_to && new Date(product.valid_to) < new Date());
      });

      let coupon = null;
      if (couponCode) {
        const couponResult = await client.query(
          `SELECT id, code, discount_percent, expires_on, usage_limit, usage_count, active
           FROM coupons WHERE code = $1 FOR UPDATE`,
          [couponCode.trim().toUpperCase()],
        );
        coupon = couponResult.rows[0] || null;
        if (!coupon || !coupon.active || coupon.expires_on < new Date().toISOString().slice(0, 10)
          || coupon.usage_count >= coupon.usage_limit) {
          const result = { message: 'El cupón no existe, venció o no está disponible' };
          await client.query(
            `UPDATE inventory_operations SET status = 'rejected', result = $1::jsonb WHERE id = $2`,
            [JSON.stringify(result), inserted.rows[0].id],
          );
          await client.query('COMMIT');
          return res.status(409).json(result);
        }
      }

      if (unavailable) {
        const result = { message: `Producto no disponible: ${unavailable.productId}` };
        await client.query(
          `UPDATE inventory_operations SET status = 'rejected', result = $1::jsonb WHERE id = $2`,
          [JSON.stringify(result), inserted.rows[0].id],
        );
        await client.query('COMMIT');
        return res.status(409).json(result);
      }

      const lineItems = [];
      let subtotalCents = 0;
      for (const item of canonicalItems) {
        const product = byId.get(item.productId);
        const lineTotalCents = Number(product.price_cents) * item.quantity;
        if (!Number.isSafeInteger(lineTotalCents)) throw new Error('Product amount exceeds safe integer range');
        await client.query('UPDATE products SET stock = stock - $1, updated_at = NOW() WHERE id = $2', [item.quantity, item.productId]);
        await client.query(
          `INSERT INTO stock_movements (operation_id, product_id, quantity, unit_price_cents, product_name, movement_type)
           VALUES ($1, $2, $3, $4, $5, 'sale')`,
          [inserted.rows[0].id, item.productId, item.quantity, product.price_cents, product.name],
        );
        subtotalCents += lineTotalCents;
        lineItems.push({
          productId: item.productId,
          quantity: item.quantity,
          productName: product.name,
          unitPriceCents: Number(product.price_cents),
          subtotalCents: lineTotalCents,
        });
      }

      const discountCents = coupon ? Math.round(subtotalCents * coupon.discount_percent / 100) : 0;
      if (coupon) {
        await client.query('UPDATE coupons SET usage_count = usage_count + 1 WHERE id = $1', [coupon.id]);
      }
      const result = {
        orderId,
        items: lineItems,
        subtotalCents,
        discountCents,
        totalCents: subtotalCents - discountCents,
        couponCode: coupon?.code || null,
      };
      await client.query(
        `UPDATE inventory_operations SET result = $1::jsonb WHERE id = $2`,
        [JSON.stringify(result), inserted.rows[0].id],
      );
      await client.query('COMMIT');
      return res.status(201).json(result);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Failed to apply inventory operation:', error);
      return res.status(500).json({ message: 'No se pudo procesar el inventario' });
    } finally {
      client.release();
    }
  });

  return app;
}

module.exports = { createApp };
