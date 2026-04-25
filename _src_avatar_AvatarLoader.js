import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class AvatarLoader {
  constructor(scene) {
    this.scene = scene;
    this.avatar = null;
    this.skeleton = null;
    this.loader = new GLTFLoader();
  }

  async loadAvatar(modelPath) {
    try {
      const gltf = await this.loader.loadAsync(modelPath);
      this.avatar = gltf.scene;
      
      // Extrair esqueleto para animação
      this.skeleton = gltf.animations;
      
      this.scene.add(this.avatar);
      return this.avatar;
    } catch (error) {
      console.error('Erro ao carregar avatar:', error);
      throw error;
    }
  }

  getAnimationMixer() {
    return new THREE.AnimationMixer(this.avatar);
  }
}