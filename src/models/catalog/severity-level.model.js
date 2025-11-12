const Joi = require('joi');
const mongoose = require('mongoose');

const severityLevelSchema = new mongoose.Schema({
    nombre: { 
        type: String, 
        enum: ['Baja', 'Media', 'Alta', 'Crítica'], 
        required: true, 
        unique: true 
    },
    descripcion: { type: String, maxlength: 255 }
});

const SeverityLevel = mongoose.model('SeverityLevel', severityLevelSchema);

function validateSeverityLevel(level) {
    const schema = Joi.object({
        nombre: Joi.string().valid('Baja', 'Media', 'Alta', 'Crítica').required(),
        descripcion: Joi.string().max(255)
    });

    return schema.validate(level);
}

exports.SeverityLevel = SeverityLevel;
exports.validate = validateSeverityLevel;
