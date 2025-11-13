const express = require('express');
const bcrypt = require('bcrypt');
const { User } = require('../../models/user/user.model');
const router = express.Router();

const { createSessionData } = require('../middleware/session-tracker.middleware');

router.post('/', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Email y contraseña son requeridos' 
            });
        }

        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(401).json({ 
                error: 'Credenciales inválidas' 
            });
        }

        if (!user.email_verificado) {
            return res.status(401).json({ 
                error: 'Por favor verifica tu email antes de iniciar sesión' 
            });
        }

        if (user.estado_cuenta !== 'activo') {
            return res.status(401).json({ 
                error: 'Tu cuenta no está activa. Contacta al administrador.' 
            });
        }

        const validPassword = await bcrypt.compare(password, user.contrasena_hash);
        if (!validPassword) {
            return res.status(401).json({ 
                error: 'Credenciales inválidas' 
            });
        }

        user.ultimo_login = new Date();
        
        const token = user.generateAuthToken();
        const sessionData = createSessionData(req, token);

        if (!user.activeSessions) {
            user.activeSessions = [];
        }
        user.activeSessions.push(sessionData);
        if (user.activeSessions.length > 5) {
            user.activeSessions = user.activeSessions.slice(-5);
        }
        
        await user.save();

        res.json({
            message: 'Login exitoso',
            token: token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                fecha_registro: user.fecha_registro,
                ultimo_login: user.ultimo_login,
                estado_cuenta: user.estado_cuenta,
                email_verificado: user.email_verificado,
                perfil: user.perfil
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor' 
        });
    }
});

module.exports = router;
