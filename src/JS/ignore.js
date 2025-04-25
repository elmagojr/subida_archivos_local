app.post('/cargar',  (req, res)=>{
    const uploadDir = path.resolve('archivos_cargados');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
    }
    const storage = multer.diskStorage({
        destination: (req, file, cb)=>{
            const identidad = req.body.temp_identidad;
            const usr_dir = path.join(uploadDir, identidad);
            console.log('id multer'+identidad);
            if (!fs.existsSync(usr_dir)) {
                fs.mkdirSync(usr_dir, { recursive: true });
            }

            
            cb(null, usr_dir);
        },
        filename: (req, file, cb)=>{
            const nombre = req.body.temp_nombre || 'desconocido';
            const nombreFinal = `${file.originalname}-${Date.now()}-${nombre}`;
            cb(null, nombreFinal);
        }
    })


    const subidaArchivo = multer({
        storage:storage,
        limits: {
            fileSize: 5 * 1024 * 1024 // 5 megas
          }
    }).single('archivo');
    subidaArchivo(req, res, (err) => {
        if (err) {
            console.error('Error al subir archivo:', err);
            return res.status(500).send('Error al subir archivo');
        }

        if (!req.file) {
            return res.status(400).send('No se recibió ningún archivo');
        }

        res.send('Archivo subido exitosamente');
    });

});