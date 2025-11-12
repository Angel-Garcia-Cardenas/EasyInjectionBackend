const mongoose = require('mongoose');
const Joi = require('joi');

const authTypeSchema = new mongoose.Schema({
    nombre: { 
        type: String, 
        enum: ['usuario_password', 'token', 'oauth2', 'apikey'], 
        required: true, 
        unique: true 
    },
    descripcion: { type: String, maxlength: 255 }
});

const AuthType = mongoose.model('AuthType', authTypeSchema);

function validateAuthType(auth) {
    const schema = Joi.object({
        nombre: Joi.string().valid('usuario_password', 'token', 'oauth2', 'apikey').required(),
        descripcion: Joi.string().max(255)
    });

    return schema.validate(auth);
}

exports.AuthType = AuthType;
exports.validate = validateAuthType;
