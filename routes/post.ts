import { Router, Request, Response } from "express";
import { verificaToken } from '../middlewares/autenticacion';
import bodyParser from 'body-parser';
import { Post } from '../models/post.model';
import { FileUpload } from '../interfaces/file-upload';
import FileSystem from '../clases/file-system';
import { ICrearPostInput } from '../interfaces/interfaces';


const postRoutes = Router();
const fileSystem:FileSystem = new FileSystem();

// Obtener POSTS paginados
postRoutes.get('/', async (req:any, res:Response) => {

    let pagina = Number(req.query.pagina) || 1;
    let skip = pagina - 1;
    skip = skip * 10;

    const posts = await Post.find()
                            .sort({_id:-1})
                            .skip( skip )
                            .limit(10)
                            .populate('usuario', '-password')
                            .exec();
    
    res.json({
        ok:true,
        pagina,
        posts
    });

});


// Crear post
postRoutes.post('/', [verificaToken], (req:any, res:Response) => {

    const body:ICrearPostInput = req.body;
    body.usuario = req.usuario._id;

    const imagenes = fileSystem.imagenesDeTempHaciaPost( body.usuario );
    body.imgs = imagenes;

    Post.create( body ).then(async postDB => {

        await postDB.populate('usuario', '-password').execPopulate();

        res.json({
            ok:true,
            post: postDB
        });
    }).catch( err => {
        res.status(500).json(err)
    });


})


// Servicio para subir archivos
postRoutes.post( '/upload', [verificaToken], async (req:any, res:Response) => {

    if ( !req.files ) {
        return res.status(400).json({
            ok:false,
            mensaje: 'No se ha subido ningún archivo'
        });
    }

    const file:FileUpload = req.files.image;

    if ( !file ) {
        return res.status(400).json({
            ok:false,
            mensaje: 'No se ha subido ningún archivo - image'
        });
    }

    if ( !file.mimetype.includes('image') ) {
        return res.status(400).json({
            ok:false,
            mensaje: 'El archivo subido no es una imagen'
        });
    }

    const nombreImagenTemp = await fileSystem.guardarImagenTemporal( file, req.usuario._id );

    res.json({
        ok:true,
        file:nombreImagenTemp
    });

});

// Obtenemos una imagen
postRoutes.get( '/imagen/:userid/:img', (req:any, res:Response) => {

    const userId = req.params.userid;
    const img = req.params.img;

    const pathFoto = fileSystem.getFotoUrl( userId, img );

    res.sendFile( pathFoto );

});

// Borrar imagenes de temporal
postRoutes.delete( '/imagen/deleteTemp', [verificaToken], async (req:any, res:Response) => {

    const userId = req.usuario._id;

    const respuesta = await fileSystem.borrarTemp( userId ); // Borramos todo el directorio temp

    res.json({
        ok:respuesta,
    });

});

// Borrar imagenes de temporal
postRoutes.delete( '/imagen/delete/:img', [verificaToken], async (req:any, res:Response) => {

    const userId = req.usuario._id;
    const img = req.params.img;

    const respuesta = await fileSystem.borrarFotoTemp( userId, img ); // Borramos todo el directorio temp

    res.json({
        ok:respuesta,
    });

});

export default postRoutes;