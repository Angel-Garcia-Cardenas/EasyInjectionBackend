const express = require('express');
const passport = require('passport');
const auth = require('../middleware/auth.middleware');
const router = express.Router();

router.get('/verify', auth, async (req, res) => {
    try {
        res.json({
            message: 'Token válido',
            user: req.user
        });
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor' 
        });
    }
});

router.get('/me', auth, async (req, res) => {
    try {
        const { User } = require('../../models/user/user.model');
        const user = await User.findById(req.user._id).select('-contrasena_hash -token_verificacion');
        
        if (!user) {
            return res.status(404).json({ 
                error: 'Usuario no encontrado' 
            });
        }

        res.json({
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
        console.error('Error fetching user profile:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor' 
        });
    }
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { session: false}), (req, res) => {
    const token = req.user.generateAuthToken();
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
});

module.exports = router;
