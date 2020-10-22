import { IUsuario } from '../models/usuario.model';
import { IPost } from '../models/post.model';
import { errorCodeUser } from '../enums/error';

export interface ICrearUsuarioInput {
	nombre:IUsuario['nombre'];
	email:IUsuario['email'];
	password:IUsuario['password'];
    avatar:IUsuario['avatar'];
}

export interface IActualizarUsuarioInput {
    nombre:IUsuario['nombre'];
	email:IUsuario['email'];
	avatar:IUsuario['avatar'];
}

export interface ICrearPostInput {
    created:IPost['created'];
    mensaje:IPost['mensaje'];
    imgs:IPost['imgs'];
    coords:IPost['coords'];
    usuario:IUsuario['_id'];
}


export interface IUsuarioRoomInput {
    usuario:IUsuario['_id'];
    isAdmin?:boolean;
    isSilenced?:boolean;
    blocked?:boolean;
    added?:Date;
}

export interface Nombre {
    nombres:string;
    apellidos:string;
}

export interface passwordValidate {
    ok:boolean;
    errorCode?:errorCodeUser;
    mensaje?:string;
}