import { Router, Response } from 'express';
import { verificaToken } from '../middlewares/autenticacion';
import { Mensaje } from '../models/mensaje.model';
import { Room } from '../models/room.model';
import { errorCodeMessage } from '../enums/error';

const mensajeRoutes = Router();


mensajeRoutes.post('/send', [verificaToken], async ( req:any, res:Response ) => {
    
    const userID = req.usuario._id; // Lo obtenemos del token nuestro ID
    const roomID = req.body.roomID || null; // ID de la sala
    const mensaje = req.body.message; // Mensaje
    const mensajeReferencia = req.body.reference || null; // Mensaje referencia


    if ( !userID || userID == '' || !userID.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            ok:false,
            mensaje: 'El usuario que envía el mensaje no es válido',
            errorCode: errorCodeMessage.InvUser
        })
    } 
    else if ( !roomID || roomID == '' || !roomID.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            ok:false,
            mensaje: 'Indique una sala válida - roomID',
            errorCode: errorCodeMessage.InvRoom
        })
    }
    else if ( !mensaje || mensaje == '' ) {
        return res.status(400).json({
            ok:false,
            mensaje: 'Introduzca un mensaje válido - message',
            errorCode: errorCodeMessage.InvMessage
        })
    }

    // Comprobamos si se encuentra este usuario en esta sala..
    const roomDB = await Room.findOne({$and:[
                    {_id:roomID },
                    { usuarios:{ $elemMatch:{usuario:userID} } }
                    ]}).exec();

    if ( !roomDB ) {
        return res.status(400).json({
            ok:false,
            mensaje: 'No perteneces a esta sala por lo tanto no puedes enviar ningún mensaje',
            errorCode: errorCodeMessage.NoRoom,
            roomDB
        });
    }

    if ( mensajeReferencia && mensajeReferencia !== '' && mensajeReferencia.match(/^[0-9a-fA-F]{24}$/)) {
        Mensaje.findById(mensajeReferencia).then( mReferencia => {
            if ( !mReferencia ) {
                return res.status(400).json({
                    ok:false,
                    mensaje: 'No perteneces a esta sala por lo tanto no puedes enviar ningún mensaje',
                    errorCode: errorCodeMessage.NoRefMessage,
                });
            }
        }).catch(err => {
            return res.status(400).json({
                ok:false,
                mensaje: 'Ha ocurrido un error al buscar la sala de chat',
                errorCode: errorCodeMessage.MongoError,
            });
        });
    }

    const imagenes:string[] = [];
        
    const mensajeInput = {
        usuario:userID,
        room:roomID,
        mensaje: mensaje,
        imgs: imagenes,
        referencia: mensajeReferencia
    }
     
    Mensaje.create(mensajeInput).then( async mensajeDB =>{

        roomDB.ultimoMensaje = mensajeDB._id;
        await roomDB.save();

        return res.json({
                ok:true,
                mensaje: 'Mensaje enviado correctamente',
                message: mensajeDB,
                room: roomDB
            })
        }).catch( err => {
            return res.json({
                ok:false,
                mensaje: 'Ha ocurrido un error al intentar enviar el mensaje',
                errorCode: errorCodeMessage.MongoError,
                err
            })
        });
});


// Obtener los mensajes de una sala
mensajeRoutes.post('/', [verificaToken], async (req:any, res:Response) => {

    const userID = req.usuario._id; // Lo obtenemos del token nuestro ID
    const roomID = req.body.roomID || null; // ID de la sala

    if ( !userID || userID == '' || !userID.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            ok:false,
            mensaje: 'El usuario que envía el mensaje no es válido',
            errorCode: errorCodeMessage.InvUser
        })
    } 
    else if ( !roomID || roomID == '' || !roomID.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            ok:false,
            mensaje: 'Indique una sala válida - roomID',
            errorCode: errorCodeMessage.InvRoom
        })
    }

    // Comprobamos si se encuentra este usuario en esta sala..
    const roomDB = await Room.find({$and:[
                    {_id:roomID },
                    { usuarios:{ $elemMatch:{usuario:userID} } }
                    ]}).exec();

    if ( !roomDB || roomDB.length == 0 ) {
        return res.status(400).json({
            ok:false,
            mensaje: 'No perteneces a esta sala por lo tanto no puedes enviar ningún mensaje',
            errorCode: errorCodeMessage.NoRoom,
            roomDB
        });
    }

    let pagina = Number(req.body.pagina) || 1;
    let skip = pagina - 1;
    skip = skip * 35;

    const mensajesRoom = await Mensaje.find({room:roomID})
                            .sort({created:-1})
                            .skip( skip )
                            .limit(35)
                            .populate('usuario','-password')
                            .populate('room')
                            .exec();

    res.json({
        ok:true,
        pagina,
        mensajesRoom
    });
});

export default mensajeRoutes;