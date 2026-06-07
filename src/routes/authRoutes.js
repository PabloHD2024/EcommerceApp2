const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

console.log("✅ authRoutes cargado");

router.post("/login", authController.login);

module.exports = router;