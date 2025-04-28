const express = require("express");
const multer = require("multer");

const fs = require('fs');
const path = require('path')
const ODBC = require("odbc");
const { error } = require("console");

const app = express();
app.use(express.json());
//const connectionString = 'DSN=SISC';
const connectionString = 'Driver=SQL Anywhere 12;UID=HID;PWD=DE44EAE255516A0E0AD4901D8691A0F2850548FFC8AFD519AA84833E45F6018A;DBN=SISC_EDNE;ENG=SISC_EDNE;';

const puerto = 4040;

var DATA_COOP = [];
const uploadDir = path.resolve('archivos_cargados');



console.log('path:  ' + path.resolve('js'));
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


app.get('/api/coop', async (req, res) => {
    const id = req.query.id;
    console.log('parametro: ' + req.query.id);

    if (!id) {
        return res.status(400).send('Falta el parámetro para codigo coop');
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
});


app.get('/', async (req, res) => {

    //console.log(path.resolve('subir_archivo.html'));    
    res.sendFile(path.resolve('subir_archivo.html'))
})

//const subidaTemporal = multer().none();
const dir_principal = path.join(__dirname, "archivos_cargados");
app.post('/directorio_cargar', (req, res) => {
    const {identidad} = req.body;


  
    const sub_carpeta = path.join(__dirname, identidad); //carperta con el nuemro de identidad 

    try {
        if (!fs.existsSync(dir_principal)) {
            fs.mkdirSync(dir_principal);       
            console.log("directorio1: "+dir_principal); 
        }
        const sub = path.join(dir_principal, identidad);
        console.log("directorio2: "+sub);
        if (!fs.existsSync(sub)) {   
            fs.mkdirSync(sub);
        }
      return  res.json({mensaje:'Archivo subido con exito'})
    } catch (error) {
        return  res.status(400).json({mensaje:'No se pudo crear directorio'});        
    }


});

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        const nombrEDirectorio = req.query.identidad;
        const nombrePersona = req.query.nombre;
        const uploadpath = path.join(dir_principal,nombrEDirectorio);
        if (!fs.existsSync(uploadpath)) {
            return cb(new Error("El directorio no existe"))
        } 
        cb(null,uploadpath);
    },
    filename:(req,file, cb)=>{
        const nombre = req.query.nombre || 'desconocido';
        const nombreFinal = `${path.parse(file.originalname).name}-${Date.now()}-${nombre}${path.extname(file.originalname)}`;
        cb(null,nombreFinal)
    }
})
const upload =  multer({storage});

app.post('/subir_archivo', upload.single('archivo'), (req,res)=>{
    if (!req.file) {
        return res.status(400).json({mensaje:"No se recibio archivo alguno"})
    }   
    res.json({mensaje:"Archivo cargado con exito ;p;p"})
})

app.get('/api/lista_archivos/:carpeta',(rep, res)=>{
    const carpeta = rep.params.carpeta;
    const direccion = path.join(dir_principal,carpeta);
    if (!fs.existsSync(direccion)) {
        return res.status(400).json({mensaje:"no se encuentra ese directorio"});
    }

    fs.readdir(direccion, (err, archivos)=>{
        if(err){
            console.log(err);
            return res.status(500).json({mensaje:"no se leyó el directorio"});
        }

        const detalle_Archivos = archivos.map(nombreArchivo=>{
            const filePath = path.join(direccion, nombreArchivo);
            const stats = fs.statSync(filePath);
            return {
                nombre: nombreArchivo,
                size: stats.size,
                fecha: stats.mtime
            };
        });
        res.json(detalle_Archivos)
    });   

});

app.listen(puerto, '0.0.0.0', () => {
    console.log(`Servidor activo en http://localhost:${puerto}`);
})