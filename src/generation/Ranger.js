import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';
import { makeFace, randomEmotion } from './faceUtils.js';

function makeHead(y, color, size=0.11) {
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

export function generateRangerMesh() {
  const green = 0x228B22, brown = 0x8B5A2B, skin = 0xf5cfa0, leather = 0x8B4513;
  const group = new THREE.Group();
  
  // Ranger tunic (green)
  group.add(makeTorso(0.7, green));
  
  // Head (larger, expressive)
  group.add(makeHead(0.95, skin, 0.16));
  // Expressive face
  makeFace(group, 0, 0.95, 0.13, {
    emotion: randomEmotion('angry'),
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
  
  // Arms (chunkier hands)
  for (let i = -1; i <= 1; i += 2) {
    group.add(makeArm(0.26 * i, 1.01, 0, leather, true, i * Math.PI / 8));
    group.add(makeArm(0.32 * i, 0.8, 0, skin, false, i * Math.PI / 10));
    group.add(makeHand(0.39 * i, 0.69, skin));
    
    // Bow in left hand (i == -1)
    if (i === -1) {
      const bow = new THREE.Group();
      // Bow string (curved)
      const bowString = new THREE.Mesh(
        new THREE.CylinderGeometry(0.002, 0.002, 0.4, 6),
        new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.1, roughness: 0.9 })
      );
      bowString.position.y = 0.1;
      bowString.rotation.z = Math.PI / 2;
      bow.add(bowString);
      // Bow body (curved wood)
      const bowBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.35, 8),
        new THREE.MeshStandardMaterial({ color: brown, metalness: 0.2, roughness: 0.7 })
      );
      bowBody.position.y = 0.1;
      bowBody.rotation.z = Math.PI / 2;
      bow.add(bowBody);
      bow.position.set(0.36 * i - 0.04, 0.69, 0.04);
      bow.rotation.z = Math.PI / 2.2;
      group.add(bow);
    }
    
    // Arrow in right hand (i == 1)
    if (i === 1) {
      const arrow = new THREE.Group();
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 0.25, 6),
        new THREE.MeshStandardMaterial({ color: brown, metalness: 0.2, roughness: 0.7 })
      );
      shaft.position.y = -0.125;
      arrow.add(shaft);
      const arrowhead = new THREE.Mesh(
        new THREE.ConeGeometry(0.012, 0.03, 6),
        new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.7, roughness: 0.3 })
      );
      arrowhead.position.y = -0.26;
      arrow.add(arrowhead);
      const fletching = new THREE.Mesh(
        new THREE.BoxGeometry(0.025, 0.04, 0.01),
        new THREE.MeshStandardMaterial({ color: 0xB22222, metalness: 0.1, roughness: 0.8 })
      );
      fletching.position.y = 0.01;
      arrow.add(fletching);
      arrow.position.set(0.36 * i + 0.04, 0.62, 0.01);
      arrow.rotation.z = Math.PI / 8;
      group.add(arrow);
    }
  }
  
  // Legs (chunkier feet)
  for (let i = -1; i <= 1; i += 2) {
    group.add(makeLeg(0.11 * i, 0.11, green));
    const boot = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.09, 0.12),
      new THREE.MeshStandardMaterial({ color: leather, metalness: 0.2, roughness: 0.8 })
    );
    boot.position.set(0.11 * i, -0.23, 0.06);
    group.add(boot);
  }
  
  // Quiver (on back)
  const quiver = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.06, 0.25, 8),
    new THREE.MeshStandardMaterial({ color: leather, metalness: 0.2, roughness: 0.7 })
  );
  quiver.position.set(0.15, 0.7, -0.08);
  quiver.rotation.z = Math.PI / 6;
  group.add(quiver);
  
  // Arrows in quiver
  for (let i = 0; i < 3; i++) {
    const arrow = new THREE.Mesh(
      new THREE.CylinderGeometry(0.006, 0.006, 0.2, 6),
      new THREE.MeshStandardMaterial({ color: brown, metalness: 0.2, roughness: 0.7 })
    );
    arrow.position.set(0.15 + i * 0.02, 0.7 + i * 0.02, -0.08);
    arrow.rotation.z = Math.PI / 6;
    group.add(arrow);
  }
  
  // Belt with pouches
  const belt = new THREE.Mesh(
    new THREE.CylinderGeometry(0.185, 0.185, 0.04, 6),
    new THREE.MeshStandardMaterial({ color: brown, metalness: 0.3, roughness: 0.7 })
  );
  belt.position.y = 0.51;
  group.add(belt);
  
  // Pouch
  const pouch = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 8, 8),
    new THREE.MeshStandardMaterial({ color: leather, metalness: 0.2, roughness: 0.7 })
  );
  pouch.position.set(0.12, 0.51, 0.08);
  group.add(pouch);
  
  group.position.y = 0.0;
  return group;
} 