const express = require("express");
const multer = require("multer");
const path = require("path");
const app = express();

const puerto = 4040;

const fs = require('fs');
const uploadDir = path.resolve('archivos_cargados');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}


const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, uploadDir);
    },
    filename: (req, file, cb)=>{
        const nombre = Date.now()+'-'+file.originalname
        cb(null, nombre)
    }
})

const subidaArchivo = multer({
    storage:storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 megas
      }
});
console.log(path.resolve('JS'));
//app.use(express.static(path.resolve('subir_archivo.html')));
app.use(express.static(path.resolve('JS')));
app.get('/', (req, res)=>{
    res.sendFile(path.resolve('subir_archivo.html'))

})

app.post('/cargar', subidaArchivo.single('archivo'), (req, res)=>{
    if (!req.file) {
        return res.status(400).send('No se pudo subir el archivo');
    }
    res.send('Archivo subido con éxito.');

});

app.listen(puerto, '0.0.0.0', ()=>{
    console.log(`Servidor activo en http://localhost:${puerto}`);
    console.log(uploadDir); 
})