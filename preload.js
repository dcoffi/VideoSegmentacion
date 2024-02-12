const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
  setTitle: (title) => ipcRenderer.send('set-title', title)
});

contextBridge.exposeInMainWorld('versions', {
    midialogo2:()=> ipcRenderer.invoke('abrirelDialogo'),
    
  })
contextBridge.exposeInMainWorld('video',{
  setVideoASegmentar:(videoASegmentar)=>ipcRenderer.send('videoSegmentar',videoASegmentar),
 
  
});
// Manejar eventos del ipcRenderer y actualizar el HTML
ipcRenderer.on('video-operation-completed', (event, message) => {
  //const pruebaDiv = document.getElementById('prueba');
  const alerta=document.getElementById('miAlertaExitosa');
  const LoadingVideos=document.getElementById('LoadingVideos');
  const videosSegmentados=document.getElementById('missegmentos');
  LoadingVideos.classList.add('d-none');
  //pruebaDiv.innerText = message;
  videosSegmentados.innerHTML=message;
  //console.log(message);
  alerta.classList.remove('d-none');

  
});
let indexBridge2={
    directorioFin:(callback)=>ipcRenderer.on('directorioFin1',(callback))
  }
  contextBridge.exposeInMainWorld("indexBridge2",indexBridge2)
  
  
