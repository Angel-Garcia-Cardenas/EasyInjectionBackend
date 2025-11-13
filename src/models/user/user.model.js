const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    pregunta_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Pregunta', 
        required: true 
    },
    respuesta_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Respuesta', 
        required: true 
    },
    correcta: { 
        type: Boolean, 
        default: false 
    },
    tiempo_respuesta_seg: { 
        type: Number 
    },
    puntos_obtenidos: { 
        type: Number 
    },
    fecha_respuesta: { 
        type: Date, 
        default: Date.now }
});

const profileSchema = new mongoose.Schema({
    nivel_actual: { 
        type: Number, 
        default: 1 
    },
    avatarId: { 
        type: String,
        default: 'avatar1'
    }
});
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        minlength: 3,
        maxlength: 50,
        required: true,
        unique: true
    },
    email: {
        type: String,
        minlength: 5,
        maxlength: 255,
        unique: true,
        required: true
    },
    contrasena_hash: {
        type: String,
        minlength: 5,
        maxlength: 1024,
        required: true
    },
    fecha_registro: { 
        type: Date, 
        default: Date.now 
    },
    ultimo_login: { 
        type: Date 
    },
    estado_cuenta: {
        type: String,
        enum: ['pendiente', 'activo', 'inactivo', 'suspendido'],
        default: 'pendiente'
    },
    email_verificado: {
        type: Boolean,
        default: false
    },
    token_verificacion: { 
        type: String 
    },
    fecha_expiracion_token: { 
        type: Date 
    },
    googleId: {
        type: String,
        sparse: true,
        unique: true
    },
    passwordResetToken: {
        type: String,
    },
    passwordResetExpires: {
        type: Date,
    },
    acceptedTerms: {
        type: Boolean,
        required: true,
        default: false
    },
    acceptedTermsDate: {
        type: Date
    },
    activeSessions: [{
        token: String,
        device: String,
        browser: String,
        location: String,
        ip: String,
        lastActivity: {
            type: Date,
            default: Date.now
        }
    }],

    perfil: profileSchema,
    historial_respuestas: [historySchema]
});

userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign(
        { _id: this._id, username: this.username, email: this.email },
        config.get('jwtPrivateKey'),
        { expiresIn: '24h' }
    );
    return token;
};

const User = mongoose.model('User', userSchema);

function validateUser(user) {
    const schema = Joi.object({
        username: Joi.string().min(3).max(50).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(1024).required()
    });

    return schema.validate(user);
}

exports.User = User;
exports.validate = validateUser;
