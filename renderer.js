
const setButton = document.getElementById('btn')
/*const titleInput = document.getElementById('title')
setButton.addEventListener('click', () => {
  
   const miprueba=document.getElementById('prueba');
    miprueba.innerHTML='Funciona';
})
*/
var showBox2 = document.getElementById('seleccionDirectorioFin');
showBox2.addEventListener('click', (event) => {
    window.versions.midialogo2();
    window.indexBridge2.directorioFin((event,directorioOrigen)=>{
      const selectedDirLabel2 = document.getElementById('etiqueta')
      selectedDirLabel2.innerHTML=`${directorioOrigen}`
      showBox2.setAttribute('data-title',`Directorio Final: ${directorioOrigen}, este directorio contendrá los archivos donde se copiaran los archivos encontrados`)
      
    })
})
document.addEventListener('DOMContentLoaded', () => {
  const cutButton = document.getElementById('cutButton');
  const videoInput = document.getElementById('videoInput');
  const outputPath = document.getElementById('etiqueta');
  const mialertaExitosa=document.getElementById('miAlertaExitosa');
  const title = "Segmentador de Videos";
  
  window.electronAPI.setTitle(title)
  cutButton.addEventListener('click', () => {
    const chequeado=document.getElementById('flexSwitchCheckChecked');
    const direccion=outputPath.innerHTML;
    const videoInputPath = videoInput.files[0] ? videoInput.files[0].path : null;
    let direccionVideo={};
    if(direccion.includes(":") && videoInputPath!=null){
      direccionVideo={
        carpetaVideoSegmentados:direccion,
        archivoSeleccionado:videoInput.files[0].path,
        extraerAudio:chequeado.checked
      }
      
     window.video.setVideoASegmentar(direccionVideo);
     const alerta=document.getElementById('miAlertaExitosa');
     const LoadingVideos=document.getElementById('LoadingVideos');
     const alertaError=document.getElementById('miAlertaError');
      alertaError.classList.add('d-none');
     alerta.classList.add('d-none');
     LoadingVideos.classList.remove('d-none');
 
    }else{
      const alertaError=document.getElementById('miAlertaError');
      alertaError.classList.remove('d-none');
      console.log('Debe seleccionar un directorio destino');
    }
   
  });
 
});