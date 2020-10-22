import { Document, model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
var validate = require('mongoose-validator');


var emailValidator = [
    validate({
        validator: 'isEmail',
        message: 'Porfavor introduzca un email válido'
    })
];

const usuarioSchema = new Schema({

	nombre: {
        nombres: {
            type:String,
            trim: true,
            required: [true, 'El nombre del usuario es necesario']
        },
        apellidos: {
            type:String,
            trim: true,
            required: [true, 'Los apellidos del usuario son necesarios']
        }
	},
	avatar: {
        required:false,
        type:String,
        trim: true,
		default: 'av-1.png'
	},
	email: {
        type:String,
        lowercase: true,
        trim: true,
        validate: emailValidator,
		unique:true,
		required: [true, 'El correo es necesario']
	},
	password: {
        type:String,
        bcrypt: true,
		required:[true, 'La contraseña es necesaria']
    },
    created: {
        type: Date,
        default: Date.now
    },
    isEmailValidated: {
        type: Boolean,
        default: false
    }

},
{
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

usuarioSchema.method('compararPassword', function(password:string = ''):boolean {
	if ( bcrypt.compareSync( password, this.password )) {
		return true;
	} else {
		return false;
	}
});

usuarioSchema.virtual('nombreCompleto').get(function():string {
  return this.nombre.nombres + ' ' + this.nombre.apellidos;
 });

usuarioSchema.virtual('nombreCompletoSala').get(function():string {
    let nombreSala = this.nombre.nombres + ' ' + this.nombre.apellidos;
    if (nombreSala.length > 23) {
        nombreSala = nombreSala.substr(0,19) + '...';
    }
    return nombreSala;
});



export interface IUsuario extends Document {
	nombre:Nombre;
	email:string;
	password:string;
    avatar:string;
    nombreCompleto?:string;
    nombreCompletoSala?:string;

    compararPassword(password:string):boolean;
}

interface Nombre {
    nombres:string;
    apellidos:string
}

export const Usuario = model<IUsuario>('Usuario', usuarioSchema);