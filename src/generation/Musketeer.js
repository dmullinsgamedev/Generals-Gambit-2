import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';
import { makeFace, randomEmotion } from './faceUtils.js';

function makeHead(y, color, size=0.15) {
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(size, 8, 8),
    new THREE.MeshStandardMaterial({ color, metalness: 0.1, roughness: 0.7 })
  );
  head.position.y = y;
  return head;
}
function makeTorso(y, color, rTop=0.16, rBot=0.18, h=0.32, seg=6) {
  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(rTop, rBot, h, seg),
    new THREE.MeshStandardMaterial({ color, metalness: 0.3, roughness: 0.7 })
  );
  torso.position.y = y;
  return torso;
}
function makeArm(x, y, z, color, upper=true, rotZ=0) {
  const geo = upper ? new THREE.CylinderGeometry(0.04, 0.04, 0.24, 5) : new THREE.CylinderGeometry(0.035, 0.035, 0.18, 5);
  const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.2, roughness: 0.7 });
  const arm = new THREE.Mesh(geo, mat);
  arm.position.set(x, y, z);
  arm.rotation.z = rotZ;
  return arm;
}
function makeLeg(x, y, color) {
  const leg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.055, 0.24, 5),
    new THREE.MeshStandardMaterial({ color, metalness: 0.7, roughness: 0.4 })
  );
  leg.position.set(x, y, 0);
  return leg;
}
function makeHand(x, y, color) {
  const hand = new THREE.Mesh(
    new THREE.BoxGeometry(0.09, 0.09, 0.09),
    new THREE.MeshStandardMaterial({ color, metalness: 0.2, roughness: 0.8 })
  );
  hand.position.set(x, y, 0);
  return hand;
}
function makeFoot(x, y, color) {
  const foot = new THREE.Mesh(
    new THREE.BoxGeometry(0.11, 0.07, 0.13),
    new THREE.MeshStandardMaterial({ color, metalness: 0.2, roughness: 0.8 })
  );
  foot.position.set(x, y, 0.04);
  return foot;
}

export function generateMusketeerMesh() {
  const blue = 0x4169E1, gold = 0xFFD700, skin = 0xf5cfa0, brown = 0x8B5A2B;
  const group = new THREE.Group();
  
  // Musketeer coat (OSRS style - wider)
  group.add(makeTorso(0.81, blue, 0.16, 0.18, 0.32, 6));
  
  // Head (OSRS style - larger)
  group.add(makeHead(1.18, skin, 0.15));
  // Expressive face
  makeFace(group, 0, 1.18, 0.13, {
    emotion: randomEmotion('neutral'),
    browColor: brown,
    scale: 1.1
  });
  
  // Hat (chunkier)
  const hat = new THREE.Mesh(
    new THREE.CylinderGeometry(0.19, 0.19, 0.12, 8),
    new THREE.MeshStandardMaterial({ color: blue, metalness: 0.2, roughness: 0.7 })
  );
  hat.position.y = 1.20;
  group.add(hat);
  
  // Hat feather (bigger)
  const feather = new THREE.Mesh(
    new THREE.ConeGeometry(0.03, 0.22, 6),
    new THREE.MeshStandardMaterial({ color: gold, metalness: 0.1, roughness: 0.8 })
  );
  feather.position.set(0.13, 1.34, 0);
  feather.rotation.z = Math.PI / 5;
  group.add(feather);
  
  // Arms (OSRS style - thicker)
  for (let i = -1; i <= 1; i += 2) {
    group.add(makeArm(0.19 * i, 1.01, 0, blue, true, i * Math.PI / 8));
    group.add(makeArm(0.25 * i, 0.78, 0, skin, false, i * Math.PI / 10));
    group.add(makeHand(0.31 * i, 0.65, skin));
  }
  
  // Musket (oversized)
  const musket = new THREE.Group();
  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.8, 6),
    new THREE.MeshStandardMaterial({ color: brown, metalness: 0.2, roughness: 0.7 })
  );
  barrel.position.y = 0.4;
  musket.add(barrel);
  const stock = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.6, 0.08),
    new THREE.MeshStandardMaterial({ color: brown, metalness: 0.2, roughness: 0.7 })
  );
  stock.position.y = 0.18;
  musket.add(stock);
  musket.position.set(0.41, 0.65, 0.07);
  musket.rotation.z = Math.PI / 6;
  group.add(musket);
  
  // Belt
  const belt = new THREE.Mesh(
    new THREE.CylinderGeometry(0.185, 0.185, 0.04, 6),
    new THREE.MeshStandardMaterial({ color: gold, metalness: 0.7, roughness: 0.3 })
  );
  belt.position.y = 0.65;
  group.add(belt);
  
  // Legs (OSRS style - thicker)
  for (let i = -1; i <= 1; i += 2) {
    group.add(makeLeg(0.11 * i, 0.23, blue));
    group.add(makeFoot(0.11 * i, 0.01, brown));
  }
  
  group.position.y = 0.0;
  return group;
} 