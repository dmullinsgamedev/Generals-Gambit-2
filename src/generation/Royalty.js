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

export function generateRoyaltyMesh() {
  const purple = 0x800080, gold = 0xFFD700, red = 0xB22222, skin = 0xf5cfa0;
  const group = new THREE.Group();
  // Dress
  const dress = new THREE.Mesh(
    new THREE.ConeGeometry(0.19, 0.8, 6),
    new THREE.MeshStandardMaterial({ color: purple, metalness: 0.4, roughness: 0.6 })
  );
  dress.position.y = 0.4; group.add(dress);
  group.add(makeTorso(0.7, purple));
  // Gold belt
  const belt = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.15, 0.04, 12),
    new THREE.MeshStandardMaterial({ color: gold, metalness: 0.7, roughness: 0.3 })
  );
  belt.position.y = 0.58; group.add(belt);
  // Head (larger, expressive)
  group.add(makeHead(0.95, skin, 0.16));
  // Expressive face
  makeFace(group, 0, 0.95, 0.13, {
    emotion: randomEmotion('happy'),
    browColor: gold,
    scale: 1.1
  });
  // Crown (band)
  const crownBand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.13, 0.045, 24, 1, true),
    new THREE.MeshStandardMaterial({ color: gold, metalness: 0.85, roughness: 0.25 })
  );
  crownBand.position.y = 1.07; group.add(crownBand);
  // Crown points
  for (let i = 0; i < 7; i++) {
    const angle = (i / 7) * Math.PI * 2;
    const point = new THREE.Mesh(
      new THREE.ConeGeometry(0.022, 0.09, 8),
      new THREE.MeshStandardMaterial({ color: gold, metalness: 0.85, roughness: 0.25 })
    );
    point.position.set(Math.cos(angle) * 0.13, 1.12, Math.sin(angle) * 0.13);
    point.rotation.x = Math.PI / 2;
    point.rotation.z = angle;
    group.add(point);
  }
  // Crown jewels
  const jewelColors = [0x1E90FF, 0xFF0000, 0xFFD700, 0x00FF00, 0xFF69B4, 0x9400D3, 0x00CED1];
  for (let i = 0; i < 7; i++) {
    const angle = (i / 7) * Math.PI * 2;
    const jewel = new THREE.Mesh(
      new THREE.SphereGeometry(0.014, 8, 8),
      new THREE.MeshStandardMaterial({ color: jewelColors[i], metalness: 0.7, roughness: 0.2 })
    );
    jewel.position.set(Math.cos(angle) * 0.135, 1.09, Math.sin(angle) * 0.135);
    group.add(jewel);
  }
  // Cape (custom geometry)
  const capeGeometry = new THREE.BufferGeometry();
  const capeTopY = 0.87, capeBottomY = 0.05;
  const capeTopZ = 0.09, capeBottomZ = -0.18;
  const capeTopX = 0.13, capeBottomX = 0.18;
  const capeVerts = new Float32Array([
    -capeTopX, capeTopY, capeTopZ,
     capeTopX, capeTopY, capeTopZ,
    -capeBottomX, capeBottomY, capeBottomZ,
     capeBottomX, capeBottomY, capeBottomZ
  ]);
  capeGeometry.setAttribute('position', new THREE.BufferAttribute(capeVerts, 3));
  capeGeometry.setIndex([0, 2, 1, 1, 2, 3]);
  capeGeometry.computeVertexNormals();
  const cape = new THREE.Mesh(
    capeGeometry,
    new THREE.MeshStandardMaterial({ color: red, side: THREE.DoubleSide, metalness: 0.2, roughness: 0.8 })
  );
  group.add(cape);
  // Cape clasps
  for (let i = -1; i <= 1; i += 2) {
    const clasp = new THREE.Mesh(
      new THREE.SphereGeometry(0.025, 8, 8),
      new THREE.MeshStandardMaterial({ color: gold, metalness: 0.8, roughness: 0.3 })
    );
    clasp.position.set(0.13 * i, 0.87, 0.09);
    group.add(clasp);
  }
  // Necklace
  const necklace = new THREE.Mesh(
    new THREE.TorusGeometry(0.07, 0.012, 10, 24),
    new THREE.MeshStandardMaterial({ color: gold, metalness: 0.7, roughness: 0.3 })
  );
  necklace.position.y = 0.85;
  necklace.rotation.x = Math.PI / 2.5;
  group.add(necklace);
  // Arms (chunkier hands)
  for (let i = -1; i <= 1; i += 2) {
    group.add(makeArm(0.19 * i, 0.75, 0, purple, true, i * Math.PI / 8));
    group.add(makeArm(0.25 * i, 0.58, 0, skin, false, i * Math.PI / 10));
    // Bracelet
    const bracelet = new THREE.Mesh(
      new THREE.TorusGeometry(0.03, 0.01, 8, 16),
      new THREE.MeshStandardMaterial({ color: gold, metalness: 0.7, roughness: 0.3 })
    );
    bracelet.position.set(0.25 * i, 0.67, 0);
    bracelet.rotation.x = Math.PI / 2;
    group.add(bracelet);
    group.add(makeHand(0.31 * i, 0.47, skin));
  }
  group.position.y = 0.0;
  return group;
} 