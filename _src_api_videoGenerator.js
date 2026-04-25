import { AvatarLoader } from './_src_avatar_AvatarLoader.js';
import { AvatarAnimator } from './_src_avatar_AvatarAnimator.js';
import { GestureMapper } from './_src_libras_GestureMapper.js';
import { VideoRenderer } from './_src_video_VideoRenderer.js';
import * as THREE from 'three';

// Adicionámos o apiKey como parâmetro para o Gemini funcionar!
export async function generateLibrasVideo(text, avatarModelPath, apiKey) {
  console.log(`🎬 Preparando estúdio para gravar: "${text}"`);

  // 1. Configurar Cena 3D e Câmara
  const scene = new THREE.Scene();
  // Ajustamos a câmara para 45 graus, formato 16:9 (HD)
  const camera = new THREE.PerspectiveCamera(45, 1280 / 720, 0.1, 1000);
  // Posicionamos a câmara para focar no tronco e rosto do avatar (onde a LIBRAS acontece)
  camera.position.set(0, 1.4, 3.5); 

  const canvas = document.createElement('canvas');
  
  // 2. Carregar o Avatar
  const avatarLoader = new AvatarLoader(scene);
  const avatar = await avatarLoader.loadAvatar(avatarModelPath);
  
  // Centraliza o modelo no chão da nossa cena
  avatar.position.set(0, 0, 0);
  
  // 3. Adicionar Iluminação (Fundamental para o vídeo ficar bonito)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // Luz geral suave
  scene.add(ambientLight);
  
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8); // Luz principal (como o sol)
  dirLight.position.set(2, 5, 5);
  // Sombras suaves para dar profundidade
  dirLight.castShadow = true; 
  scene.add(dirLight);
  
  // 4. Chamar a IA para converter o Português em GLOSA de LIBRAS
  const gestureMapper = new GestureMapper();
  const gestures = await gestureMapper.textToGestures(text, apiKey);
  
  // 5. Configurar o Motor de Animação e o Gravador
  const mixer = avatarLoader.getAnimationMixer();
  const animator = new AvatarAnimator(avatar, mixer);
  
  const videoRenderer = new VideoRenderer(1280, 720, 30); // Gravar em HD a 30 FPS
  const renderer = videoRenderer.setupRenderer(canvas);
  
  // 6. O SEGREDO DO 3D: O Loop de Renderização Contínua
  const clock = new THREE.Clock();
  let isAnimating = true;

  function renderLoop() {
    if (!isAnimating) return;
    
    // Pede ao navegador para desenhar o próximo frame
    requestAnimationFrame(renderLoop);
    
    // Atualiza os ossos do avatar baseados no tempo que passou
    const delta = clock.getDelta();
    mixer.update(delta);
    
    // Desenha a cena na nossa câmara
    renderer.render(scene, camera);
  }
  
  // Ligar os "motores" visuais
  renderLoop();

  // 7. Ação!
  await videoRenderer.startRecording();
  
  // O Avatar começa a reproduzir a sequência de LIBRAS
  await animator.playSequence(gestures);
  
  // Corta! Parar gravação e desligar motores
  const videoUrl = await videoRenderer.stopRecording();
  isAnimating = false; // Poupa a memória do computador
  
  // 8. Entrega o vídeo ao utilizador (Download automático)
  if (videoUrl) {
    videoRenderer.downloadVideo(videoUrl, text);
    console.log("✅ Vídeo gerado e transferido com sucesso!");
  } else {
    console.error("❌ Falha ao gerar o vídeo.");
  }
  
  return videoUrl;
}