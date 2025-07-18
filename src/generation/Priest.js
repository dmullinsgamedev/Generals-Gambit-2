import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';
import { makeFace, randomEmotion } from './faceUtils.js';

function makeHead(y, color, size=0.13) {
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(size, 8, 8),
    new THREE.MeshStandardMaterial({ color, metalness: 0.1, roughness: 0.7 })
  );
  head.position.y = y;
  return head;
}
function makeTorso(y, color, rTop=0.13, rBot=0.15, h=0.28, seg=6) {
  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(rTop, rBot, h, seg),
    new THREE.MeshStandardMaterial({ color, metalness: 0.3, roughness: 0.7 })
  );
  torso.position.y = y;
  return torso;
}
function makeLeg(x, y, color) {
  const leg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 0.22, 5),
    new THREE.MeshStandardMaterial({ color, metalness: 0.7, roughness: 0.4 })
  );
  leg.position.set(x, y, 0);
  return leg;
}
function makeArm(x, y, z, color, upper=true, rotZ=0) {
  const geo = upper ? new THREE.CylinderGeometry(0.035, 0.035, 0.22, 5) : new THREE.CylinderGeometry(0.03, 0.03, 0.18, 5);
  const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.2, roughness: 0.7 });
  const arm = new THREE.Mesh(geo, mat);
  arm.position.set(x, y, z);
  arm.rotation.z = rotZ;
  return arm;
}
function makeHand(x, y, color) {
  const hand = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.06, 0.06),
    new THREE.MeshStandardMaterial({ color, metalness: 0.2, roughness: 0.8 })
  );
  hand.position.set(x, y, 0);
  return hand;
}

export function generatePriestMesh() {
  const white = 0xffffff, gold = 0xFFD700, skin = 0xf5cfa0;
  const group = new THREE.Group();
  // Robe
  const robe = new THREE.Mesh(
    new THREE.ConeGeometry(0.19, 0.8, 6),
    new THREE.MeshStandardMaterial({ color: white, metalness: 0.2, roughness: 0.7 })
  );
  robe.position.y = 0.4;
  group.add(robe);
  // Torso
  group.add(makeTorso(0.7, white));
  // Angel wings
  for (let i = -1; i <= 1; i += 2) {
    const wingGroup = new THREE.Group();
    for (let j = 0; j < 7; j++) {
      const feather = new THREE.Mesh(
        new THREE.SphereGeometry(0.10 - 0.012 * j, 8, 6, Math.PI * 0.18, Math.PI * 0.85),
        new THREE.MeshStandardMaterial({ color: white, metalness: 0.1, roughness: 0.85 })
      );
      feather.position.set(
        0.06 * i + 0.06 * j * i,
        0.0 - 0.055 * j + 0.008 * j * j,
        -0.15 - 0.045 * j - 0.01 * j * j
      );
      feather.rotation.z = i * (Math.PI / 2.8 - j * 0.11);
      feather.rotation.y = i * (Math.PI / 2.7 - j * 0.08);
      feather.rotation.x = Math.PI / 2.2 + j * 0.06;
      wingGroup.add(feather);
    }
    wingGroup.position.set(0.0, 0.65, -0.13);
    group.add(wingGroup);
  }
  // Head (larger, expressive)
  group.add(makeHead(0.95, skin, 0.16));
  // Expressive face
  makeFace(group, 0, 0.95, 0.13, {
    emotion: randomEmotion('happy'),
    browColor: gold,
    scale: 1.1
  });
  // Halo
  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(0.13, 0.018, 10, 32),
    new THREE.MeshStandardMaterial({ color: gold, metalness: 0.8, roughness: 0.3 })
  );
  halo.position.y = 1.04;
  halo.rotation.x = Math.PI / 2.2;
  group.add(halo);
  // Arms (chunkier hands)
  for (let i = -1; i <= 1; i += 2) {
    group.add(makeArm(0.19 * i, 0.75, 0, white, true, i * Math.PI / 8));
    group.add(makeArm(0.25 * i, 0.58, 0, skin, false, i * Math.PI / 10));
    const hand = new THREE.Mesh(
      new THREE.SphereGeometry(0.065, 8, 8),
      new THREE.MeshStandardMaterial({ color: skin, metalness: 0.1, roughness: 0.7 })
    );
    hand.position.set(0.31 * i, 0.47, 0);
    group.add(hand);
  }
  group.position.y = 0.0;
  return group;
} 