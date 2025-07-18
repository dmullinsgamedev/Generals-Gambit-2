import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';

// Supported emotions
const EMOTIONS = ['happy', 'angry', 'surprised', 'neutral', 'mischievous', 'sad'];

// Helper to pick a random emotion
export function randomEmotion(defaultEmotion) {
  if (Math.random() < 0.7) return defaultEmotion; // 70% default, 30% random
  return EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
}

// Add a face to a group at (x, y, z) with a given emotion and color
export function makeFace(group, x, y, z, options = {}) {
  const {
    emotion = 'neutral',
    eyeColor = 0x000000,
    browColor = 0x222222,
    mouthColor = 0x8B5A2B,
    scale = 1.0,
    pupils
  } = options;

  // Randomize pupils if not specified
  const showPupils = (typeof pupils === 'boolean') ? pupils : (Math.random() < 0.5);

  // Eyes (simple spheres like Knight)
  for (let i = -1; i <= 1; i += 2) {
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.022 * scale, 8, 8),
      new THREE.MeshStandardMaterial({ color: eyeColor })
    );
    eye.position.set(x + 0.045 * i * scale, y + 0.04 * scale, z + 0.03 * scale);
    group.add(eye);
    
    // Optional pupils (like Knight - no pupils by default)
    if (showPupils) {
      const pupil = new THREE.Mesh(
        new THREE.SphereGeometry(0.008 * scale, 6, 6),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      );
      pupil.position.set(x + 0.045 * i * scale, y + 0.04 * scale, z + 0.05 * scale);
      group.add(pupil);
    }
  }

  // Brows (simple boxes like Knight)
  for (let i = -1; i <= 1; i += 2) {
    const brow = new THREE.Mesh(
      new THREE.BoxGeometry(0.045 * scale, 0.012 * scale, 0.01 * scale),
      new THREE.MeshStandardMaterial({ color: browColor })
    );
    brow.position.set(x + 0.045 * i * scale, y + 0.07 * scale, z + 0.03 * scale);
    
    // Simple brow rotations based on emotion
    switch (emotion) {
      case 'angry':
        brow.rotation.z = i * 0.18;
        break;
      case 'sad':
        brow.rotation.z = i * -0.1;
        break;
      case 'surprised':
        brow.rotation.z = i * 0.1;
        break;
      case 'mischievous':
        brow.rotation.z = i * 0.08;
        break;
      default:
        brow.rotation.z = 0;
    }
    group.add(brow);
  }

  // Mouth (simple box like Knight)
  let mouthGeom, mouthPos;
  switch (emotion) {
    case 'happy':
      // Simple upturned box for happy
      mouthGeom = new THREE.BoxGeometry(0.06 * scale, 0.012 * scale, 0.01 * scale);
      mouthPos = [x, y - 0.01 * scale, z + 0.03 * scale];
      break;
    case 'surprised':
      // Slightly smaller box for surprised
      mouthGeom = new THREE.BoxGeometry(0.04 * scale, 0.012 * scale, 0.01 * scale);
      mouthPos = [x, y - 0.02 * scale, z + 0.03 * scale];
      break;
    case 'sad':
      // Downturned box for sad
      mouthGeom = new THREE.BoxGeometry(0.06 * scale, 0.012 * scale, 0.01 * scale);
      mouthPos = [x, y - 0.03 * scale, z + 0.03 * scale];
      break;
    case 'mischievous':
      // Slightly offset for mischievous
      mouthGeom = new THREE.BoxGeometry(0.06 * scale, 0.012 * scale, 0.01 * scale);
      mouthPos = [x + 0.01 * scale, y - 0.02 * scale, z + 0.03 * scale];
      break;
    default:
      // Neutral/angry - simple box like Knight
      mouthGeom = new THREE.BoxGeometry(0.06 * scale, 0.012 * scale, 0.01 * scale);
      mouthPos = [x, y - 0.02 * scale, z + 0.03 * scale];
  }

  const mouth = new THREE.Mesh(
    mouthGeom,
    new THREE.MeshStandardMaterial({ color: mouthColor })
  );
  mouth.position.set(...mouthPos);
  group.add(mouth);
} 