import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';

function makeHead(y, color, size=0.11) {
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(size, 12, 12),
    new THREE.MeshStandardMaterial({ color, metalness: 0.1, roughness: 0.7 })
  );
  head.position.y = y;
  return head;
}
function makeTorso(y, color) {
  // Very short, wide, blocky torso
  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.15, 0.07, 14),
    new THREE.MeshStandardMaterial({ color, metalness: 0.3, roughness: 0.7 })
  );
  torso.position.y = y;
  return torso;
}
function makeArm(x, y, z, color, rotZ=0) {
  // Arms: attached at mid-torso, angled downward
  const arm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.022, 0.022, 0.13, 8),
    new THREE.MeshStandardMaterial({ color, metalness: 0.2, roughness: 0.7 })
  );
  arm.position.set(x, y, z);
  arm.rotation.z = rotZ;
  return arm;
}
function makeHand(x, y, color) {
  // Small spherical hands
  const hand = new THREE.Mesh(
    new THREE.SphereGeometry(0.038, 8, 8),
    new THREE.MeshStandardMaterial({ color, metalness: 0.2, roughness: 0.8 })
  );
  hand.position.set(x, y, 0);
  return hand;
}

export function generateWizardMesh() {
  const blue = 0x3a4ccf, skin = 0xf5cfa0, gold = 0xFFD700;
  const group = new THREE.Group();
  // Robe (cone, flared, starts right under torso)
  const robe = new THREE.Mesh(
    new THREE.ConeGeometry(0.15, 0.19, 16),
    new THREE.MeshStandardMaterial({ color: blue, metalness: 0.3, roughness: 0.7 })
  );
  robe.position.y = 0.035; group.add(robe);
  // Torso (very short, wide, blocky)
  group.add(makeTorso(0.11, blue));
  // Head (sits directly on torso)
  group.add(makeHead(0.18, skin, 0.11));
  // Minimal face (dots for eyes, small mouth)
  for (let i = -1; i <= 1; i += 2) {
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.012, 6, 6),
      new THREE.MeshStandardMaterial({ color: 0x222222 })
    );
    eye.position.set(0.022 * i, 0.20, 0.11);
    group.add(eye);
  }
  const mouth = new THREE.Mesh(
    new THREE.BoxGeometry(0.018, 0.006, 0.008),
    new THREE.MeshStandardMaterial({ color: 0x8B5A2B })
  );
  mouth.position.set(0, 0.175, 0.115);
  group.add(mouth);
  // Hat (tall, conical, sits low)
  const hat = new THREE.Mesh(
    new THREE.ConeGeometry(0.10, 0.16, 14),
    new THREE.MeshStandardMaterial({ color: blue, metalness: 0.3, roughness: 0.7 })
  );
  hat.position.y = 0.29; group.add(hat);
  // Hat brim (thick, gold, sits low)
  const brim = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 0.022, 18),
    new THREE.MeshStandardMaterial({ color: gold, metalness: 0.7, roughness: 0.3 })
  );
  brim.position.y = 0.22; group.add(brim);
  // Arms (attached at mid-torso, angled downward)
  for (let i = -1; i <= 1; i += 2) {
    group.add(makeArm(0.13 * i, 0.11, 0, blue, i * -Math.PI / 5));
    group.add(makeHand(0.19 * i, 0.01, skin));
  }
  // Book (attached to right hand)
  const book = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.012, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x223366, metalness: 0.4, roughness: 0.5 })
  );
  book.position.set(0.22, 0.01, 0.03);
  book.rotation.set(-Math.PI / 4, Math.PI / 6, Math.PI / 10);
  group.add(book);
  // Book gold accent (spine)
  const bookSpine = new THREE.Mesh(
    new THREE.BoxGeometry(0.008, 0.014, 0.08),
    new THREE.MeshStandardMaterial({ color: gold, metalness: 0.7, roughness: 0.3 })
  );
  bookSpine.position.set(0.25, 0.01, 0.03);
  bookSpine.rotation.set(-Math.PI / 4, Math.PI / 6, Math.PI / 10);
  group.add(bookSpine);
  group.position.y = 0.0;
  return group;
} 