import { Document, model, Schema, Types } from 'mongoose';
import { IUsuario } from './usuario.model';
import { IMensaje } from './mensaje.model';
 
const usuarioRoomSchema = new Schema({
    usuario: {
        trim: true,
        type: Schema.Types.ObjectId,
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
    blocked:{
        type: Boolean,
        default: false
    },
    added:{
        type:Date,
        default: Date.now,
    }
});

const roomSchema = new Schema({

    created: {
        type:Date,
        default: Date.now,
    },
    nombre: {
        type:String,
        trim: true,
        minlength: 3,
        maxlength: 23,
        required: true,
        default: 'Nueva sala'
    },
    usuarios: [
        usuarioRoomSchema
    ],
    ultimoMensaje:{
        type: Schema.Types.ObjectId,
        ref: 'Mensaje',
        default: null
    },
    singleUser: {
        type:Boolean,
        default:true
    },
    creator: {
        trim: true,
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [true, 'Indique un usuario creador']
    }
});

export interface Nombre {
    nombres:string;
    apellidos:string;
}

export interface IUsuarioRoom extends Document {
    usuario:IUsuario['_id'];
    isAdmin?:boolean;
    isSilenced?:boolean;
    blocked?:boolean;
    added?:Date;
}

export interface IRoom extends Document {
    created?:Date;
    nombre:string;
    usuarios?:Types.Array<IUsuarioRoom>;
    singleUser?: boolean;
    creator:IUsuario['_id'];
    ultimoMensaje?:IMensaje['_id'];
}

export const Room = model<IRoom>('Room', roomSchema);
