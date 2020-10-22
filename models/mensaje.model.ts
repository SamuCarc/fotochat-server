import { Document, model, Schema } from 'mongoose';
import { IUsuario } from './usuario.model';
import { IRoom } from './room.model';

const mensajeSchema = new Schema({

    created: {
        type:Date,
        default: Date.now
    },
    mensaje: {
        type:String,
        trim: true,
        required: true
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [ true, 'Debe existir un usuario que envia el mensaje' ]
    },
    room: {
        type: Schema.Types.ObjectId,
        ref: 'Room',
        required: [ true, 'Debe existir una sala asociada al mensaje' ]
    },
    imgs: [{
        type:String
    }],
    referencia: {
        type: Schema.Types.ObjectId,
        ref: 'Mensaje',
        default: null
    },
    deleted: {
        date:{type:Date,default:null},
        isDeleted:{type:Boolean,default:false}
    },
    edited: {
        date:{type:Date,default:null},
        isEdited:{type:Boolean,default:false}
    }

});

export interface IMensaje extends Document {
    created?:Date;
    mensaje:string;
    usuario:IUsuario['_id'];
    room:IRoom['_id'];
    imgs?:string[];
    referencia?:IMensaje['_id'];
    deleted?:any;
    edited?:any;
}

export const Mensaje = model<IMensaje>('Mensaje', mensajeSchema);