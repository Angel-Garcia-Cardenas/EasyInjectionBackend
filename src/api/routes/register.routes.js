const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { User, validate } = require('../../models/user/user.model');
const emailService = require('../../services/email.service');
const router = express.Router();

function validatePasswordStrength(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (password.length < minLength) {
        return { valid: false, message: 'La contraseña debe tener al menos 8 caracteres' };
    }
    if (!hasUpperCase) {
        return { valid: false, message: 'La contraseña debe incluir al menos una letra mayúscula' };
    }
    if (!hasLowerCase) {
        return { valid: false, message: 'La contraseña debe incluir al menos una letra minúscula' };
    }
    if (!hasNumber) {
        return { valid: false, message: 'La contraseña debe incluir al menos un número' };
    }
    if (!hasSpecialChar) {
        return { valid: false, message: 'La contraseña debe incluir al menos un carácter especial' };
    }
    return { valid: true };
}

router.post('/', async (req, res) => {
    try {
        const passwordValidation = validatePasswordStrength(req.body.password);

        if (!passwordValidation.valid) {
            return res.status(400).json({ error: passwordValidation.message });
        }

        if (!req.body.acceptedTerms) {
            return res.status(400).json({ 
                error: 'Debe aceptar los términos y condiciones y la política de privacidad para continuar' 
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
