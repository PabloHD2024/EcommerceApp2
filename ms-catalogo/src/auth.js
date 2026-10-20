const jwt = require('jsonwebtoken');
const { timingSafeEqual } = require('node:crypto');

function requireUser(req, res, next) {
  const authorization = req.get('authorization') || '';
  const [scheme, token] = authorization.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Autenticación requerida' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Se requieren permisos de administrador' });
  }
  return next();
}

function requireService(req, res, next) {
  const provided = Buffer.from(req.get('x-service-token') || '');
  const expected = Buffer.from(process.env.SERVICE_TOKEN || '');
  if (!expected.length || provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return res.status(403).json({ message: 'Autenticación de servicio requerida' });
  }
  return next();
}

module.exports = { requireUser, requireAdmin, requireService };
