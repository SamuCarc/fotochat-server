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
const mensaje_model_1 = require("../models/mensaje.model");
const room_model_1 = require("../models/room.model");
const error_1 = require("../enums/error");
const mensajeRoutes = express_1.Router();
mensajeRoutes.post('/send', [autenticacion_1.verificaToken], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userID = req.usuario._id; // Lo obtenemos del token nuestro ID
    const roomID = req.body.roomID || null; // ID de la sala
    const mensaje = req.body.message; // Mensaje
    const mensajeReferencia = req.body.reference || null; // Mensaje referencia
    if (!userID || userID == '' || !userID.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            ok: false,
            mensaje: 'El usuario que envía el mensaje no es válido',
            errorCode: error_1.errorCodeMessage.InvUser
        });
    }
    else if (!roomID || roomID == '' || !roomID.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Indique una sala válida - roomID',
            errorCode: error_1.errorCodeMessage.InvRoom
        });
    }
    else if (!mensaje || mensaje == '') {
        return res.status(400).json({
            ok: false,
            mensaje: 'Introduzca un mensaje válido - message',
            errorCode: error_1.errorCodeMessage.InvMessage
        });
    }
    // Comprobamos si se encuentra este usuario en esta sala..
    const roomDB = yield room_model_1.Room.findOne({ $and: [
            { _id: roomID },
            { usuarios: { $elemMatch: { usuario: userID } } }
        ] }).exec();
    if (!roomDB) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No perteneces a esta sala por lo tanto no puedes enviar ningún mensaje',
            errorCode: error_1.errorCodeMessage.NoRoom,
            roomDB
        });
    }
    if (mensajeReferencia && mensajeReferencia !== '' && mensajeReferencia.match(/^[0-9a-fA-F]{24}$/)) {
        mensaje_model_1.Mensaje.findById(mensajeReferencia).then(mReferencia => {
            if (!mReferencia) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No perteneces a esta sala por lo tanto no puedes enviar ningún mensaje',
                    errorCode: error_1.errorCodeMessage.NoRefMessage,
                });
            }
        }).catch(err => {
            return res.status(400).json({
                ok: false,
                mensaje: 'Ha ocurrido un error al buscar la sala de chat',
                errorCode: error_1.errorCodeMessage.MongoError,
            });
        });
    }
    const imagenes = [];
    const mensajeInput = {
        usuario: userID,
        room: roomID,
        mensaje: mensaje,
        imgs: imagenes,
        referencia: mensajeReferencia
    };
    mensaje_model_1.Mensaje.create(mensajeInput).then((mensajeDB) => __awaiter(void 0, void 0, void 0, function* () {
        roomDB.ultimoMensaje = mensajeDB._id;
        yield roomDB.save();
        return res.json({
            ok: true,
            mensaje: 'Mensaje enviado correctamente',
            message: mensajeDB,
            room: roomDB
        });
    })).catch(err => {
        return res.json({
            ok: false,
            mensaje: 'Ha ocurrido un error al intentar enviar el mensaje',
            errorCode: error_1.errorCodeMessage.MongoError,
            err
        });
    });
}));
// Obtener los mensajes de una sala
mensajeRoutes.post('/', [autenticacion_1.verificaToken], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userID = req.usuario._id; // Lo obtenemos del token nuestro ID
    const roomID = req.body.roomID || null; // ID de la sala
    if (!userID || userID == '' || !userID.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            ok: false,
            mensaje: 'El usuario que envía el mensaje no es válido',
            errorCode: error_1.errorCodeMessage.InvUser
        });
    }
    else if (!roomID || roomID == '' || !roomID.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Indique una sala válida - roomID',
            errorCode: error_1.errorCodeMessage.InvRoom
        });
    }
    // Comprobamos si se encuentra este usuario en esta sala..
    const roomDB = yield room_model_1.Room.find({ $and: [
            { _id: roomID },
            { usuarios: { $elemMatch: { usuario: userID } } }
        ] }).exec();
    if (!roomDB || roomDB.length == 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No perteneces a esta sala por lo tanto no puedes enviar ningún mensaje',
            errorCode: error_1.errorCodeMessage.NoRoom,
            roomDB
        });
    }
    let pagina = Number(req.body.pagina) || 1;
    let skip = pagina - 1;
    skip = skip * 35;
    const mensajesRoom = yield mensaje_model_1.Mensaje.find({ room: roomID })
        .sort({ created: -1 })
        .skip(skip)
        .limit(35)
        .populate('usuario', '-password')
        .populate('room')
        .exec();
    res.json({
        ok: true,
        pagina,
        mensajesRoom
    });
}));
exports.default = mensajeRoutes;
