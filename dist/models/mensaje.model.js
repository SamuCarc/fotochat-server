"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mensaje = void 0;
const mongoose_1 = require("mongoose");
const mensajeSchema = new mongoose_1.Schema({
    created: {
        type: Date,
        default: Date.now
    },
    mensaje: {
        type: String,
        trim: true,
        required: true
    },
    usuario: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [true, 'Debe existir un usuario que envia el mensaje']
    },
    room: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Room',
        required: [true, 'Debe existir una sala asociada al mensaje']
    },
    imgs: [{
            type: String
        }],
    referencia: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Mensaje',
        default: null
    },
    deleted: {
        date: { type: Date, default: null },
        isDeleted: { type: Boolean, default: false }
    },
    edited: {
        date: { type: Date, default: null },
        isEdited: { type: Boolean, default: false }
    }
});
exports.Mensaje = mongoose_1.model('Mensaje', mensajeSchema);
