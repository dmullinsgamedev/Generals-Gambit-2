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

export function generateNecromancerMesh() {
  const black = 0x000000, purple = 0x800080, bone = 0xF5F5DC, skin = 0xf5cfa0;
  const group = new THREE.Group();
  
  // Robe (long, black)
  const robe = new THREE.Mesh(
    new THREE.ConeGeometry(0.19, 0.8, 6),
    new THREE.MeshStandardMaterial({ color: black, metalness: 0.1, roughness: 0.9 })
  );
  robe.position.y = 0.4;
  group.add(robe);
  
  // Torso
  group.add(makeTorso(0.7, black));
  
  // Head (larger, expressive)
  group.add(makeHead(0.95, skin, 0.16));
  // Expressive face
  makeFace(group, 0, 0.95, 0.13, {
    emotion: randomEmotion('sad'),
    browColor: purple,
    scale: 1.1
  });
  
  // Hood (black, pulled back)
  const hood = new THREE.Mesh(
    new THREE.ConeGeometry(0.13, 0.18, 8, 1, true),
    new THREE.MeshStandardMaterial({ color: black, metalness: 0.1, roughness: 0.9, side: THREE.DoubleSide })
  );
  hood.position.y = 1.08;
  hood.position.z = -0.04;
  group.add(hood);
  
  // Arms (chunkier hands)
  for (let i = -1; i <= 1; i += 2) {
    group.add(makeArm(0.19 * i, 0.75, 0, black, true, i * Math.PI / 8));
    group.add(makeArm(0.25 * i, 0.58, 0, skin, false, i * Math.PI / 10));
    group.add(makeHand(0.31 * i, 0.47, skin));
  }
  
  // Skull Staff (oversized)
  const staff = new THREE.Group();
  // Staff shaft
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 1.0, 8),
    new THREE.MeshStandardMaterial({ color: bone, metalness: 0.2, roughness: 0.7 })
  );
  shaft.position.y = 0.5;
  staff.add(shaft);
  // Skull
  const skull = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 8, 8),
    new THREE.MeshStandardMaterial({ color: bone, metalness: 0.1, roughness: 0.8 })
  );
  skull.position.y = 1.0;
  staff.add(skull);
  // Eye sockets
  for (let i = -1; i <= 1; i += 2) {
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.014, 6, 6),
      new THREE.MeshStandardMaterial({ color: purple, metalness: 0.8, roughness: 0.2 })
    );
    eye.position.set(0.025 * i, 1.0, 0.04);
    staff.add(eye);
  }
  staff.position.set(0.41, 0, 0.07);
  staff.rotation.z = Math.PI / 6;
  group.add(staff);
  
  group.position.y = 0.0;
  return group;
} 