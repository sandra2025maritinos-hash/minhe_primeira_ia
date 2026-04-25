import * as THREE from 'three';

export class VideoRenderer {
  constructor(width = 1280, height = 720, fps = 30) {
    this.width = width;
    this.height = height;
    this.fps = fps;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.renderer = null;
    this.canvas = null;
  }

  // 1. Configura o "Ecrã 3D" (Canvas) com fundo limpo
  setupRenderer(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: true, // Deixa as bordas do avatar suaves
      preserveDrawingBuffer: true,
      alpha: true // Permite colocar cor de fundo
    });
    
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    // Define a cor de fundo (um azul claro agradável, como o da tua plataforma)
    this.renderer.setClearColor(0xf8fafc, 1); 
    
    return this.renderer;
  }

  // 2. Inicia a gravação como se fosse a câmara de um telemóvel
  async startRecording() {
    if (!this.canvas) throw new Error("O Ecrã 3D (Canvas) não foi configurado.");

    // Captura a transmissão de vídeo do canvas a 30 FPS
    const stream = this.canvas.captureStream(this.fps);

    // Tenta usar o formato WebM (excelente qualidade para a web)
        const apiKey = 'AIzaSyAOjGNgd4L5auo50hJjmX6wuaC_gUQuqwE'; // Substitua pela sua chave real
    const video = await generateLibrasVideo(text, './models/model.glb', apiKey);const options = { mimeType: 'video/webm; codecs=vp9' };
    
    try {
      this.mediaRecorder = new MediaRecorder(stream, options);
    } catch (e) {
      // Se o navegador não suportar VP9, usa o padrão do sistema
      console.warn("Codec VP9 não suportado, a usar o gravador padrão.");
      this.mediaRecorder = new MediaRecorder(stream);
    }

    this.recordedChunks = [];

    // Guarda cada "pedacinho" do vídeo à medida que o avatar se mexe
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.mediaRecorder.start();
    console.log("🎥 Gravação da LIBRAS iniciada...");
  }

  // 3. Para a gravação e gera o ficheiro final
  async stopRecording() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        console.log("🛑 Gravação finalizada.");
        // Junta os pedaços todos num ficheiro de vídeo
        const videoBlob = new Blob(this.recordedChunks, { type: 'video/webm' });
        // Cria um link temporário para o vídeo
        const videoUrl = URL.createObjectURL(videoBlob);
        resolve(videoUrl);
      };

      this.mediaRecorder.stop();
    });
  }

  // 4. Função bónus: Faz o download automático para o PC ou telemóvel!
  downloadVideo(videoUrl, textTranslated) {
    // Usamos o texto traduzido para dar um nome bonito ao ficheiro!
    const safeName = textTranslated.replace(/[^a-z0-9]/gi, '_').substring(0, 20);
    const filename = `libras_${safeName}.webm`;

    const downloadLink = document.createElement('a');
    downloadLink.style.display = 'none';
    downloadLink.href = videoUrl;
    downloadLink.download = filename;
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    
    // Limpa a memória
    setTimeout(() => {
      document.body.removeChild(downloadLink);
      window.URL.revokeObjectURL(videoUrl);
    }, 100);
  }
}