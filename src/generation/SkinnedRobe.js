import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';

// Generate a skinned robe that covers from the neck down, using mannequin bones for alignment
export function generateSkinnedRobe(manBones) {
  // Robe dimensions
  const height = 0.55; // reduced height to avoid covering head
  const radiusTop = 0.14; // shoulder width
  const radiusWaist = 0.11; // waist taper
  const radiusBottom = 0.25; // increased flare at bottom to prevent leg clipping
  const heightSegments = 12;
  const radialSegments = 20;

  // Create a robe shape: top (shoulders), mid (waist), bottom (flare)
  const geo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments, true);

  // Taper waist (about 1/3 from top)
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    // Waist zone: 1/3 from top
    if (y < height/2 - height/3 && y > -height/2 + height/3) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const r = Math.sqrt(x*x + z*z);
      const scale = radiusWaist / r;
      pos.setX(i, x * scale);
      pos.setZ(i, z * scale);
    }
  }
  pos.needsUpdate = true;

  // Bones: chest, abdomen, left leg, right leg
  const bones = [];
  const chest = new THREE.Bone();
  bones.push(chest);
  const abdomen = new THREE.Bone();
  abdomen.position.y = -height * 0.33; // about 1/3 down
  bones.push(abdomen);
  const leftLeg = new THREE.Bone();
  leftLeg.position.set(-0.12, -height/2, 0); // moved further left to account for thigh width
  bones.push(leftLeg);
  const rightLeg = new THREE.Bone();
  rightLeg.position.set(0.12, -height/2, 0); // moved further right to account for thigh width
  bones.push(rightLeg);
  chest.add(abdomen);
  abdomen.add(leftLeg);
  abdomen.add(rightLeg);

  // Skin indices/weights: improved to reduce clipping and create smoother deformation
  const skinIndices = [];
  const skinWeights = [];
  for (let i = 0; i < geo.attributes.position.count; i++) {
    const y = geo.attributes.position.getY(i);
    const x = geo.attributes.position.getX(i);
    const z = geo.attributes.position.getZ(i);
    
    // Calculate distance from center to determine leg influence
    const distanceFromCenter = Math.sqrt(x*x + z*z);
    const isNearLegs = distanceFromCenter > 0.08; // Threshold for leg area
    
    // Top section: mostly chest with some abdomen blend
    if (y > height/2 - 0.12) {
      skinIndices.push(0, 1, 0, 0);
      skinWeights.push(0.8, 0.2, 0, 0);
    } 
    // Upper mid: chest/abdomen blend
    else if (y > height/6) {
      skinIndices.push(0, 1, 0, 0);
      skinWeights.push(0.6, 0.4, 0, 0);
    } 
    // Waist area: mostly abdomen
    else if (y > -height/6) {
      skinIndices.push(1, 0, 0, 0);
      skinWeights.push(0.9, 0.1, 0, 0);
    } 
          // Lower mid: abdomen/legs blend with better leg separation (thigh area)
      else if (y > -height/2 + 0.15) {
        if (x < -0.08) { // Left leg area - wider threshold for thighs
          skinIndices.push(2, 1, 0, 0);
          skinWeights.push(0.85, 0.15, 0, 0);
        } else if (x > 0.08) { // Right leg area - wider threshold for thighs
          skinIndices.push(3, 1, 0, 0);
          skinWeights.push(0.85, 0.15, 0, 0);
        } else { // Center area - wider center zone
          skinIndices.push(1, 0, 0, 0);
          skinWeights.push(0.8, 0.2, 0, 0);
        }
      } 
      // Bottom: mostly legs with better separation
      else {
        if (x < -0.06) { // Left leg - wider threshold
          skinIndices.push(2, 1, 0, 0);
          skinWeights.push(0.95, 0.05, 0, 0);
        } else if (x > 0.06) { // Right leg - wider threshold
          skinIndices.push(3, 1, 0, 0);
          skinWeights.push(0.95, 0.05, 0, 0);
        } else { // Center between legs - wider center zone
          skinIndices.push(1, 0, 0, 0);
          skinWeights.push(0.7, 0.3, 0, 0);
        }
      }
  }
  geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices, 4));
  geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4));

  // Material
  const mat = new THREE.MeshStandardMaterial({ color: 0x7c3aed, metalness: 0.3, roughness: 0.7, side: THREE.DoubleSide, skinning: true });
  // Skinned mesh
  const mesh = new THREE.SkinnedMesh(geo, mat);
  const skeleton = new THREE.Skeleton(bones);
  mesh.add(chest);
  mesh.bind(skeleton);
  

  // Position the robe to start at the shoulders (below the neck)
  // The robe will be attached to the torso bone, so position relative to torso
  // The robe position is controlled by the bone positions, not mesh.position
  // The chest bone is positioned at -0.25 to start the robe at neck/shoulders level

  // Attach robe bones to mannequin bones
  manBones.torso.add(chest);
  manBones.abdomen.add(abdomen);
  manBones.upperLegs.left.add(leftLeg);
  manBones.upperLegs.right.add(rightLeg);

  return { mesh, bones: { chest, abdomen, leftLeg, rightLeg } };
} 