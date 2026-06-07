const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  // Formato esperado: Authorization: Bearer TOKEN
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Acceso denegado. Token no provisto.",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
    if (err) {
      return res.status(403).json({
        message: "Token inválido o expirado.",
      });
    }

    req.user = decodedUser;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "Acceso denegado. Se requieren permisos de administrador.",
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  isAdmin,
};
