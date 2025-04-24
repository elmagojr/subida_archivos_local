const express = require("express");
const multer = require("multer");
const path = require("path");
const ODBC = require("odbc");
const app = express();

//const connectionString = 'DSN=SISC';
const connectionString = 'Driver=SQL Anywhere 12;UID=HID;PWD=DE44EAE255516A0E0AD4901D8691A0F2850548FFC8AFD519AA84833E45F6018A;DBN=SISC_EDNE;ENG=SISC_EDNE;';

const puerto = 4040;

const fs = require('fs');
const { json } = require("stream/consumers");
const uploadDir = path.resolve('archivos_cargados');
var DATA_COOP =[];

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
app.get('/test-connection', async (req, res) => {
    try {
        const connection = await ODBC.connect(connectionString);
        await connection.close();
        res.send('ok');
    } catch (error) {
        console.error('eror:', error);
        res.status(500).send('nop');
    }
});

/* 
app.get('/', async (req, res) => {
    const id = req.query.id;
    console.log('parametro: '+req.query.id);
    

    if (!id) {
        return res.status(400).send('Falta el parámetro "id"');
    }

    try {
        const connection = await ODBC.connect(connectionString);
        const result = await connection.query(`SELECT * FROM DBA.COOPERATIVISTAS where coop_codigo = ?`, [id]);
        await connection.close();
        res.json(result);
    } catch (error) {
        console.error('Error de consulta:', error);
        res.status(500).send('Error al consultar la base de datos');
    }
}); */


 app.get('/', async (req, res)=>{
    const id = req.query.id;
    if (!id) {
        //alert("No ingresaste un nombre.");
        //return res.status(400).send('Falta el parámetro "id"');
    }
    else
    {
        try {
            const connection = await ODBC.connect(connectionString);
            const result = await connection.query(`SELECT * FROM DBA.COOPERATIVISTAS where coop_codigo = ?`, [id]);
            await connection.close();
            //DATA_COOP=  res.json(result);
            DATA_COOP = res.json(result);
            console.log(DATA_COOP);
            
        } catch (error) {
            console.error('Error de consulta:', error);
            res.status(500).send('Error al consultar la base de datos');
        }
    }


    console.log(path.resolve('subir_archivo.html'));    
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