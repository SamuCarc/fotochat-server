"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const autenticacion_1 = require("../middlewares/autenticacion");
const room_model_1 = require("../models/room.model");
const usuario_model_1 = require("../models/usuario.model");
const error_1 = require("../enums/error");
const roomRoutes = express_1.Router();
// Obtener salas paginadas
roomRoutes.post('/', [autenticacion_1.verificaToken], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userID = req.usuario._id;
    if (!userID || userID == '' || !userID.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Indique un usuario válido',
            errorCode: error_1.errorCodeRoom.InvUser
        });
    }
    let pagina = Number(req.body.pagina) || 1;
    let skip = pagina - 1;
    skip = skip * 20;
    const rooms = yield room_model_1.Room.find({ usuarios: { $elemMatch: { usuario: userID } }
    })
        .sort({ _id: -1 })
        .skip(skip)
        .limit(20)
        .populate('usuarios.usuario', '-password')
        .populate({
        path: 'ultimoMensaje',
        model: 'Mensaje',
        populate: {
            path: 'usuario',
            model: 'Usuario'
        }
    })
        .populate('creator', '-password')
        .exec();
    res.json({
        ok: true,
        pagina,
        rooms
    });
}));
// Obtener Sala por ID
roomRoutes.post('/roomById', [autenticacion_1.verificaToken], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userID = req.usuario._id;
    const roomID = req.body.roomID;
    if (!userID || userID == '' || !userID.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Indique un usuario válido',
            errorCode: error_1.errorCodeRoom.InvUser
        });
    }
    const room = yield room_model_1.Room.findOne({ $and: [
            { usuarios: { $elemMatch: { usuario: userID } } },
            { _id: roomID }
        ] })
        .populate('usuarios.usuario', '-password')
        .exec();
    if (!room) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Esta sala no existe',
            errorCode: error_1.errorCodeRoom.NoRoom
        });
    }
    res.json({
        ok: true,
        room
    });
}));
// Crear un chat de dos personas
roomRoutes.post('/singleRoom', [autenticacion_1.verificaToken], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userID = req.body.userID || null;
    if (!userID || userID == '' || userID == req.usuario._id || !userID.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Indique un usuario válido - userID',
            errorCode: error_1.errorCodeRoom.InvUser
        });
    }
    // Comprobamos si existe este usuario
    const existeUsuario = yield usuario_model_1.Usuario.findById(userID);
    if (!existeUsuario) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Este usuario no existe',
            errorCode: error_1.errorCodeRoom.NoUser
        });
    }
    // Comprobamos si existe una sala singleRoom con estos dos usuarios
    const existe = yield room_model_1.Room.find({
        $and: [
            { usuarios: { $elemMatch: { usuario: existeUsuario._id, isAdmin: true } } },
            { usuarios: { $elemMatch: { usuario: req.usuario._id, isAdmin: true } } },
            { singleUser: true }
        ]
    }).exec();
    if (existe && existe.length !== 0) {
        return res.json({
            ok: true,
            mensaje: 'Esta sala ya existe',
            room: existe,
        });
    }
    let nombre_completo = existeUsuario.nombreCompletoSala || '';
    const usuariosRoom = [
        {
            usuario: userID,
        },
        {
            usuario: req.usuario._id,
        }
    ];
    const roomInput = {
        nombre: nombre_completo,
        usuarios: usuariosRoom,
        creator: req.usuario._id,
    };
    room_model_1.Room.create(roomInput)
        .then(roomDB => {
        return res.json({
            ok: true,
            mensaje: `¡¡ Sala creada: ${nombre_completo} !!`,
            room: roomDB
        });
    }).catch(err => {
        return res.status(400).json({
            ok: false,
            mensaje: `No se ha podido crear la sala: ${nombre_completo}`,
            errorCode: error_1.errorCodeRoom.MongoError,
            err
        });
    });
}));
exports.default = roomRoutes;
