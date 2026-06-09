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
    },

    register: async (req, res) => {
        try {
            const { name, email, password } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({ success: false, message: "Todos los campos son obligatorios" });
            }

            // Validar si el email ya existe
            const existeUsuario = await User.findOne({ where: { email } });
            if (existeUsuario) {
                return res.status(400).json({ success: false, message: "El correo electrónico ya está registrado" });
            }

            // Crear el usuario en la BD (Por defecto rol 'client')
            // Nota: Tu modelo 'User' debería encriptar la contraseña mediante hooks de Sequelize antes de guardar
            await User.create({
                name,
                email,
                password,
                role: "client"
            });

            res.status(201).json({
                success: true,
                message: "Usuario registrado con éxito. Ya podés iniciar sesión."
            });

        } catch (error) {
            console.error("Error en registro:", error);
            res.status(500).json({ success: false, message: "Error al registrar el usuario", detalle: error.message });
        }
    }
};

module.exports = authController;
