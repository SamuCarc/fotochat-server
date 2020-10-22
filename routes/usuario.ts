import { Router, Request, Response } from "express";
import { Usuario } from '../models/usuario.model';
import bcrypt from 'bcrypt';
import Token from '../clases/token';
import { verificaToken } from '../middlewares/autenticacion';
import { ICrearUsuarioInput, IActualizarUsuarioInput, passwordValidate } from '../interfaces/interfaces';
import { errorCodeUser } from '../enums/error';


const userRoutes = Router();

// Login
userRoutes.post('/login', (req:Request, res:Response) => {
    const body = req.body;

    Usuario.findOne({ email:body.email }, (err, userDB) => {

        if ( err ) {
            return res.json({
                ok: false,
                mensaje: 'Ha ocurrido un error en la BBDD',
                errorCode: errorCodeUser.MongoError
            });
        }

        if ( !userDB ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Usuario/Contraseña no son correctos',
                errorCode: errorCodeUser.ErrLogin

            });
        }

        if ( userDB.compararPassword( body.password ) ) {
            const tokenUser = Token.getJwtToken({
                _id:userDB._id,
                nombre:userDB.nombre,
                email:userDB.email,
                avatar:userDB.avatar    
            })
            res.json({
                ok:true,
                token: tokenUser
            });
        } else {
            return res.status(400).json({
                ok: false,
                mensaje: 'Usuario/Contraseña no son correctos',
                errorCode: errorCodeUser.ErrLogin
            });    
        }
    })
});



// Crear usuario
userRoutes.post('/create', (req:any, res:Response) => {

    const user:ICrearUsuarioInput = {
        nombre: {
            nombres: req.body.nombres,
            apellidos: req.body.apellidos
        },
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
        avatar: req.body.avatar
    };

    if (!validarEmail(user.email)) {
        return res.status(400).json({
            ok:false,
            mensaje: 'El correo introducido no es válido',
            errorCode: errorCodeUser.InvEmail
        });
    } else if (!validarNombre(user.nombre.nombres) || !validarNombre(user.nombre.apellidos)) {
        return res.status(400).json({
            ok:false,
            mensaje: 'El nombre/apellidos no es válido',
            errorCode: errorCodeUser.InvName
        });
    } else if (!validarPassword(req.body.password).ok) {
        return res.status(400).json(validarPassword(req.body.password));
    }

    Usuario.find({email:user.email}).then( userEmail => {
        
        if (!userEmail || userEmail.length == 0) {
            Usuario.create( user ).then( userDB => {

                const tokenUser = Token.getJwtToken({
                    _id:userDB._id,
                    nombre:userDB.nombre,
                    email:userDB.email,
                    avatar:userDB.avatar    
                })
                res.json({
                    ok:true,
                    token: tokenUser
                });
            }).catch( err => {
                res.status(500).json({
                    ok:false,
                    errorCode: errorCodeUser.MongoError,
                    err
                });
            });

        } else {
            res.json({
                ok:false,
                mensaje: 'Este Email ya esta siendo usado por otro usuario',
                errorCode: errorCodeUser.ExistEmail
            });
        }
    }).catch(err => {
        res.status(400).json({
            ok:false,
            errorCode: errorCodeUser.MongoError,
            err
        });
    })
});

// Actualizar usuario
userRoutes.post('/update', verificaToken, (req:any, res:Response) => {

    const usuarioReq = req.usuario;

    const user:IActualizarUsuarioInput = {
        nombre: {
            nombres: req.body.nombres || usuarioReq.nombre.nombres,
            apellidos: req.body.apellidos || usuarioReq.nombre.apellidos
        },
        email: req.body.email || usuarioReq.email,
        avatar: req.body.avatar || usuarioReq.avatar
    }

    if (!validarEmail(user.email)) {
        return res.status(400).json({
            ok:false,
            mensaje: 'El correo introducido no es válido',
            errorCode: errorCodeUser.InvEmail
        });
    } else if (!validarNombre(user.nombre.nombres) || !validarNombre(user.nombre.apellidos)) {
        return res.status(400).json({
            ok:false,
            mensaje: 'El nombre/apellidos no es válido',
            errorCode: errorCodeUser.InvName
        });
    }

    Usuario.findByIdAndUpdate( usuarioReq._id, user, {new:true}, (err, userDB) => {

        if ( err ) {
            return res.status(400).json({
                ok:false,
                mensaje: 'Error al buscar usuario',
                errorCode: errorCodeUser.MongoError
            });
        }

        if ( !userDB ) {
            return res.status(400).json({
                ok:false,
                mensaje: 'No existe un usuario con este ID',
                errorCode: errorCodeUser.NoUser
            });
        } 
        const tokenUser = Token.getJwtToken({
            _id:userDB._id,
            nombre:userDB.nombre,
            email:userDB.email,
            avatar:userDB.avatar    
        })
        res.json({
            ok:true,
            token: tokenUser
        });

    });
});


// Obtener Usuario por token
userRoutes.get('/', [ verificaToken ], ( req:any, res:Response ) => {

    const usuario = req.usuario;

    res.json({
        ok:true,
        usuario
    });

});


// Obtener usuarios paginados por string
userRoutes.post('/getUsers', [verificaToken], async (req:any, res:Response) => {
    const userID = req.usuario._id;
    const string = req.body.string || '';
    const pagina = Number(req.query.pagina) || 1;

    if ( !userID || userID == '' || !userID.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            ok:false,
            mensaje: 'Indique un usuario válido',
            errorCode: errorCodeUser.InvUser
        })
    } 
    
    var searchString = new RegExp(string, 'i');
    let skip = pagina - 1;
    skip = skip * 10;

    Usuario.aggregate()
    .project({
        nombreCompleto: { $concat: ['$nombre.nombres', ' ', '$nombre.apellidos'] },
        nombre: 1,
        email: 1,
        avatar: 1,
        created: 1,
    })
    .sort({_id:-1})
    .skip( skip )
    .limit(10)
    .match({ nombreCompleto: searchString })
    .exec(function (err, usuarios) {
        if (err) {
            return res.json({
                ok:false,
                string,
                pagina,    
                mensaje:'Ha ocurrido un error al buscar los usuarios',
                err: err
            });
        }
        
        res.json({
            ok:true,
            string,
            pagina,    
            usuarios
        });
    });
});


// Obtener todos los usuarios paginados
userRoutes.post('/getAllUsers', [verificaToken], async (req:any, res:Response) => {
    const userID = req.usuario._id;
    const pagina = Number(req.query.pagina) || 1;

    if ( !userID || userID == '' || !userID.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            ok:false,
            mensaje: 'Indique un usuario válido'
        })
    } 

    let skip = pagina - 1;
    skip = skip * 10;

    Usuario.aggregate()
    .project({
        nombreCompleto: { $concat: ['$nombre.nombres', ' ', '$nombre.apellidos'] },
        nombre: 1,
        email: 1,
        avatar: 1,
        created: 1,
    })
    .sort({_id:-1})
    .skip( skip )
    .limit(10)
    .exec(function (err, usuarios) {
        if (err) throw err;
        
        res.json({
            ok:true,
            pagina,    
            usuarios,
        });
    });
});


function validarEmail (email:string): boolean {
    let re = /^[\w-]+(\.[\w-]+)*@([a-z0-9-]+(\.[a-z0-9-]+)*?\.[a-z]{2,6}|(\d{1,3}\.){3}\d{1,3})(:\d{4})?$/;
    if (re.test(email.trim())) {
        return true
    } else {
        return false;
    }
}

function validarNombre (nombre:string):boolean {
    let re = /[A-Z][a-zA-Z][^#&<>\"~;$^%{}?]{1,20}$/g;

    if (re.test(nombre.trim())) {
        return true;
    } else {
        return false;
    }
}

function validarPassword (password:string):passwordValidate {
    let json:passwordValidate = {
        ok:true,
    };
    
    if (password.length < 8 || password.length > 20 ) {
        json = {
            ok:false,
            errorCode:errorCodeUser.InvPassLength,
            mensaje: 'La contraseña tiene que tener de 8 a 20 caracteres'
        }
    } else if (!/\d/.test(password)) {
        json = {
            ok:false,
            errorCode:errorCodeUser.InvPassNumbers,
            mensaje: 'La contraseña tiene que contener un número'
        }
    } else if (!/[a-zA-Z]/.test(password)) {
        json = {
            ok:false,
            errorCode:errorCodeUser.InvPassLetters,
            mensaje: 'La contraseña tiene que contener letras'
        }
    } else if (!/[A-Z]/.test(password)) {
        json = {
            ok:false,
            errorCode:errorCodeUser.InvPassUpper,
            mensaje: 'La contraseña tiene que contener una mayúscula'
        }
    } else if (!/[a-z]/.test(password)) {
        json = {
            ok:false,
            errorCode:errorCodeUser.InvPassLower,
            mensaje: 'La contraseña tiene que contener una minúscula'
        }
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,20}$/.test(password)) {
        json = {
            ok:false,
            errorCode:errorCodeUser.InvPass,
            mensaje: 'La contraseña no puede contener caracteres especiales o espacios'
        }
    }

    return json;
}

export default userRoutes;