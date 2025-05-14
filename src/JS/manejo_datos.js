



function alerta(texto) {
    alert(texto);
}
function ASIGNA_DATA(data) {
    
    if (data.length > 0) {
        document.getElementById('btn_subir').disabled=false;
        if (data[0].COOP_SEXO===0) { 
            data[0].COOP_SEXO='Masculino';
        } 
        else if (data[0].COOP_SEXO===1) {
            data[0].COOP_SEXO='Femenino';
        } 
        else {
            data[0].COOP_SEXO='No aplica';
        }
        switch (data[0].COOP_ESTADO_CIVIL) {
            case 0:
                data[0].COOP_ESTADO_CIVIL='Soltero(a)';   
                break;
                case 1:
                    data[0].COOP_ESTADO_CIVIL='Casado(a)';   
                    break;  
                    case 2:
                        data[0].COOP_ESTADO_CIVIL='Unión Libre';   
                        break;    
                        case 0:
                            data[0].COOP_ESTADO_CIVIL='Viudo(a)';   
                            break;          
            default:
                break;
        }
        
        document.getElementById('coop_nombre').value = data[0].COOP_NOMBRE;
        document.getElementById('temp_nombre').value = data[0].COOP_NOMBRE;//es el input oculto temporal
        document.getElementById('coop_codigo').value = data[0].COOP_CODIGO;
        document.getElementById('coop_Identidad').value = data[0].COOP_IDENTIDAD;
        document.getElementById('temp_identidad').value = data[0].COOP_IDENTIDAD;//es el input oculto temporal
        document.getElementById('coop_Genero').textContent  = data[0].COOP_SEXO;
        document.getElementById('coop_ec').textContent = data[0].COOP_ESTADO_CIVIL;
        document.getElementById('coop_Telefono').value = data[0].COOP_TEL2;
        document.getElementById('coop_email').value = data[0].COOP_CORREO_ELEC;


        
    } else {
  
    }
}
function mostrarCargando(mostrar) {
    if (mostrar) {
        document.getElementById('pantallaCargando').style.display = 'flex';
    } else {
        document.getElementById('pantallaCargando').style.display = 'none';
    }
  
  }
function btn_load(load) {
    if (load) {
        btn.disabled = load;
        spinner.classList.remove('d-none');
        texto.textContent = 'Subiendo...';
    } else {
        btn.disabled = load;
        spinner.classList.add('d-none');
        texto.textContent = 'Subir archivo';
    }
}
function load_data(tipo) {
    //document.addEventListener('DOMContentLoaded',()=>{
        mostrarCargando(true);   
        const params = new URLSearchParams(window.location.search);
        var id=''
        if (tipo===1) {
             id = params.get('id');
        } else {
             id =document.getElementById('coop').value;//aca se pone en ele cuadr de busqueda
        }
        
        if (id) {
     
            fetch(`/api/coop?id=${id}`).then(response=>response.json()).then(data =>{
                if (data.length > 0) {
                   ASIGNA_DATA(data);     
                   carga_archivos()        
                } else { 
                    alerta("No se encontró al afiliado")
                }
            }).catch(err=>{
                alerta('Error al cargar datos [BD]: '+err.message)
                console.error('Error al cargar datos: ',err);
            })
            
        } 
        mostrarCargando(false);
    //})
}


const btn = document.getElementById('btnSubir');
const spinner = document.getElementById('spinner');
const texto = document.getElementById('textoBtn');


async function crearYSubir() {
    event.preventDefault();
    const btn_subir = document.getElementById('btn_subir');
    const formulario = document.getElementById('formulario');
    const archivo = document.getElementById('archivo').files[0];
    const identidad = document.getElementById('temp_identidad').value;
    const nombre = document.getElementById('temp_nombre').value;  
    const tipoDoc = document.getElementById('Stipo').value; 
    const SIZE_MAX =5;
    mostrarCargando(true)
    //btn_load(true);
    //btn_subir.disabled =true;
    if (!archivo) {
        alerta("No se ha escogido un archivo. Seleccion uno");
        mostrarCargando(false)
        return;
    } else {
        const fileSize = archivo.size;
        if (fileSize >SIZE_MAX * 1024 * 1024) {
            alerta("Archivo excede el tamaño minimo [5MB]")
            mostrarCargando(false);
            return;    
        }        
       
    }
    const fromdata = new FormData();
    fromdata.append('archivo', archivo);
    fromdata.append('identidad', identidad);
    fromdata.append('nombre', nombre);
    fromdata.append('tipo', tipoDoc)
  //para crear el directorio
    const resp = await fetch('/directorio_cargar', {
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({identidad, tipoDoc})
    });
    const dataArchivo = await resp.json();
    if (!resp.ok) {
        alerta("[1]Error al subir archivo: "+ dataArchivo.mensaje);
    } else {
        //creacion subida del archivo
        const res_Archivo = await fetch(`/subir_archivo?identidad=${identidad}&nombre=${nombre}&tipo=${tipoDoc}`,{
            method:'POST',
            body:fromdata
        })
        const data_SUBIDA = await res_Archivo.json();
        if (!res_Archivo) {
            alerta("[2]Error al subir archivo: "+ data_SUBIDA.mensaje);
        } else {
            alerta(">"+ data_SUBIDA.mensaje);
        }
    }
    carga_archivos();
    document.getElementById('archivo').value = '';
    //btn_subir.disabled =false;
    mostrarCargando(false)
    //btn_load(false);
}


async function carga_archivos() {
    const identidad = document.getElementById('temp_identidad').value;
    const btn_subir = document.getElementById('btn_subir');
    mostrarCargando(true);
    const respuesta = await fetch(`/api/lista_archivos/${identidad}`);
  
    if (!respuesta.ok) {
        alerta("No tiene archivos subidos")
        mostrarCargando(false);
        //btn_subir.disabled =true;
    } 
    const datos = await respuesta.json();
    if (datos.length===0) {
        alerta("Se obtuvo respuesta, pero no hay datos que mostrar")
        mostrarCargando(false);
        //btn_subir.disabled =true;
    } 
    
    const tbody = document.getElementById('tbl_archivos').querySelector('tbody');

    tbody.innerHTML = datos.length
    ? datos.map(a=>`
        <tr>
            <td>${a.nombre}</td>
            <td>${a.size}</td>
            <td>${new Date(a.fecha).toLocaleDateString() }</td>
            <td>
            <a target="_blank" class="btn btn-primary" href="/pdf/${identidad}/${a.nombre}" role="button">Ver</a>
             <button class="btn btn-danger btn-sm" onclick="eliminarArchivo('${identidad}', '${encodeURIComponent(a.nombre)}')">Eliminar</button>
            </td>
        </tr>    
        `).join('')
        : '<tr><td>No hay datos</td></tr>'
  document.getElementById('tbl_archivos').style.display='table';
  //btn_subir.disabled =false;
  mostrarCargando(false);
}


async function eliminarArchivo(identidad, nombreArchivo) {
    mostrarCargando(true); 
    const confirmar = confirm(`¿Está seguro que desea eliminar el archivo "${decodeURIComponent(nombreArchivo)}"?`);
    if (!confirmar) return;

    const respuesta = await fetch(`/api/eliminar_archivo/${identidad}/${nombreArchivo}`, {
        method: 'DELETE'
    });

    const resultado = await respuesta.json();

    if (respuesta.ok) {
        alert(resultado.mensaje);
        carga_archivos(); // recarga la tabla
    } else {
        alert("Error al eliminar: " + resultado.mensaje);
    }
    mostrarCargando(false); 
}