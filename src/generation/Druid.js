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

export function generateDruidMesh() {
  const green = 0x228B22, brown = 0x8B5A2B, skin = 0xf5cfa0, darkGreen = 0x006400;
  const group = new THREE.Group();
  
  // Robe (long, green)
  const robe = new THREE.Mesh(
    new THREE.ConeGeometry(0.19, 0.8, 6),
    new THREE.MeshStandardMaterial({ color: green, metalness: 0.1, roughness: 0.8 })
  );
  robe.position.y = 0.4;
  group.add(robe);
  
  // Torso (OSRS style - wider)
  group.add(makeTorso(0.81, green, 0.16, 0.18, 0.32, 6));
  
  // Head (OSRS style - larger)
  group.add(makeHead(1.18, skin, 0.15));
  // Expressive face
  makeFace(group, 0, 1.18, 0.13, {
    emotion: randomEmotion('happy'),
    browColor: brown,
    scale: 1.1
  });
  
  // Hood (green, pulled back)
  const hood = new THREE.Mesh(
    new THREE.ConeGeometry(0.13, 0.18, 8, 1, true),
    new THREE.MeshStandardMaterial({ color: green, metalness: 0.1, roughness: 0.8, side: THREE.DoubleSide })
  );
  hood.position.y = 1.08;
  hood.position.z = -0.04;
  group.add(hood);
  
  // Hair (brown, long)
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 8, 8),
    new THREE.MeshStandardMaterial({ color: brown, metalness: 0.1, roughness: 0.8 })
  );
  hair.position.y = 1.0;
  hair.position.z = -0.03;
  group.add(hair);
  
  // Arms (OSRS style - thicker)
  for (let i = -1; i <= 1; i += 2) {
    group.add(makeArm(0.19 * i, 1.01, 0, green, true, i * Math.PI / 8));
    group.add(makeArm(0.25 * i, 0.78, 0, skin, false, i * Math.PI / 10));
    group.add(makeHand(0.31 * i, 0.65, skin));
  }
  
  // Staff (oversized)
  const staff = new THREE.Group();
  // Staff shaft
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 1.0, 8),
    new THREE.MeshStandardMaterial({ color: brown, metalness: 0.2, roughness: 0.7 })
  );
  shaft.position.y = 0.5;
  staff.add(shaft);
  // Crystal orb
  const crystal = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0x00FFFF, metalness: 0.8, roughness: 0.2 })
  );
  crystal.position.y = 1.0;
  staff.add(crystal);
  staff.position.set(0.41, 0.65, 0.07);
  staff.rotation.z = Math.PI / 6;
  group.add(staff);
  
  group.position.y = 0.0;
  return group;
} 