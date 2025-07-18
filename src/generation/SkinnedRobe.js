import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';

// Generate a skinned robe that follows pelvis, abdomen, and legs
export function generateSkinnedRobe(manBones) {
  // Geometry: tighter, more segments
  const height = 0.36, radiusTop = 0.13, radiusBottom = 0.15; // less flare
  const geo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 16, 4, true);
  // Bones: pelvis, abdomen, left leg, right leg
  const bones = [];
  const pelvis = new THREE.Bone();
  pelvis.position.y = 0;
  bones.push(pelvis);
  const abdomen = new THREE.Bone();
  abdomen.position.y = -height * 0.18; // about 1/4 down
  bones.push(abdomen);
  const leftLeg = new THREE.Bone();
  leftLeg.position.set(-0.07, -height/2, 0);
  bones.push(leftLeg);
  const rightLeg = new THREE.Bone();
  rightLeg.position.set(0.07, -height/2, 0);
  bones.push(rightLeg);
  pelvis.add(abdomen);
  abdomen.add(leftLeg);
  abdomen.add(rightLeg);

  // Skin indices/weights: top row to pelvis, mid to abdomen, left/right bottom to left/right leg
  const skinIndices = [];
  const skinWeights = [];
  for (let i = 0; i < geo.attributes.position.count; i++) {
    const y = geo.attributes.position.getY(i);
    const x = geo.attributes.position.getX(i);
    if (y > height/2 - 0.05) {
      // Top: pelvis
      skinIndices.push(0, 0, 0, 0);
      skinWeights.push(1, 0, 0, 0);
    } else if (y > 0) {
      // Upper mid: blend pelvis/abdomen
      skinIndices.push(0, 1, 0, 0);
      skinWeights.push(0.5, 0.5, 0, 0);
    } else if (y > -height/2 + 0.05) {
      // Lower mid: abdomen
      skinIndices.push(1, 0, 0, 0);
      skinWeights.push(1, 0, 0, 0);
    } else if (x < 0) {
      // Bottom left: left leg
      skinIndices.push(2, 1, 0, 0);
      skinWeights.push(0.7, 0.3, 0, 0);
    } else {
      // Bottom right: right leg
      skinIndices.push(3, 1, 0, 0);
      skinWeights.push(0.7, 0.3, 0, 0);
    }
  }
  geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices, 4));
  geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4));

  // Material
  const mat = new THREE.MeshStandardMaterial({ color: 0x7c3aed, metalness: 0.3, roughness: 0.7, side: THREE.DoubleSide, skinning: true });
  // Skinned mesh
  const mesh = new THREE.SkinnedMesh(geo, mat);
  const skeleton = new THREE.Skeleton(bones);
  mesh.add(pelvis);
  mesh.bind(skeleton);
  // Offset mesh upward so top is at waist
  mesh.position.y = 0.10;
  // Attach robe bones to mannequin bones
  manBones.pelvis.add(pelvis);
  manBones.abdomen.add(abdomen);
  manBones.upperLegs.left.add(leftLeg);
  manBones.upperLegs.right.add(rightLeg);

  return { mesh, bones: { pelvis, abdomen, leftLeg, rightLeg } };
} 