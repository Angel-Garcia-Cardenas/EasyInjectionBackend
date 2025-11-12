const Joi = require('joi');
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    texto_pregunta: { type: String, required: true },
    dificultad: { 
        type: String, 
        enum: ['facil', 'media', 'dificil'], 
        required: true 
    },
    puntos: { type: Number, required: true },
    fase: {
        type: String,
        enum: ['init', 'discovery', 'parameters', 'sqli-detection', 'sqli-fingerprint', 'sqli-exploit', 'sqli', 'xss-context', 'xss-fuzzing', 'xss'],
        required: true
    }
});

const Question = mongoose.model('Question', questionSchema);

function validateQuestion(question) {
    const schema = Joi.object({
        texto_pregunta: Joi.string().required(),
        dificultad: Joi.string().valid('facil', 'media', 'dificil').required(),
        puntos: Joi.number().min(1).required(),
        fase: Joi.string().valid('init', 'discovery', 'parameters', 'sqli-detection', 'sqli-fingerprint', 'sqli-exploit', 'sqli', 'xss-context', 'xss-fuzzing', 'xss').required()
    });

    return schema.validate(question);
}

exports.Question = Question;
exports.validate = validateQuestion;
