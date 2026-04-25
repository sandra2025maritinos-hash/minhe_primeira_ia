import * as THREE from 'three';

export class AvatarAnimator {
  constructor(avatar, mixer) {
    this.avatar = avatar;
    this.mixer = mixer;
    this.clock = new THREE.Clock();
    this.currentAnimation = null;
  }

  // Animar um gesto específico
  animateGesture(gestureName, duration = 1) {
    return new Promise((resolve) => {
      // Buscar animação pré-definda do modelo ou criar proceduralmente
      const animation = this.createGestureAnimation(gestureName, duration);
      
      const action = this.mixer.clipAction(animation);
      action.reset();
      action.play();

      setTimeout(() => {
        action.stop();
        resolve();
      }, duration * 1000);
    });
  }

  createGestureAnimation(gestureName, duration) {
    // Exemplo: animar os ossos das mãos para um gesto específico
    const bones = this.avatar.skeleton.bones;
    const tracks = [];

    // Criar KeyframeTrack para cada osso envolvido
    const rightHand = bones.find(bone => bone.name.includes('Hand_R'));
    
    if (rightHand) {
      const positionKF = new THREE.VectorKeyframeTrack(
        rightHand.uuid + '.position',
        [0, duration],
        [0, 0, 0, 0.5, 0.3, 0.2] // posições de início e fim
      );
      tracks.push(positionKF);
    }

    return new THREE.AnimationClip('Gesture_' + gestureName, duration, tracks);
  }

  async playSequence(gestures) {
    for (const gesture of gestures) {
      await this.animateGesture(gesture, 1);
    }
  }

  update(deltaTime) {
    this.mixer.update(deltaTime);
  }
}