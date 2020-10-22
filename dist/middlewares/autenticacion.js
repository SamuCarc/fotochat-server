"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificaToken = void 0;
const token_1 = __importDefault(require("../clases/token"));
exports.verificaToken = (req, res, next) => {
    const userToken = req.get('x-token') || '';
    token_1.default.comprobarToken(userToken)
        .then((decoded) => {
        req.usuario = decoded.usuario;
        next();
    })
        .catch(err => {
        res.status(401).json({
            ok: false,
            mensaje: 'El token de usuario no es correcto'
        });
    });
};
