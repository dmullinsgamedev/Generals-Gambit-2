import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';
import { makeFace, randomEmotion } from './faceUtils.js';

// Shared helpers
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
function makeArm(x, y, z, color, upper=true, rotZ=0) {
  const geo = upper ? new THREE.CylinderGeometry(0.035, 0.035, 0.22, 5) : new THREE.CylinderGeometry(0.03, 0.03, 0.18, 5);
  const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.2, roughness: 0.7 });
  const arm = new THREE.Mesh(geo, mat);
  arm.position.set(x, y, z);
  arm.rotation.z = rotZ;
  return arm;
}
function makeLeg(x, y, color) {
  const leg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 0.22, 5),
    new THREE.MeshStandardMaterial({ color, metalness: 0.7, roughness: 0.4 })
  );
  leg.position.set(x, y, 0);
  return leg;
}
function makeHand(x, y, color) {
  const hand = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.06, 0.06),
    new THREE.MeshStandardMaterial({ color, metalness: 0.2, roughness: 0.8 })
  );
  hand.position.set(x, y, 0);
  return hand;
}

export function generateVikingJarlMesh() {
  const brown = 0x8B5A2B, gold = 0xFFD700, skin = 0xf5cfa0, red = 0xB22222;
  const group = new THREE.Group();
  
  // Viking armor (brown leather)
  group.add(makeTorso(0.7, brown));
  
  // Head (larger, expressive)
  group.add(makeHead(0.95, skin, 0.16));
  // Expressive face
  makeFace(group, 0, 0.95, 0.13, {
    emotion: randomEmotion('angry'),
    browColor: brown,
    scale: 1.1
  });
  
  // Viking helmet (bolder, chunkier)
  const helmet = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.22, 0.22),
    new THREE.MeshStandardMaterial({ color: gold, metalness: 0.8, roughness: 0.3 })
  );
  helmet.position.y = 1.36;
  group.add(helmet);
  
  // Horns
  for (let i = -1; i <= 1; i += 2) {
    const horn = new THREE.Mesh(
      new THREE.ConeGeometry(0.02, 0.12, 6),
      new THREE.MeshStandardMaterial({ color: gold, metalness: 0.8, roughness: 0.3 })
    );
    horn.position.set(0.1 * i, 1.18, 0);
    horn.rotation.z = i * Math.PI / 6;
    group.add(horn);
  }
  
  // Arms (chunkier hands)
  for (let i = -1; i <= 1; i += 2) {
    group.add(makeArm(0.19 * i, 0.75, 0, brown, true, i * Math.PI / 8));
    group.add(makeArm(0.25 * i, 0.58, 0, skin, false, i * Math.PI / 10));
    group.add(makeHand(0.31 * i, 0.47, skin));
  }
  
  // Viking axe (oversized)
  const axe = new THREE.Group();
  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.7, 6),
    new THREE.MeshStandardMaterial({ color: brown, metalness: 0.2, roughness: 0.7 })
  );
  handle.position.y = 0.35;
  axe.add(handle);
  const axeHead = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.13, 0.05),
    new THREE.MeshStandardMaterial({ color: gold, metalness: 0.8, roughness: 0.3 })
  );
  axeHead.position.y = 0.7;
  axe.add(axeHead);
  axe.position.set(0.41, 0, 0.07);
  axe.rotation.z = Math.PI / 6;
  group.add(axe);
  
  // Belt
  const belt = new THREE.Mesh(
    new THREE.CylinderGeometry(0.185, 0.185, 0.04, 6),
    new THREE.MeshStandardMaterial({ color: gold, metalness: 0.7, roughness: 0.3 })
  );
  belt.position.y = 0.51;
  group.add(belt);
  
  // Legs (chunkier feet)
  for (let i = -1; i <= 1; i += 2) {
    group.add(makeLeg(0.11 * i, 0.11, brown));
    const boot = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.09, 0.12),
      new THREE.MeshStandardMaterial({ color: brown, metalness: 0.2, roughness: 0.8 })
    );
    boot.position.set(0.11 * i, -0.23, 0.06);
    group.add(boot);
  }
  
  group.position.y = 0.0;
  return group;
} 