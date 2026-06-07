const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authController = {
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: "Email y password son obligatorios"
                });
            }

            const user = await User.findOne({
                where: { email }
            });

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Credenciales inválidas"
                });
            }

            const passwordOk = await user.comparePassword(password);

            if (!passwordOk) {
                return res.status(401).json({
                    success: false,
                    message: "Credenciales inválidas"
                });
            }

            const payload = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "2h"
            });

            res.json({
                success: true,
                message: "Login exitoso",
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });

        } catch (error) {
            console.error("Error en login:", error);

            res.status(500).json({
                success: false,
                message: "Error interno al iniciar sesión",
                detalle: error.message
            });
        }
    }
};

module.exports = authController;