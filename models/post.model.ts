import { Document, model, Schema } from 'mongoose';
import { IUsuario } from './usuario.model';

  
const postSchema = new Schema({

    created: {
        type:Date
    },
    mensaje: {
        type:String
    },
    imgs: [{
        type:String
    }],
    coords: {
        type:String // -12.333, 12.666
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [ true, 'Debe existir una referencia al usuario' ]
    }

});

postSchema.pre<IPost>('save', function( next ) {
    this.created = new Date();
    next();
});

export interface IPost extends Document {
    created:Date;
    mensaje:string;
    imgs:string[];
    coords:string;
    usuario:IUsuario['_id'];
}

export const Post = model<IPost>('Post', postSchema);