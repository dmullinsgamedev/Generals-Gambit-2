import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';

// Proportions based on the wooden mannequin image
const PROPS = {
  head: { r: 0.11, y: 0.88 },
  neck: { r: 0.045, h: 0.06, y: 0.81 },
  torso: { w: 0.19, d: 0.11, h: 0.19, y: 0.68 },
  abdomen: { w: 0.15, d: 0.10, h: 0.10, y: 0.58 },
  pelvis: { w: 0.13, d: 0.10, h: 0.10, y: 0.48 },
  upperArm: { r: 0.04, h: 0.16, y: 0.74, x: 0.15 },
  lowerArm: { r: 0.035, h: 0.14, y: 0.58, x: 0.19 },
  hand: { r: 0.045, y: 0.48, x: 0.19 },
  upperLeg: { r: 0.05, h: 0.19, y: 0.38, x: 0.07 },
  lowerLeg: { r: 0.045, h: 0.17, y: 0.19, x: 0.07 },
  foot: { w: 0.09, h: 0.03, d: 0.045, y: 0.03, x: 0.07, z: 0.04 },
};

export function generateHumanoidSkeleton() {
  // Create groups for each bone
  const pelvis = new THREE.Group();
  const abdomen = new THREE.Group();
  const torso = new THREE.Group();
  const neck = new THREE.Group();
  const head = new THREE.Group();

  // Meshes for each part
  const pelvisMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(PROPS.pelvis.w/2, PROPS.pelvis.w/2, PROPS.pelvis.h, 12),
    new THREE.MeshStandardMaterial({ color: 0xd2b48c, metalness: 0.2, roughness: 0.7 })
  );
  pelvis.add(pelvisMesh);
  pelvis.position.y = PROPS.pelvis.y;

  const abdomenMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(PROPS.abdomen.w/2, PROPS.abdomen.w/2, PROPS.abdomen.h, 12),
    new THREE.MeshStandardMaterial({ color: 0xd2b48c, metalness: 0.2, roughness: 0.7 })
  );
  abdomen.add(abdomenMesh);
  abdomen.position.y = PROPS.abdomen.y - PROPS.pelvis.y;
  pelvis.add(abdomen);

  const torsoMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(PROPS.torso.w/2, PROPS.torso.w/2, PROPS.torso.h, 14),
    new THREE.MeshStandardMaterial({ color: 0xd2b48c, metalness: 0.2, roughness: 0.7 })
  );
  torso.add(torsoMesh);
  torso.position.y = PROPS.torso.y - PROPS.abdomen.y;
  abdomen.add(torso);

  const neckMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(PROPS.neck.r, PROPS.neck.r, PROPS.neck.h, 10),
    new THREE.MeshStandardMaterial({ color: 0xd2b48c, metalness: 0.2, roughness: 0.7 })
  );
  neck.add(neckMesh);
  neck.position.y = PROPS.neck.y - PROPS.torso.y;
  torso.add(neck);

  const headMesh = new THREE.Mesh(
    new THREE.SphereGeometry(PROPS.head.r, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xd2b48c, metalness: 0.2, roughness: 0.7 })
  );
  head.add(headMesh);
  head.position.y = PROPS.head.y - PROPS.neck.y;
  neck.add(head);

  // Arms (left/right)
  const upperArms = {}, lowerArms = {}, hands = {};
  for (let side of [-1, 1]) {
    const sideName = side === 1 ? 'right' : 'left';
    // Upper arm
    const upperArm = new THREE.Group();
    const upperArmMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(PROPS.upperArm.r, PROPS.upperArm.r, PROPS.upperArm.h, 10),
      new THREE.MeshStandardMaterial({ color: 0xd2b48c, metalness: 0.2, roughness: 0.7 })
    );
    upperArm.add(upperArmMesh);
    upperArm.position.set(PROPS.upperArm.x * side, PROPS.upperArm.y - PROPS.torso.y, 0);
    upperArm.rotation.z = side * Math.PI/12;
    torso.add(upperArm);
    upperArms[sideName] = upperArm;
    // Lower arm
    const lowerArm = new THREE.Group();
    const lowerArmMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(PROPS.lowerArm.r, PROPS.lowerArm.r, PROPS.lowerArm.h, 10),
      new THREE.MeshStandardMaterial({ color: 0xd2b48c, metalness: 0.2, roughness: 0.7 })
    );
    lowerArm.add(lowerArmMesh);
    lowerArm.position.set(0, PROPS.lowerArm.y - PROPS.upperArm.y, 0);
    lowerArm.rotation.z = side * Math.PI/10;
    upperArm.add(lowerArm);
    lowerArms[sideName] = lowerArm;
    // Hand
    const hand = new THREE.Group();
    const handMesh = new THREE.Mesh(
      new THREE.SphereGeometry(PROPS.hand.r, 10, 10),
      new THREE.MeshStandardMaterial({ color: 0xd2b48c, metalness: 0.2, roughness: 0.7 })
    );
    hand.add(handMesh);
    hand.position.set(0, PROPS.hand.y - PROPS.lowerArm.y, 0);
    lowerArm.add(hand);
    hands[sideName] = hand;
  }

  // Legs (left/right)
  const upperLegs = {}, lowerLegs = {}, feet = {};
  for (let side of [-1, 1]) {
    const sideName = side === 1 ? 'right' : 'left';
    // Upper leg
    const upperLeg = new THREE.Group();
    const upperLegMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(PROPS.upperLeg.r, PROPS.upperLeg.r, PROPS.upperLeg.h, 10),
      new THREE.MeshStandardMaterial({ color: 0xd2b48c, metalness: 0.2, roughness: 0.7 })
    );
    upperLeg.add(upperLegMesh);
    upperLeg.position.set(PROPS.upperLeg.x * side, PROPS.upperLeg.y - PROPS.pelvis.y, 0);
    pelvis.add(upperLeg);
    upperLegs[sideName] = upperLeg;
    // Lower leg
    const lowerLeg = new THREE.Group();
    const lowerLegMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(PROPS.lowerLeg.r, PROPS.lowerLeg.r, PROPS.lowerLeg.h, 10),
      new THREE.MeshStandardMaterial({ color: 0xd2b48c, metalness: 0.2, roughness: 0.7 })
    );
    lowerLeg.add(lowerLegMesh);
    lowerLeg.position.set(0, PROPS.lowerLeg.y - PROPS.upperLeg.y, 0);
    upperLeg.add(lowerLeg);
    lowerLegs[sideName] = lowerLeg;
    // Foot
    const foot = new THREE.Group();
    const footMesh = new THREE.Mesh(
      new THREE.BoxGeometry(PROPS.foot.w, PROPS.foot.h, PROPS.foot.d),
      new THREE.MeshStandardMaterial({ color: 0xd2b48c, metalness: 0.2, roughness: 0.7 })
    );
    foot.add(footMesh);
    foot.position.set(0, PROPS.foot.y - PROPS.lowerLeg.y, PROPS.foot.z);
    lowerLeg.add(foot);
    feet[sideName] = foot;
  }

  // Return the root group and a dictionary of named bones/groups
  const skeleton = pelvis;
  const bones = {
    pelvis, abdomen, torso, neck, head,
    upperArms, lowerArms, hands,
    upperLegs, lowerLegs, feet
  };
  return { skeleton, bones };
}

// Helper: Attach a mesh to a named bone/group
export function attachToBone(bones, boneName, mesh) {
  // boneName can be e.g. 'head', 'hands.right', 'upperArms.left', etc.
  const parts = boneName.split('.');
  let bone = bones;
  for (const part of parts) {
    bone = bone[part];
    if (!bone) return false;
  }
  if (bone.add) {
    bone.add(mesh);
    return true;
  }
  return false;
}

// Helper: Pose the skeleton by rotating bones
export function poseHumanoid(bones, poseDict) {
  // poseDict: { boneName: { x, y, z } }
  for (const boneName in poseDict) {
    const rot = poseDict[boneName];
    // Support dot notation for nested bones
    const parts = boneName.split('.');
    let bone = bones;
    for (const part of parts) {
      bone = bone[part];
      if (!bone) break;
    }
    if (bone && bone.rotation) {
      if (rot.x !== undefined) bone.rotation.x = rot.x;
      if (rot.y !== undefined) bone.rotation.y = rot.y;
      if (rot.z !== undefined) bone.rotation.z = rot.z;
    }
  }
} 