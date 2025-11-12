const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { User, validate } = require('../models/user');
const emailService = require('../services/emailService');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { error } = validate(req.body);
        if (error) {
            return res.status(400).json({ 
                error: 'Datos de entrada inválidos',
                details: error.details[0].message 
            });
        }

        let user = await User.findOne({ 
            $or: [
                { email: req.body.email },
                { username: req.body.username }
            ]
        });

        if (user) {
            if (user.email === req.body.email) {
                return res.status(400).json({ 
                    error: 'El email ya está registrado' 
                });
            }
            if (user.username === req.body.username) {
                return res.status(400).json({ 
                    error: 'El nombre de usuario ya está en uso' 
                });
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const expirationDate = new Date();
        expirationDate.setHours(expirationDate.getHours() + 24);

        user = new User({
            username: req.body.username,
            email: req.body.email,
            contrasena_hash: hashedPassword,
            token_verificacion: verificationToken,
            fecha_expiracion_token: expirationDate
        });

        await user.save();

        const emailSent = await emailService.sendVerificationEmail(
            user.email, 
            user.username, 
            verificationToken
        );

        res.status(201).json({
            message: 'Usuario registrado exitosamente. Por favor verifica tu email para activar tu cuenta.',
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                fecha_registro: user.fecha_registro,
                estado_cuenta: user.estado_cuenta,
                email_verificado: user.email_verificado,
                perfil: user.perfil
            },
            emailSent: emailSent,
            requiresVerification: true
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor' 
        });
    }
});

module.exports = router;
