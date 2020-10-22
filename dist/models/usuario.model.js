"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Usuario = void 0;
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
var validate = require('mongoose-validator');
var emailValidator = [
    validate({
        validator: 'isEmail',
        message: 'Porfavor introduzca un email válido'
    })
];
const usuarioSchema = new mongoose_1.Schema({
    nombre: {
        nombres: {
            type: String,
            trim: true,
            required: [true, 'El nombre del usuario es necesario']
        },
        apellidos: {
            type: String,
            trim: true,
            required: [true, 'Los apellidos del usuario son necesarios']
        }
    },
    avatar: {
        required: false,
        type: String,
        trim: true,
        default: 'av-1.png'
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        validate: emailValidator,
        unique: true,
        required: [true, 'El correo es necesario']
    },
    password: {
        type: String,
        bcrypt: true,
        required: [true, 'La contraseña es necesaria']
    },
    created: {
        type: Date,
        default: Date.now
    },
    isEmailValidated: {
        type: Boolean,
        default: false
    }
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
usuarioSchema.method('compararPassword', function (password = '') {
    if (bcrypt_1.default.compareSync(password, this.password)) {
        return true;
    }
    else {
        return false;
    }
});
usuarioSchema.virtual('nombreCompleto').get(function () {
    return this.nombre.nombres + ' ' + this.nombre.apellidos;
});
usuarioSchema.virtual('nombreCompletoSala').get(function () {
    let nombreSala = this.nombre.nombres + ' ' + this.nombre.apellidos;
    if (nombreSala.length > 23) {
        nombreSala = nombreSala.substr(0, 19) + '...';
    }
    return nombreSala;
});
exports.Usuario = mongoose_1.model('Usuario', usuarioSchema);
