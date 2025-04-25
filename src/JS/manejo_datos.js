//const { response } = require("express");



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

document.addEventListener('DOMContentLoaded',()=>{
 const FORMULARIO = document.getElementById('formulario');
 FORMULARIO.addEventListener('submit', async (event)=>{
    event.preventDefault();
    const archivo = document.getElementById('archivo').files[0];
    const identidad = document.getElementById('temp_identidad').value;
    const nombre = document.getElementById('temp_nombre').value;
    
   // const archivo = document.getElementById('archivo').files[0];

    if (!archivo) {
        alerta("No se ha escogido un archivo. Seleccion uno");
        return;
    }

    const fromdata = new FormData();
    fromdata.append('archivo', archivo);
    fromdata.append('temp_identidad', identidad);
    fromdata.append('temp_nombre', nombre);
    try {

        for (const pair of fromdata.entries()) {
            console.log(`${pair[0]}: ${pair[1]}`);
        }
        
        const resp = await fetch('/cargar', {
            method:'POST',
            body:fromdata
        });
        const MENSAJE = await resp.text();
        alerta(MENSAJE);
        FORMULARIO.reset();
    } catch (error) {
        console.error('Error al subir el documento'. error);
        alerta('Error al subir archivo')
    }
 })
})

