



function alerta(texto) {
    alert(texto);
}
function ASIGNA_DATA(data) {
    if (data.length > 0) {
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
function load_data(tipo) {
    //document.addEventListener('DOMContentLoaded',()=>{
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
                alerta('Error al cargar datos: '+err.message)
                console.error('Error al cargar datos: ',err);
            })
        } 
    //})
}



async function crearYSubir() {
    event.preventDefault();
    const archivo = document.getElementById('archivo').files[0];
    const identidad = document.getElementById('temp_identidad').value;
    const nombre = document.getElementById('temp_nombre').value;
    if (!archivo) {
        alerta("No se ha escogido un archivo. Seleccion uno");
        return;
    }
    const fromdata = new FormData();
    fromdata.append('archivo', archivo);
    fromdata.append('identidad', identidad);
    fromdata.append('nombre', nombre);
  //para crear el directorio
    const resp = await fetch('/directorio_cargar', {
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({identidad})
    });
    const dataArchivo = await resp.json();
    if (!resp.ok) {
        alerta("[1]Error al subir archivo: "+ dataArchivo.mensaje);
    } else {
        alerta("Mensaje: "+ dataArchivo.mensaje);
    }

    const res_Archivo = await fetch(`/subir_archivo?identidad=${identidad}&nombre=${nombre}`,{
        method:'POST',
        body:fromdata
    })
    const dataARchivo = await res_Archivo.json();
    if (!res_Archivo) {
        alerta("[2]Error al subir archivo: "+ res_Archivo.mensaje);
    }

}


async function carga_archivos() {
    const identidad = document.getElementById('temp_identidad').value;
    const respuesta = await fetch(`/api/lista_archivos/${identidad}`);
  
    if (!respuesta.ok) {
        alerta("No tiene archivos subidos")
    } 
    const datos = await respuesta.json();
    if (datos.length===0) {
        alerta("Se obtuvo respuesta, pero no hay datos que mostrar")
    } 
    const tbody = document.getElementById('tbl_archivos').querySelector('tbody');

    tbody.innerHTML = datos.length
    ? datos.map(a=>`
        <tr>
            <td>${a.nombre}</td>
            <td>${a.size}</td>
            <td>${a.fecha}</td>
        </tr>    
        `).join('')
        : '<tr><td>No hay datos</td></tr>'
  document.getElementById('tbl_archivos').style.display='table';

}