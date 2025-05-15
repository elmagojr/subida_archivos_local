const express = require("express");
const multer = require("multer");

const fs = require('fs');
const path = require('path')
const ODBC = require("odbc");


const app = express();
app.use(express.json());
const connectionString = 'DSN=SISC';
//const connectionString = 'Driver=SQL Anywhere 12;UID=HID;PWD=DE44EAE255516A0E0AD4901D8691A0F2850548FFC8AFD519AA84833E45F6018A;DBN=SISC_EDNE;ENG=SISC_EDNE;';

const puerto = 3000;

function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}


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

app.get('/api/allcoop', async (req, res) => {
    
    try {
        const connection = await ODBC.connect(connectionString);
        const result = await connection.query(`SELECT coop_codigo,coop_identidad,coop_nombre,coop_rtn,coop_codigo_ant FROM "DBA"."COOPERATIVISTAS" where "COOP_COMPANIA" = (select usu_compania from dba."Usuarios" where usu_codigo = current user)`);
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
    const {identidad, tipoDoc} = req.body;

    try {
        if (!identidad||tipoDoc==0) {
            
            throw new Error("El formulario no se ha completado, favor revisar");
            
        }
        if (!fs.existsSync(dir_principal)) {
            fs.mkdirSync(dir_principal);       
            console.log("directorio1: "+dir_principal); 
        }
        const sub = path.join(dir_principal, identidad);
        console.log("directorio2: "+sub);
        if (!fs.existsSync(sub)) {   
            fs.mkdirSync(sub);
        }
        const subTipo = path.join(sub, tipoDoc);
        if (!fs.existsSync(subTipo)) {   
            fs.mkdirSync(subTipo);
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
        const tipo = req.query.tipo;
        const uploadpath = path.join(dir_principal,nombrEDirectorio,tipo);
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
const upload =  multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 megas
      }
});

app.post('/subir_archivo',  (req,res)=>{
    upload.single('archivo')(req,res, function(err){         

        if (err) {
            if (err.code==='LIMIT_FILE_SIZE') {
                return res.status(400).json({mensaje:"El archivo exede el tamaño permitido [5MB]"})
            }
            return res.status(500).json({ mensaje: 'Error al subir archivo', error: err.message });
        }
        if (!req.file) {
            return res.status(400).json({mensaje:"No se recibio archivo alguno"})
        }
         
        res.json({mensaje:"Archivo cargado con exito "})
    })
   
})

const uploadDir = path.resolve('archivos_cargados');
app.use('/pdf', express.static(uploadDir));

app.get('/api/lista_archivos/:carpeta',(rep, res)=>{
    const carpeta = rep.params.carpeta;
    const direccion = path.join(dir_principal,carpeta);
    if (!fs.existsSync(direccion)) {
        return res.status(400).json({mensaje:"no se encuentra ese directorio"});
    }

    const resultado =[];

    const subcarpetas = fs.readdirSync(direccion).filter(nombre => {
        const subPath = path.join(direccion, nombre);
        return fs.statSync(subPath).isDirectory();
    });

    subcarpetas.forEach(subcarpeta => {
        const SubDir = path.join(direccion, subcarpeta);
        const DirArchivo = fs.readdirSync(SubDir).filter(nombre=>{
            const PFile = path.join(SubDir, nombre);
            return fs.statSync(PFile).isFile();
        }).map(Archivos =>{
            const filepath = path.join(SubDir, Archivos);
            const stats = fs.statSync(filepath);
            return {
                nombre:Archivos,
                size:formatBytes(stats.size),
                fecha:stats.mtime
            };
        });

        resultado.push({
            subcarpeta,
            DirArchivo
        });

        
    });

        res.json(resultado);
/*
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
                size: formatBytes(stats.size),
                fecha: stats.mtime
            };
        });
        res.json(subcarpetas)
    });   
*/
});

app.delete('/api/eliminar_archivo/:carpeta/:tipo/:archivo', (req, res) => {
    const carpeta = req.params.carpeta;
    const archivo = req.params.archivo;
    const tipo = req.params.tipo;

    const ruta = path.join(dir_principal, carpeta, tipo, archivo);

    if (!fs.existsSync(ruta)) {
        return res.status(404).json({ mensaje: "el archivo no se encuentra" });
    }

    fs.unlink(ruta, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ mensaje: "Error del servidor [no se elimino el archivo]" });
        }

        res.json({ mensaje: "Archivo removido" });
    });
});

app.listen(puerto, '0.0.0.0', () => {
    console.log(`Servidor activo en http://localhost:${puerto}`);
})