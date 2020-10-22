"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Room = void 0;
const mongoose_1 = require("mongoose");
const usuarioRoomSchema = new mongoose_1.Schema({
    usuario: {
        trim: true,
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [true, 'Indique un usuario válido']
    },
    isAdmin: {
        type: Boolean,
        default: true
    },
    isSilenced: {
        type: Boolean,
        default: false
    },
    blocked: {
        type: Boolean,
        default: false
    },
    added: {
        type: Date,
        default: Date.now,
    }
});
const roomSchema = new mongoose_1.Schema({
    created: {
        type: Date,
        default: Date.now,
    },
    nombre: {
        type: String,
        trim: true,
        minlength: 3,
        maxlength: 23,
        required: true,
        default: 'Nueva sala'
    },
    usuarios: [
        usuarioRoomSchema
    ],
    ultimoMensaje: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Mensaje',
        default: null
    },
    singleUser: {
        type: Boolean,
        default: true
    },
    creator: {
        trim: true,
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [true, 'Indique un usuario creador']
    }
});
exports.Room = mongoose_1.model('Room', roomSchema);
