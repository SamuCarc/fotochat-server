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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usuario_model_1 = require("../models/usuario.model");
const bcrypt_1 = __importDefault(require("bcrypt"));
const token_1 = __importDefault(require("../clases/token"));
const autenticacion_1 = require("../middlewares/autenticacion");
const error_1 = require("../enums/error");
const userRoutes = express_1.Router();
// Login
userRoutes.post('/login', (req, res) => {
    const body = req.body;
    usuario_model_1.Usuario.findOne({ email: body.email }, (err, userDB) => {
        if (err) {
            return res.json({
                ok: false,
                mensaje: 'Ha ocurrido un error en la BBDD',
                errorCode: error_1.errorCodeUser.MongoError
            });
        }
        if (!userDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Usuario/Contraseña no son correctos',
                errorCode: error_1.errorCodeUser.ErrLogin
            });
        }
        if (userDB.compararPassword(body.password)) {
            const tokenUser = token_1.default.getJwtToken({
                _id: userDB._id,
                nombre: userDB.nombre,
                email: userDB.email,
                avatar: userDB.avatar
            });
            res.json({
                ok: true,
                token: tokenUser
            });
        }
        else {
            return res.status(400).json({
                ok: false,
                mensaje: 'Usuario/Contraseña no son correctos',
                errorCode: error_1.errorCodeUser.ErrLogin
            });
        }
    });
});
// Crear usuario
userRoutes.post('/create', (req, res) => {
    const user = {
        nombre: {
            nombres: req.body.nombres,
            apellidos: req.body.apellidos
        },
        email: req.body.email,
        password: bcrypt_1.default.hashSync(req.body.password, 10),
        avatar: req.body.avatar
    };
    if (!validarEmail(user.email)) {
        return res.status(400).json({
            ok: false,
            mensaje: 'El correo introducido no es válido',
            errorCode: error_1.errorCodeUser.InvEmail
        });
    }
    else if (!validarNombre(user.nombre.nombres) || !validarNombre(user.nombre.apellidos)) {
        return res.status(400).json({
            ok: false,
            mensaje: 'El nombre/apellidos no es válido',
            errorCode: error_1.errorCodeUser.InvName
        });
    }
    else if (!validarPassword(req.body.password).ok) {
        return res.status(400).json(validarPassword(req.body.password));
    }
    usuario_model_1.Usuario.find({ email: user.email }).then(userEmail => {
        if (!userEmail || userEmail.length == 0) {
            usuario_model_1.Usuario.create(user).then(userDB => {
                const tokenUser = token_1.default.getJwtToken({
                    _id: userDB._id,
                    nombre: userDB.nombre,
                    email: userDB.email,
                    avatar: userDB.avatar
                });
                res.json({
                    ok: true,
                    token: tokenUser
                });
            }).catch(err => {
                res.status(500).json({
                    ok: false,
                    errorCode: error_1.errorCodeUser.MongoError,
                    err
                });
            });
        }
        else {
            res.json({
                ok: false,
                mensaje: 'Este Email ya esta siendo usado por otro usuario',
                errorCode: error_1.errorCodeUser.ExistEmail
            });
        }
    }).catch(err => {
        res.status(400).json({
            ok: false,
            errorCode: error_1.errorCodeUser.MongoError,
            err
        });
    });
});
// Actualizar usuario
userRoutes.post('/update', autenticacion_1.verificaToken, (req, res) => {
    const usuarioReq = req.usuario;
    const user = {
        nombre: {
            nombres: req.body.nombres || usuarioReq.nombre.nombres,
            apellidos: req.body.apellidos || usuarioReq.nombre.apellidos
        },
        email: req.body.email || usuarioReq.email,
        avatar: req.body.avatar || usuarioReq.avatar
    };
    if (!validarEmail(user.email)) {
        return res.status(400).json({
            ok: false,
            mensaje: 'El correo introducido no es válido',
            errorCode: error_1.errorCodeUser.InvEmail
        });
    }
    else if (!validarNombre(user.nombre.nombres) || !validarNombre(user.nombre.apellidos)) {
        return res.status(400).json({
            ok: false,
            mensaje: 'El nombre/apellidos no es válido',
            errorCode: error_1.errorCodeUser.InvName
        });
    }
    usuario_model_1.Usuario.findByIdAndUpdate(usuarioReq._id, user, { new: true }, (err, userDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errorCode: error_1.errorCodeUser.MongoError
            });
        }
        if (!userDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con este ID',
                errorCode: error_1.errorCodeUser.NoUser
            });
        }
        const tokenUser = token_1.default.getJwtToken({
            _id: userDB._id,
            nombre: userDB.nombre,
            email: userDB.email,
            avatar: userDB.avatar
        });
        res.json({
            ok: true,
            token: tokenUser
        });
    });
});
// Obtener Usuario por token
userRoutes.get('/', [autenticacion_1.verificaToken], (req, res) => {
    const usuario = req.usuario;
    res.json({
        ok: true,
        usuario
    });
});
// Obtener usuarios paginados por string
userRoutes.post('/getUsers', [autenticacion_1.verificaToken], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userID = req.usuario._id;
    const string = req.body.string || '';
    const pagina = Number(req.query.pagina) || 1;
    if (!userID || userID == '' || !userID.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Indique un usuario válido',
            errorCode: error_1.errorCodeUser.InvUser
        });
    }
    var searchString = new RegExp(string, 'i');
    let skip = pagina - 1;
    skip = skip * 10;
    usuario_model_1.Usuario.aggregate()
        .project({
        nombreCompleto: { $concat: ['$nombre.nombres', ' ', '$nombre.apellidos'] },
        nombre: 1,
        email: 1,
        avatar: 1,
        created: 1,
    })
        .sort({ _id: -1 })
        .skip(skip)
        .limit(10)
        .match({ nombreCompleto: searchString })
        .exec(function (err, usuarios) {
        if (err) {
            return res.json({
                ok: false,
                string,
                pagina,
                mensaje: 'Ha ocurrido un error al buscar los usuarios',
                err: err
            });
        }
        res.json({
            ok: true,
            string,
            pagina,
            usuarios
        });
    });
}));
// Obtener todos los usuarios paginados
userRoutes.post('/getAllUsers', [autenticacion_1.verificaToken], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userID = req.usuario._id;
    const pagina = Number(req.query.pagina) || 1;
    if (!userID || userID == '' || !userID.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Indique un usuario válido'
        });
    }
    let skip = pagina - 1;
    skip = skip * 10;
    usuario_model_1.Usuario.aggregate()
        .project({
        nombreCompleto: { $concat: ['$nombre.nombres', ' ', '$nombre.apellidos'] },
        nombre: 1,
        email: 1,
        avatar: 1,
        created: 1,
    })
        .sort({ _id: -1 })
        .skip(skip)
        .limit(10)
        .exec(function (err, usuarios) {
        if (err)
            throw err;
        res.json({
            ok: true,
            pagina,
            usuarios,
        });
    });
}));
function validarEmail(email) {
    let re = /^[\w-]+(\.[\w-]+)*@([a-z0-9-]+(\.[a-z0-9-]+)*?\.[a-z]{2,6}|(\d{1,3}\.){3}\d{1,3})(:\d{4})?$/;
    if (re.test(email.trim())) {
        return true;
    }
    else {
        return false;
    }
}
function validarNombre(nombre) {
    let re = /[A-Z][a-zA-Z][^#&<>\"~;$^%{}?]{1,20}$/g;
    if (re.test(nombre.trim())) {
        return true;
    }
    else {
        return false;
    }
}
function validarPassword(password) {
    let json = {
        ok: true,
    };
    if (password.length < 8 || password.length > 20) {
        json = {
            ok: false,
            errorCode: error_1.errorCodeUser.InvPassLength,
            mensaje: 'La contraseña tiene que tener de 8 a 20 caracteres'
        };
    }
    else if (!/\d/.test(password)) {
        json = {
            ok: false,
            errorCode: error_1.errorCodeUser.InvPassNumbers,
            mensaje: 'La contraseña tiene que contener un número'
        };
    }
    else if (!/[a-zA-Z]/.test(password)) {
        json = {
            ok: false,
            errorCode: error_1.errorCodeUser.InvPassLetters,
            mensaje: 'La contraseña tiene que contener letras'
        };
    }
    else if (!/[A-Z]/.test(password)) {
        json = {
            ok: false,
            errorCode: error_1.errorCodeUser.InvPassUpper,
            mensaje: 'La contraseña tiene que contener una mayúscula'
        };
    }
    else if (!/[a-z]/.test(password)) {
        json = {
            ok: false,
            errorCode: error_1.errorCodeUser.InvPassLower,
            mensaje: 'La contraseña tiene que contener una minúscula'
        };
    }
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,20}$/.test(password)) {
        json = {
            ok: false,
            errorCode: error_1.errorCodeUser.InvPass,
            mensaje: 'La contraseña no puede contener caracteres especiales o espacios'
        };
    }
    return json;
}
exports.default = userRoutes;
