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
  // Chunky, low-poly hand
  const hand = new THREE.Mesh(
    new THREE.BoxGeometry(0.09, 0.09, 0.09),
    new THREE.MeshStandardMaterial({ color, metalness: 0.2, roughness: 0.8 })
  );
  hand.position.set(x, y, 0);
  return hand;
}
function makeFoot(x, y, color) {
  // Chunky, low-poly foot
  const foot = new THREE.Mesh(
    new THREE.BoxGeometry(0.11, 0.07, 0.13),
    new THREE.MeshStandardMaterial({ color, metalness: 0.2, roughness: 0.8 })
  );
  foot.position.set(x, y, 0.04);
  return foot;
}

export function generateKnightMesh() {
  const silver = 0xcccccc, dark = 0x222222, brown = 0x8B5A2B, red = 0xB22222, skin = 0xf5cfa0;
  const group = new THREE.Group();
  // Torso
  group.add(makeTorso(0.81, silver, 0.16, 0.18, 0.32, 6));
  // Belt
  const belt = new THREE.Mesh(
    new THREE.CylinderGeometry(0.185, 0.185, 0.04, 6),
    new THREE.MeshStandardMaterial({ color: brown, metalness: 0.3, roughness: 0.7 })
  );
  belt.position.y = 0.65; group.add(belt);
  // Pelvis
  const pelvis = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.13, 0.13),
    new THREE.MeshStandardMaterial({ color: silver, metalness: 0.7, roughness: 0.4 })
  );
  pelvis.position.y = 0.55; group.add(pelvis);
  // Head (large, OSRS style)
  group.add(makeHead(1.18, skin, 0.15));
  // Face (using face utility)
  makeFace(group, 0, 1.18, 0.13, {
    emotion: randomEmotion('neutral'),
    browColor: dark,
    mouthColor: brown,
    pupils: false // Knight style - no pupils
  });
  // Helmet (chunky, low-poly)
  const helmet = new THREE.Mesh(
    new THREE.BoxGeometry(0.19, 0.19, 0.19),
    new THREE.MeshStandardMaterial({ color: silver, metalness: 0.8, roughness: 0.3 })
  );
  helmet.position.y = 1.28; group.add(helmet);
  // Plume (bold, red)
  const plume = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 0.18, 5),
    new THREE.MeshStandardMaterial({ color: red, metalness: 0.5, roughness: 0.5 })
  );
  plume.position.y = 1.41; group.add(plume);
  // Shoulders (chunky)
  for (let i = -1; i <= 1; i += 2) {
    const shoulder = new THREE.Mesh(
      new THREE.BoxGeometry(0.13, 0.07, 0.13),
      new THREE.MeshStandardMaterial({ color: silver, metalness: 0.7, roughness: 0.4 })
    );
    shoulder.position.set(0.19 * i, 1.11, 0);
    shoulder.rotation.z = Math.PI / 10 * i;
    group.add(shoulder);
  }
  // Arms
  for (let i = -1; i <= 1; i += 2) {
    group.add(makeArm(0.19 * i, 1.01, 0, silver, true, i * Math.PI / 8));
    group.add(makeArm(0.25 * i, 0.78, 0, skin, false, i * Math.PI / 10));
    group.add(makeHand(0.31 * i, 0.65, silver));
  }
  // Sword (oversized, iconic)
  const sword = new THREE.Group();
  const blade = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.5, 0.025),
    new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.8, roughness: 0.3 })
  );
  blade.position.y = 0.25;
  sword.add(blade);
  const hilt = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.13, 8),
    new THREE.MeshStandardMaterial({ color: brown, metalness: 0.7, roughness: 0.4 })
  );
  hilt.position.y = 0.56;
  sword.add(hilt);
  sword.position.set(0.38, 0.65, 0.05);
  sword.rotation.z = Math.PI / 6;
  group.add(sword);
  // Shield (chunky, low-poly)
  const shield = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.25, 0.04),
    new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.5, roughness: 0.5 })
  );
  shield.position.set(-0.38, 0.7, 0.05);
  group.add(shield);
  // Legs
  for (let i = -1; i <= 1; i += 2) {
    group.add(makeLeg(0.09 * i, 0.23, silver));
    group.add(makeFoot(0.09 * i, 0.01, dark));
  }
  group.position.y = 0.0;
  return group;
} 