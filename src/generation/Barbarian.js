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

export function generateBarbarianMesh() {
  // Colors
  const blue = 0x3a4ccf, vest = 0x2d3a4e, brown = 0x8B5A2B, lightBlue = 0x7ec6e3, pants = 0x6a6a7a, skin = 0xf5cfa0, boot = 0x7a4a1b, bandana = 0xb23a3a, metal = 0xcccccc, hair = 0x222222, knee = 0x888888;
  const group = new THREE.Group();

  // Torso (OSRS style - wider)
  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.18, 0.32, 6),
    new THREE.MeshStandardMaterial({ color: blue, metalness: 0.2, roughness: 0.7 })
  );
  torso.position.y = 0.81;
  group.add(torso);

  // Belt
  const belt = new THREE.Mesh(
    new THREE.CylinderGeometry(0.185, 0.185, 0.04, 6),
    new THREE.MeshStandardMaterial({ color: brown, metalness: 0.3, roughness: 0.7 })
  );
  belt.position.y = 0.65;
  group.add(belt);

  // Pelvis
  const pelvis = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.13, 0.13),
    new THREE.MeshStandardMaterial({ color: pants, metalness: 0.7, roughness: 0.4 })
  );
  pelvis.position.y = 0.55;
  group.add(pelvis);

  // Head (OSRS style - larger)
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 18, 18),
    new THREE.MeshStandardMaterial({ color: skin, metalness: 0.1, roughness: 0.7 })
  );
  head.position.y = 1.18;
  group.add(head);
  // Expressive face
  makeFace(group, 0, 1.18, 0.13, {
    emotion: randomEmotion('angry'),
    browColor: hair,
    scale: 1.1
  });

  // Hair (spiky, cones, more exaggerated)
  const hairCount = 7;
  for (let i = 0; i < hairCount; i++) {
    const spike = new THREE.Mesh(
      new THREE.ConeGeometry(0.022, 0.09, 5),
      new THREE.MeshStandardMaterial({ color: hair, metalness: 0.2, roughness: 0.7 })
    );
    spike.position.set(
      (Math.random() - 0.5) * 0.13,
      1.25 + Math.random() * 0.06,
      (Math.random() - 0.5) * 0.05
    );
    spike.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.5;
    spike.rotation.z = (Math.random() - 0.5) * 0.7;
    group.add(spike);
  }

  // Beard (spiky, cones, more exaggerated)
  const beardCount = 5;
  for (let i = 0; i < beardCount; i++) {
    const beardSpike = new THREE.Mesh(
      new THREE.ConeGeometry(0.016, 0.06, 5),
      new THREE.MeshStandardMaterial({ color: brown, metalness: 0.2, roughness: 0.7 })
    );
    beardSpike.position.set(
      (Math.random() - 0.5) * 0.1,
      1.10,
      0.11 + Math.random() * 0.02
    );
    beardSpike.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.3;
    group.add(beardSpike);
  }

  // Arms (OSRS style - thicker)
  for (let i = -1; i <= 1; i += 2) {
    // Upper arm
    const upperArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.24, 5),
      new THREE.MeshStandardMaterial({ color: lightBlue, metalness: 0.2, roughness: 0.7 })
    );
    upperArm.position.set(0.26 * i, 1.01, 0);
    upperArm.rotation.z = i * Math.PI / 8;
    group.add(upperArm);
    // Lower arm
    const lowerArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 0.18, 5),
      new THREE.MeshStandardMaterial({ color: skin, metalness: 0.1, roughness: 0.7 })
    );
    lowerArm.position.set(0.32 * i, 0.78, 0);
    lowerArm.rotation.z = i * Math.PI / 10;
    group.add(lowerArm);
    // Glove (OSRS style - chunkier)
    const glove = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.09, 0.09),
      new THREE.MeshStandardMaterial({ color: brown, metalness: 0.2, roughness: 0.8 })
    );
    glove.position.set(0.38 * i, 0.65, 0);
    group.add(glove);
  }

  // Legs (OSRS style - thicker)
  for (let i = -1; i <= 1; i += 2) {
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.055, 0.24, 5),
      new THREE.MeshStandardMaterial({ color: pants, metalness: 0.7, roughness: 0.4 })
    );
    leg.position.set(0.11 * i, 0.23, 0);
    group.add(leg);
    // Boot (OSRS style - chunkier)
    const bootMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, 0.07, 0.13),
      new THREE.MeshStandardMaterial({ color: boot, metalness: 0.2, roughness: 0.8 })
    );
    bootMesh.position.set(0.11 * i, 0.01, 0.04);
    group.add(bootMesh);
  }

  group.position.y = 0.0;
  return group;
} 