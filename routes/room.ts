import { Router, Response } from 'express';
import { verificaToken } from '../middlewares/autenticacion';
import { Room } from '../models/room.model';
import { Usuario } from '../models/usuario.model';
import { IUsuarioRoomInput } from '../interfaces/interfaces';
import { errorCodeRoom } from '../enums/error';

const roomRoutes = Router();


// Obtener salas paginadas
roomRoutes.post('/', [verificaToken], async (req:any, res:Response) => {
    const userID = req.usuario._id;

    if ( !userID || userID == '' || !userID.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            ok:false,
            mensaje: 'Indique un usuario válido',
            errorCode: errorCodeRoom.InvUser
        })
    } 
    let pagina = Number(req.body.pagina) || 1;
    let skip = pagina - 1;
    skip = skip * 20;

    const rooms = await Room.find( 
                            {usuarios:
                                {$elemMatch:{usuario:userID}}
                            }
                        )
                            .sort({_id:-1})
                            .skip( skip )
                            .limit(20)
                            .populate('usuarios.usuario','-password')
                            .populate({
                                path: 'ultimoMensaje',
                                model: 'Mensaje',
                                populate: {
                                  path: 'usuario',
                                  model: 'Usuario'
                                }
                              })
                            .populate('creator','-password')
                            .exec();
    
    res.json({
        ok:true,
        pagina,
        rooms
    });

});


// Obtener Sala por ID
roomRoutes.post('/roomById', [verificaToken], async (req:any, res:Response) => {
    const userID = req.usuario._id;
    const roomID = req.body.roomID;

    if ( !userID || userID == '' || !userID.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            ok:false,
            mensaje: 'Indique un usuario válido',
            errorCode: errorCodeRoom.InvUser
        })
    } 

    const room = await Room.findOne({ $and: [
                            {usuarios:{$elemMatch:{usuario:userID}}},
                            {_id:roomID}
                        ]})
                            .populate('usuarios.usuario','-password')
                            .exec();
    
    if (!room) {
        return res.status(400).json({
            ok:false,
            mensaje: 'Esta sala no existe',
            errorCode: errorCodeRoom.NoRoom
        }) 
    }

    res.json({
        ok:true,
        room
    });

});


// Crear un chat de dos personas
roomRoutes.post('/singleRoom', [verificaToken], async ( req:any, res:Response ) => {

    const userID:string = req.body.userID || null;

    if ( !userID || userID == '' || userID == req.usuario._id || !userID.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            ok:false,
            mensaje: 'Indique un usuario válido - userID',
            errorCode: errorCodeRoom.InvUser
        })
    }

    // Comprobamos si existe este usuario
    const existeUsuario = await Usuario.findById( userID );

    if ( !existeUsuario ) {
        return res.status(400).json({
            ok:false,
            mensaje: 'Este usuario no existe',
            errorCode: errorCodeRoom.NoUser
        });
    }
    
    // Comprobamos si existe una sala singleRoom con estos dos usuarios
    const existe = await Room.find({  
                    $and: [
                        {usuarios:{$elemMatch:{usuario:existeUsuario._id,isAdmin:true}}},
                        {usuarios:{$elemMatch:{usuario:req.usuario._id,isAdmin:true}}},
                        { singleUser:true }
                    ]
                }).exec();


    if ( existe && existe.length !== 0 ) {
        return res.json({
            ok:true,
            mensaje: 'Esta sala ya existe',
            room:existe,
        });
    }

    let nombre_completo:string = existeUsuario.nombreCompletoSala || '';
    const usuariosRoom:IUsuarioRoomInput[] = [
        {
            usuario:userID, 
        },
        {
            usuario:req.usuario._id, 
        }
    ];

    const roomInput = {
        nombre:nombre_completo,
        usuarios:usuariosRoom,
        creator:req.usuario._id,
    };
        
    Room.create(roomInput)
            .then( roomDB =>{
                return res.json({
                    ok:true,
                    mensaje: `¡¡ Sala creada: ${nombre_completo} !!`,
                    room: roomDB
                })
            }).catch( err => {
                return res.status(400).json({
                    ok:false,
                    mensaje: `No se ha podido crear la sala: ${nombre_completo}`,
                    errorCode: errorCodeRoom.MongoError,
                    err
                })
            });
});

export default roomRoutes;