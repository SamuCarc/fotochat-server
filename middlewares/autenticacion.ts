import { Response, Request, NextFunction } from 'express';
import Token from '../clases/token';
import { IActualizarUsuarioInput } from '../interfaces/interfaces';


export const verificaToken = ( req:any, res:Response, next:NextFunction ) => {

    const userToken = req.get('x-token') || '';

    Token.comprobarToken( userToken )
        .then( (decoded:any) => {

            req.usuario = decoded.usuario;
            next();

        })
        .catch( err => {
            
            res.status(401).json({
                ok:false,
                mensaje: 'El token de usuario no es correcto'
            })

        });

}