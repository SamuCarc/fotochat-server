"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uniqid_1 = __importDefault(require("uniqid"));
class FileSystem {
    constructor() { }
    ;
    guardarImagenTemporal(file, userId) {
        return new Promise((resolve, reject) => {
            // Crear carpetas
            const path = this.crearCarpetaUsuario(userId);
            // Nombre archivo
            const nombreArchivo = this.generarNombreUnico(file.name);
            // Mover el archivo del Temp a nuestra carpeta
            file.mv(`${path}/${nombreArchivo}`, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(nombreArchivo);
                }
            });
        });
    }
    generarNombreUnico(nombreOriginal) {
        const nombreArr = nombreOriginal.split('.');
        const extension = nombreArr[nombreArr.length - 1];
        //npm install uniqueid
        const idUnico = uniqid_1.default();
        return `${idUnico}.${extension}`;
    }
    crearCarpetaUsuario(userId) {
        const pathUser = path_1.default.resolve(__dirname, '../uploads/', userId);
        const pathUserTemp = pathUser + '/temp';
        const existe = fs_1.default.existsSync(pathUserTemp);
        if (!existe) {
            try {
                fs_1.default.mkdirSync(pathUserTemp, { recursive: true });
            }
            catch (err) {
                console.log(err.message);
            }
        }
        return pathUserTemp;
    }
    imagenesDeTempHaciaPost(userId) {
        const pathTemp = path_1.default.resolve(__dirname, '../uploads/', userId, 'temp');
        const pathPost = path_1.default.resolve(__dirname, '../uploads/', userId, 'posts');
        if (!fs_1.default.existsSync(pathTemp)) {
            return [];
        }
        if (!fs_1.default.existsSync(pathPost)) {
            fs_1.default.mkdirSync(pathPost);
        }
        const imagenesTemp = this.obtenerImagenesEnTemp(userId);
        imagenesTemp.forEach(imagen => {
            fs_1.default.renameSync(`${pathTemp}/${imagen}`, `${pathPost}/${imagen}`);
        });
        return imagenesTemp;
    }
    obtenerImagenesEnTemp(userId) {
        const pathTemp = path_1.default.resolve(__dirname, '../uploads/', userId, 'temp');
        return fs_1.default.readdirSync(pathTemp) || [];
    }
    getFotoUrl(userId, img) {
        const pathFoto = path_1.default.resolve(__dirname, '../uploads/', userId, 'posts', img);
        const existe = fs_1.default.existsSync(pathFoto);
        if (!existe) {
            return path_1.default.resolve(__dirname, '../assets/400x250.jpg');
        }
        return pathFoto;
    }
    borrarTemp(userId) {
        const pathTemp = path_1.default.resolve(__dirname, '../uploads/', userId, 'temp');
        return new Promise(resolve => {
            if (fs_1.default.existsSync(pathTemp)) {
                try {
                    fs_1.default.rmdirSync(pathTemp, { recursive: true });
                    resolve(true);
                }
                catch (err) {
                    resolve(false);
                }
            }
            else
                resolve(true);
        });
    }
    borrarFotoTemp(userId, img) {
        return new Promise(resolve => {
            const pathFoto = path_1.default.resolve(__dirname, '../uploads/', userId, 'temp', img);
            const existe = fs_1.default.existsSync(pathFoto);
            if (existe) {
                try {
                    fs_1.default.unlinkSync(`${pathFoto}`);
                    resolve(true);
                }
                catch (err) {
                    resolve(false);
                }
            }
            else
                resolve(true);
        });
    }
}
exports.default = FileSystem;
