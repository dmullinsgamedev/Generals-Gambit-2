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

export function generateDragonKnightMesh() {
  const red = 0xB22222, gold = 0xFFD700, skin = 0xf5cfa0, black = 0x000000;
  const group = new THREE.Group();
  
  // Dragon armor (OSRS style - wider)
  group.add(makeTorso(0.81, red, 0.16, 0.18, 0.32, 6));
  
  // Head (OSRS style - larger)
  group.add(makeHead(1.18, skin, 0.15));
  // Expressive face
  makeFace(group, 0, 1.18, 0.13, {
    emotion: randomEmotion('angry'),
    browColor: black,
    scale: 1.1
  });
  
  // Dragon helmet (bolder, chunkier)
  const helmet = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.22, 0.22),
    new THREE.MeshStandardMaterial({ color: red, metalness: 0.8, roughness: 0.3 })
  );
  helmet.position.y = 1.38;
  group.add(helmet);
  
  // Dragon horns
  for (let i = -1; i <= 1; i += 2) {
    const horn = new THREE.Mesh(
      new THREE.ConeGeometry(0.02, 0.1, 6),
      new THREE.MeshStandardMaterial({ color: gold, metalness: 0.8, roughness: 0.3 })
    );
    horn.position.set(0.08 * i, 1.42, 0);
    horn.rotation.z = i * Math.PI / 8;
    group.add(horn);
  }
  
  // Arms (OSRS style - thicker)
  for (let i = -1; i <= 1; i += 2) {
    group.add(makeArm(0.19 * i, 1.01, 0, red, true, i * Math.PI / 8));
    group.add(makeArm(0.25 * i, 0.78, 0, red, false, i * Math.PI / 10));
    group.add(makeHand(0.31 * i, 0.65, skin));
  }
  
  // Dragon sword (oversized)
  const sword = new THREE.Group();
  const blade = new THREE.Mesh(
    new THREE.BoxGeometry(0.09, 0.7, 0.035),
    new THREE.MeshStandardMaterial({ color: gold, metalness: 0.8, roughness: 0.3 })
  );
  blade.position.y = 0.35;
  sword.add(blade);
  const hilt = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.13, 8),
    new THREE.MeshStandardMaterial({ color: red, metalness: 0.7, roughness: 0.4 })
  );
  hilt.position.y = 0.75;
  sword.add(hilt);
  sword.position.set(0.41, 0.65, 0.07);
  sword.rotation.z = Math.PI / 6;
  group.add(sword);
  
  // Belt
  const belt = new THREE.Mesh(
    new THREE.CylinderGeometry(0.185, 0.185, 0.04, 6),
    new THREE.MeshStandardMaterial({ color: gold, metalness: 0.7, roughness: 0.3 })
  );
  belt.position.y = 0.65;
  group.add(belt);
  
  // Legs (OSRS style - thicker)
  for (let i = -1; i <= 1; i += 2) {
    group.add(makeLeg(0.11 * i, 0.23, red));
    group.add(makeFoot(0.11 * i, 0.01, black));
  }
  
  group.position.y = 0.0;
  return group;
} 