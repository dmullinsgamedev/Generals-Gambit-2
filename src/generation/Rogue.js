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

export function generateRogueMesh() {
  const red = 0xc0392b, gold = 0xffd700, white = 0xfafafa, dark = 0x22223a, skin = 0x8d6e63, steel = 0xcccccc;
  const group = new THREE.Group();
  // Robe (long, white, with gold trim)
  const robe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.19, 0.85, 16, 1, true),
    new THREE.MeshStandardMaterial({ color: white, metalness: 0.1, roughness: 0.8, side: THREE.DoubleSide })
  );
  robe.position.y = 0.425;
  group.add(robe);
  // Gold trim (front)
  for (let i = -1; i <= 1; i += 2) {
    const trim = new THREE.Mesh(
      new THREE.BoxGeometry(0.025, 0.85, 0.01),
      new THREE.MeshStandardMaterial({ color: gold, metalness: 0.6, roughness: 0.3 })
    );
    trim.position.set(0.13 * i, 0.425, 0.095);
    group.add(trim);
  }
  // Cloak (red, hooded, covers shoulders)
  const cloak = new THREE.Mesh(
    new THREE.CylinderGeometry(0.23, 0.25, 0.9, 16, 1, true, Math.PI * 0.15, Math.PI * 1.7),
    new THREE.MeshStandardMaterial({ color: red, metalness: 0.2, roughness: 0.7, side: THREE.DoubleSide })
  );
  cloak.position.y = 0.45;
  cloak.position.z = -0.01;
  group.add(cloak);
  // Cloak trim (gold)
  for (let i = -1; i <= 1; i += 2) {
    const trim = new THREE.Mesh(
      new THREE.BoxGeometry(0.025, 0.9, 0.01),
      new THREE.MeshStandardMaterial({ color: gold, metalness: 0.6, roughness: 0.3 })
    );
    trim.position.set(0.18 * i, 0.45, 0.13);
    group.add(trim);
  }
  // Torso (under cloak)
  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.15, 0.28, 10),
    new THREE.MeshStandardMaterial({ color: dark, metalness: 0.2, roughness: 0.7 })
  );
  torso.position.y = 0.8;
  group.add(torso);
  // Head (larger, expressive)
  group.add(makeHead(1.16, skin, 0.16));
  // Expressive face
  makeFace(group, 0, 1.16, 0.13, {
    emotion: randomEmotion('mischievous'),
    browColor: dark,
    scale: 1.1
  });
  // Bandit mask (dark band across eyes)
  const mask = new THREE.Mesh(
    new THREE.BoxGeometry(0.11, 0.035, 0.025),
    new THREE.MeshStandardMaterial({ color: dark, metalness: 0.4, roughness: 0.6 })
  );
  mask.position.set(0, 1.17, 0.16);
  group.add(mask);
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