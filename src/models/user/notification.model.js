const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    tipo: {
        type: String,
        enum: ["scan_completed", "vulnerability_detected", "resource_available"],
        required: true
    },
    titulo: {
        type: String,
        required: true
    },
    mensaje: {
        type: String,
        required: true
    },
    relatedId: {
        type: Schema.Types.ObjectId,
    },
    leido: {
        type: Boolean,
        default: false
    },
    fecha: {
        type: Date,
        default: Date.now
    }
})

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = { Notification };