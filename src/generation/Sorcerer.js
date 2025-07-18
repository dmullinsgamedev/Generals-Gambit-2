import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';
import { generateHumanoidSkeleton } from './HumanoidSkeleton.js';

export function generateSorcererMesh() {
  // Get the hierarchical skeleton and bones
  const { skeleton, bones } = generateHumanoidSkeleton();

  const purple = 0x7c3aed, gold = 0xFFD700, brown = 0x8B5A2B;

  // Robe overlay (cone), parented to pelvis
  const robe = new THREE.Mesh(
    new THREE.ConeGeometry(0.18, 0.45, 18),
    new THREE.MeshStandardMaterial({ color: purple, metalness: 0.3, roughness: 0.7 })
  );
  robe.position.y = -0.08; // slightly below pelvis center
  bones.pelvis.add(robe);

  // Hat (cone) and brim, parented to head
  const hat = new THREE.Mesh(
    new THREE.ConeGeometry(0.13, 0.28, 16),
    new THREE.MeshStandardMaterial({ color: purple, metalness: 0.3, roughness: 0.7 })
  );
  hat.position.y = 0.19;
  bones.head.add(hat);

  const brim = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.16, 0.022, 18),
    new THREE.MeshStandardMaterial({ color: gold, metalness: 0.7, roughness: 0.3 })
  );
  brim.position.y = 0.07;
  bones.head.add(brim);

  // Staff, parented to right hand
  const staff = new THREE.Mesh(
    new THREE.CylinderGeometry(0.022, 0.022, 0.55, 10),
    new THREE.MeshStandardMaterial({ color: brown, metalness: 0.2, roughness: 0.7 })
  );
  staff.position.set(0, -0.18, 0.04);
  staff.rotation.set(-Math.PI / 8, Math.PI / 12, Math.PI / 20);
  bones.hands.right.add(staff);

  // Minimal face (dots for eyes), parented to head
  const black = 0x222222;
  for (let i = -1; i <= 1; i += 2) {
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.014, 6, 6),
      new THREE.MeshStandardMaterial({ color: black })
    );
    eye.position.set(0.045 * i, 0.04, 0.11);
    bones.head.add(eye);
  }

  // Scale the group to match other generals
  skeleton.scale.set(1.5, 1.5, 1.5);
  return skeleton;
} 