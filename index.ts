import Server from './clases/server';
import userRoutes from './routes/usuario';
import mongoose from 'mongoose';

import cors from 'cors';

import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload'

import postRoutes from './routes/post';
import mensajeRoutes from './routes/mensaje';
import roomRoutes from './routes/room';

const server = new Server();

// Body Parser
server.app.use( bodyParser.urlencoded({ extended:true }));
server.app.use( bodyParser.json());

// File Upload
server.app.use( fileUpload({ useTempFiles:true }) );

// Configurar CORS
server.app.use( cors({ origin:true, credentials:true }) );

// Rutas de mi aplicación
server.app.use( '/user', userRoutes );
server.app.use( '/posts', postRoutes );
server.app.use( '/message', mensajeRoutes );
server.app.use( '/room', roomRoutes );

// Conectar DB
mongoose.connect('mongodb://localhost:27017/fotosgram', {
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology: true,
    useFindAndModify: false
},
( err ) => {
    if ( err ) throw err;

    console.log('Base de datos ONLINE');
});

// Levantar express
server.start( () => {
    console.log(`Servidor corriendo en el puerto ${server.port}`)
})