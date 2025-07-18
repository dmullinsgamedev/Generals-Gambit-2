import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';

// Generates a boxy head with random facial features, hair, and beard
export function makeBoxyHead(y, skinColor = 0xf5cfa0, hairColor = 0x222222, beardColor = 0x8B5A2B) {
  const group = new THREE.Group();

  // Head (box)
  const head = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.14, 0.14),
    new THREE.MeshStandardMaterial({ color: skinColor, metalness: 0.1, roughness: 0.7 })
  );
  head.position.y = y;
  group.add(head);

  // Eyes
  for (let i = -1; i <= 1; i += 2) {
    const eye = new THREE.Mesh(
      new THREE.BoxGeometry(0.025, 0.025, 0.01),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    eye.position.set(0.035 * i, y + 0.025, 0.08);
    group.add(eye);
    const pupil = new THREE.Mesh(
      new THREE.BoxGeometry(0.01, 0.01, 0.012),
      new THREE.MeshStandardMaterial({ color: 0x000000 })
    );
    pupil.position.set(0.035 * i, y + 0.025, 0.086);
    group.add(pupil);
  }

  // Eyebrows (random angle)
  for (let i = -1; i <= 1; i += 2) {
    const brow = new THREE.Mesh(
      new THREE.BoxGeometry(0.035, 0.008, 0.008),
      new THREE.MeshStandardMaterial({ color: hairColor })
    );
    brow.position.set(0.035 * i, y + 0.055, 0.08);
    brow.rotation.z = i * (Math.random() * 0.3 + 0.1);
    group.add(brow);
  }

  // Mouth (random expression)
  const mouthWidth = 0.04 + Math.random() * 0.03;
  const mouth = new THREE.Mesh(
    new THREE.BoxGeometry(mouthWidth, 0.012, 0.01),
    new THREE.MeshStandardMaterial({ color: 0x000000 })
  );
  mouth.position.set(0, y - 0.03, 0.085);
  mouth.rotation.z = (Math.random() - 0.5) * 0.5;
  group.add(mouth);

  // Random spiky hair (0-7 spikes)
  const hairCount = Math.floor(Math.random() * 8);
  for (let i = 0; i < hairCount; i++) {
    const spike = new THREE.Mesh(
      new THREE.ConeGeometry(0.018 + Math.random()*0.01, 0.06 + Math.random()*0.03, 5),
      new THREE.MeshStandardMaterial({ color: hairColor, metalness: 0.2, roughness: 0.7 })
    );
    spike.position.set(
      (Math.random() - 0.5) * 0.11,
      y + 0.07 + Math.random() * 0.03,
      (Math.random() - 0.5) * 0.04
    );
    spike.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.5;
    spike.rotation.z = (Math.random() - 0.5) * 0.7;
    group.add(spike);
  }

  // Random beard (0-5 spikes)
  const beardCount = Math.floor(Math.random() * 6);
  for (let i = 0; i < beardCount; i++) {
    const beardSpike = new THREE.Mesh(
      new THREE.ConeGeometry(0.012 + Math.random()*0.008, 0.04 + Math.random()*0.03, 5),
      new THREE.MeshStandardMaterial({ color: beardColor, metalness: 0.2, roughness: 0.7 })
    );
    beardSpike.position.set(
      (Math.random() - 0.5) * 0.08,
      y - 0.06,
      0.08 + Math.random() * 0.02
    );
    beardSpike.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.3;
    group.add(beardSpike);
  }

  return group;
} 