const { app, BrowserWindow, ipcMain,Menu } = require('electron/main')
const path = require('node:path')
const { dialog } = require('electron');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const { exec } = require('child_process');
const ffprobePath = require('ffprobe-static').path;
const extractAudio = require('ffmpeg-extract-audio')
ffmpeg.setFfmpegPath(ffmpegPath);
// Establecer la ruta del ejecutable ffprobe para ffmpeg
ffmpeg.setFfprobePath(ffprobePath);
//console.log(ffprobePath);
function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 970, // Ancho de la ventana
    height: 800, // Alto de la ventana
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
    
  })
 
  ipcMain.handle('abrirelDialogo',()=>dialog.showOpenDialog({
    defaultPath:app.getPath("desktop"),
    buttonLabel:'Selecciona el Directorio Destino',
    properties: ['openDirectory']
}).then(result => {
    //console.log(result.canceled)
    
    if(result.canceled==false){
    mainWindow.webContents.send('directorioFin1',result.filePaths[0].toString())
    }
  }))
 
  
  ipcMain.on('set-title', (event, title) => {
    const webContents = event.sender
    const win = BrowserWindow.fromWebContents(webContents)
    win.setTitle(title)
  })
  
 ipcMain.on('videoSegmentar',(event,video)=>{
  
  const videoInputPath=video.archivoSeleccionado;
  let separacion=videoInputPath.split("\\");
  let extraccion=separacion[separacion.length-1].split(".");
  const videoOutputPath = path.join(video.carpetaVideoSegmentados, `${extraccion[0]}`);
  const audioOutputPath = path.join(video.carpetaVideoSegmentados, `${extraccion[0]}.mp3`);
  console.log(videoOutputPath);
  cortarVideo(videoInputPath, 5,videoOutputPath);
  
  if(video.extraerAudio){
    
     // extract audio at 50% volume (result is an mp3 stream)
const mp3Stream = extractAudio({
  input: videoInputPath,
  format: 'mp3',
  output: audioOutputPath,
  transform: (cmd) => {
    cmd.audioFilters([
      {
        filter: 'volume',
        options: '0.5'
      }
    ])
  }
})
   }else{
    console.log('No se extrae el audio');
   } 
 })
 function cortarVideo(inputPath, segmentDuration,salida) {
    const segmentDurationInSeconds = segmentDuration * 60;

    // Obtener la duración total del video
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
        if (err) {
            console.error('Error al obtener la duración del video:', err);
            return;
        }

        const totalDurationInSeconds = metadata.format.duration;

        // Calcular la cantidad de segmentos
        const cantidadSegmentos = Math.ceil(totalDurationInSeconds / segmentDurationInSeconds);

        // Crear los segmentos
        for (let i = 0; i < cantidadSegmentos; i++) {
            const startTime = i * segmentDurationInSeconds;
            const endTime = Math.min((i + 1) * segmentDurationInSeconds, totalDurationInSeconds);
            const outputFileName = `${salida}_${i}.mp4`;

            ffmpeg(inputPath)
                .setStartTime(startTime)
                .setDuration(endTime - startTime)
                .videoCodec('copy')
                .audioCodec('copy')
                .on('end', () => {
                    //console.log(`Segmento ${outputFileName} creado`);
                })
                .on('error', (err) => {
                    console.error(`Error al crear el segmento ${outputFileName}:`, err);
                })
                .output(outputFileName)
                .run();
        }
        mainWindow.webContents.send('video-operation-completed', cantidadSegmentos);
    });
}
 
/*
  function cortarVideo(inputPath, outputPath) {
    // Duración de cada segmento en segundos (5 minutos)
    const segmentDuration = 5 * 60;
  
    ffmpeg(inputPath)
      .videoCodec('copy')
      .audioCodec('copy')
      .on('end', () => {
        
        
        obtenerCantidadSegmentos(inputPath, 300)
        .then(cantidadSegmentos => {
          mainWindow.webContents.send('video-operation-completed', cantidadSegmentos);  
      console.log('Cantidad de segmentos:', cantidadSegmentos);
  })
  .catch(error => {
      console.error('Error al obtener la cantidad de segmentos:', error);
  });
      })
      .on('error', (err) => {
        console.error('Error al cortar el video:', err);
        //windowsStore.mierror(err.message);
        
      })
      .outputOptions('-map 0')
      .outputOptions(`-segment_time ${segmentDuration}`)
      .outputOptions('-f segment')
      .output(outputPath)
      .run();
      
  }
 */
  /*
  function extraerAudio(inputPath, outputPath) {
    ffmpeg(inputPath)
        .noVideo() // Indica que no se incluya el flujo de video
        .audioCodec('copy') // Copia el flujo de audio sin recodificar
        .on('end', () => {
            console.log('Extracción de audio completada.');
            // Aquí puedes agregar cualquier otra lógica después de la extracción del audio
        })
        .on('error', (err) => {
            console.error('Error al extraer el audio:', err);
        })
        .output(outputPath)
        .run();
}*/
  async function obtenerCantidadSegmentos(inputPath, segmentDuration) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(inputPath, (err, metadata) => {
            if (err) {
                reject(err);
                return;
            }

            const duracionTotal = metadata.format.duration;
            const cantidadSegmentos = Math.ceil(duracionTotal / segmentDuration);
            resolve(cantidadSegmentos);
        });
    });
}
 // mainWindow.setTitle('Segmentador de Videos');
  mainWindow.loadFile('index.html');
  // Quita el menú de la aplicación
  //Menu.setApplicationMenu(null);
  
  
  
}

app.whenReady().then(() => {
  
  createWindow()
  
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})