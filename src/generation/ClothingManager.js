import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';

/**
 * ClothingManager - Handles clothing positioning, attachment, and animation
 * Uses character anatomy to position clothing properly without hardcoded values
 */
export class ClothingManager {
  constructor(character) {
    this.character = character;
    this.clothing = new Map(); // type -> { mesh, bones, attachmentPoint }
    this.clothingBones = new Map(); // clothing bone references for animation
  }

  /**
   * Add clothing to the character using anatomy-aware positioning
   */
  addClothing(type, clothingData) {
    if (this.clothing.has(type)) {
      this.removeClothing(type);
    }

    const clothing = this.createClothing(type, clothingData);
    const position = this.calculateClothingPosition(type, clothing);
    const attachmentPoint = this.getAttachmentPoint(type);
    
    // Position and attach the clothing
    if (type === 'robe') {
      // For robe skinned mesh, position the chest bone (now at center like zubon)
      clothing.bones.chest.position.y = position.y;
    } else if (type === 'zubon') {
      // For zubon skinned mesh, position the waist bone
      clothing.bones.waist.position.y = position.y;
    } else {
      // For regular meshes (hat, staff), position the mesh directly
      clothing.mesh.position.copy(position);
    }
    
    attachmentPoint.add(clothing.mesh);
    
    // Store for management
    this.clothing.set(type, {
      mesh: clothing.mesh,
      bones: clothing.bones,
      attachmentPoint: attachmentPoint,
      type: type
    });

    // Store bones for animation
    Object.values(clothing.bones).forEach(bone => {
      this.clothingBones.set(bone, { type, bone });
    });

    // Auto-hide body parts that would be covered by this clothing
    this.autoHideBodyParts(type);

    return clothing;
  }

  /**
   * Remove clothing from the character
   */
  removeClothing(type) {
    const clothing = this.clothing.get(type);
    if (clothing) {
      clothing.attachmentPoint.remove(clothing.mesh);
      
      // Remove bones from animation tracking
      Object.values(clothing.bones).forEach(bone => {
        this.clothingBones.delete(bone);
      });
      
      this.clothing.delete(type);
      
      // Auto-show body parts that were hidden by this clothing
      this.autoShowBodyParts(type);
    }
  }

  /**
   * Calculate clothing position based on character anatomy
   */
  calculateClothingPosition(type, clothing) {
    const characterBones = this.character.bones;
    
    switch (type) {
      case 'robe':
        // Position robe to start at the torso and cover down to feet
        const torsoOffset = characterBones.torso.position.y;
        // Position robe to start at torso level
        return new THREE.Vector3(0, torsoOffset, 0);
        
      case 'zubon':
        // Position zubon to start at the waist/abdomen
        const waistOffset = characterBones.abdomen.position.y;
        return new THREE.Vector3(0, waistOffset - 0.05, 0);
        
      case 'hat':
        // Position hat on top of head
        const headRadius = 0.11;
        return new THREE.Vector3(0, headRadius + 0.02 - 0.1, 0);
        
      case 'staff':
        // Position staff in hand
        return new THREE.Vector3(0, -0.18, 0.04);
        
      default:
        return new THREE.Vector3(0, 0, 0);
    }
  }

  /**
   * Get the appropriate attachment point for clothing type
   */
  getAttachmentPoint(type) {
    const characterBones = this.character.bones;
    
    switch (type) {
      case 'robe':
        return characterBones.torso;
      case 'zubon':
        return characterBones.abdomen;
      case 'hat':
        return characterBones.head;
      case 'staff':
        return characterBones.hands.right;
      default:
        return characterBones.torso;
    }
  }

  /**
   * Get world position of a bone
   */
  getBoneWorldPosition(bone) {
    const worldPosition = new THREE.Vector3();
    bone.getWorldPosition(worldPosition);
    return worldPosition;
  }

  /**
   * Create clothing mesh and bones based on type
   */
  createClothing(type, data) {
    switch (type) {
      case 'robe':
        return this.createRobe(data);
      case 'zubon':
        return this.createZubon(data);
      case 'hat':
        return this.createHat(data);
      case 'staff':
        return this.createStaff(data);
      default:
        throw new Error(`Unknown clothing type: ${type}`);
    }
  }

  /**
   * Create a robe with proper skinned mesh setup
   */
  createRobe(data = {}) {
    const height = data.height || 0.55;
    const radiusTop = data.radiusTop || 0.14;
    const radiusWaist = data.radiusWaist || 0.11;
    const radiusBottom = data.radiusBottom || 0.25; // increased to prevent leg clipping
    const color = data.color || 0x7c3aed;

    // Create geometry with waist tapering
    const geo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 20, 12, true);
    
    // Taper waist
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
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

    // Create bones for skinned mesh
    const bones = [];
    const chest = new THREE.Bone();
    chest.position.y = .25; // Position to start robe at neck/shoulders level
    bones.push(chest);
    
    const abdomen = new THREE.Bone();
    abdomen.position.y = -height / 3; // Position at lower third of robe
    bones.push(abdomen);
    
    const leftLeg = new THREE.Bone();
    leftLeg.position.set(-0.12, -height / 2, 0); // moved further left to account for thigh width
    bones.push(leftLeg);
    
    const rightLeg = new THREE.Bone();
    rightLeg.position.set(0.12, -height / 2, 0); // moved further right to account for thigh width
    bones.push(rightLeg);
    
    chest.add(abdomen);
    abdomen.add(leftLeg);
    abdomen.add(rightLeg);

    // Set up skinning weights
    this.setupRobeSkinning(geo, height);

    // Create skinned mesh
    const mat = new THREE.MeshStandardMaterial({ 
      color: color, 
      metalness: 0.3, 
      roughness: 0.7, 
      side: THREE.DoubleSide, 
      skinning: true 
    });
    
    const mesh = new THREE.SkinnedMesh(geo, mat);
    const skeleton = new THREE.Skeleton(bones);
    mesh.add(chest);
    mesh.bind(skeleton);

    // Attach robe bones to character bones
    this.character.bones.torso.add(chest);
    this.character.bones.abdomen.add(abdomen);
    this.character.bones.upperLegs.left.add(leftLeg);
    this.character.bones.upperLegs.right.add(rightLeg);

    return { 
      mesh, 
      bones: { chest, abdomen, leftLeg, rightLeg },
      height: height
    };
  }

  /**
   * Create zubon (pants) with proper skinned mesh setup
   */
  createZubon(data = {}) {
    const height = data.height || 0.35;
    const radiusTop = data.radiusTop || 0.12;
    const radiusWaist = data.radiusWaist || 0.10;
    const radiusBottom = data.radiusBottom || 0.08;
    const color = data.color || 0x2d3748;

    // Create geometry with waist tapering
    const geo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 20, 12, true);
    
    // Taper waist
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
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

    // Create bones for skinned mesh
    const bones = [];
    const waist = new THREE.Bone();
    waist.position.y = .3;
    bones.push(waist);
    
    const leftLeg = new THREE.Bone();
    leftLeg.position.set(-0.12, -height/2, 0); // moved further left to account for thigh width
    bones.push(leftLeg);
    
    const rightLeg = new THREE.Bone();
    rightLeg.position.set(0.12, -height/2, 0); // moved further right to account for thigh width
    bones.push(rightLeg);
    
    waist.add(leftLeg);
    waist.add(rightLeg);

    // Set up skinning weights
    this.setupZubonSkinning(geo, height);

    // Create skinned mesh
    const mat = new THREE.MeshStandardMaterial({ 
      color: color, 
      metalness: 0.1, 
      roughness: 0.8, 
      side: THREE.DoubleSide, 
      skinning: true 
    });
    
    const mesh = new THREE.SkinnedMesh(geo, mat);
    const skeleton = new THREE.Skeleton(bones);
    mesh.add(waist);
    mesh.bind(skeleton);
    
    // Position the mesh so it extends upward from the waist bone to cover the legs
    mesh.position.y = height / 2;

    // Attach zubon bones to character bones
    this.character.bones.abdomen.add(waist);
    this.character.bones.upperLegs.left.add(leftLeg);
    this.character.bones.upperLegs.right.add(rightLeg);

    return { 
      mesh, 
      bones: { waist, leftLeg, rightLeg },
      height: height
    };
  }

  /**
   * Set up skinning weights for robe - improved to reduce clipping
   */
  setupRobeSkinning(geo, height) {
    const skinIndices = [];
    const skinWeights = [];
    
    for (let i = 0; i < geo.attributes.position.count; i++) {
      const y = geo.attributes.position.getY(i);
      const x = geo.attributes.position.getX(i);
      const z = geo.attributes.position.getZ(i);
      
      // Calculate distance from center to determine leg influence
      const distanceFromCenter = Math.sqrt(x*x + z*z);
      
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
  }

  /**
   * Set up skinning weights for zubon - improved to reduce clipping
   */
  setupZubonSkinning(geo, height) {
    const skinIndices = [];
    const skinWeights = [];
    
    for (let i = 0; i < geo.attributes.position.count; i++) {
      const y = geo.attributes.position.getY(i);
      const x = geo.attributes.position.getX(i);
      const z = geo.attributes.position.getZ(i);
      
      // Calculate distance from center to determine leg influence
      const distanceFromCenter = Math.sqrt(x*x + z*z);
      
      // Top section: mostly waist
      if (y > height/2 - 0.08) {
        skinIndices.push(0, 0, 0, 0);
        skinWeights.push(0.9, 0.1, 0, 0);
      } 
      // Upper mid: waist/legs blend
      else if (y > height/6) {
        if (x < -0.03) { // Left leg area
          skinIndices.push(1, 0, 0, 0);
          skinWeights.push(0.6, 0.4, 0, 0);
        } else if (x > 0.03) { // Right leg area
          skinIndices.push(2, 0, 0, 0);
          skinWeights.push(0.6, 0.4, 0, 0);
        } else { // Center area
          skinIndices.push(0, 0, 0, 0);
          skinWeights.push(0.8, 0.2, 0, 0);
        }
      } 
      // Lower mid: more leg influence
      else if (y > -height/6) {
        if (x < -0.02) { // Left leg area
          skinIndices.push(1, 0, 0, 0);
          skinWeights.push(0.8, 0.2, 0, 0);
        } else if (x > 0.02) { // Right leg area
          skinIndices.push(2, 0, 0, 0);
          skinWeights.push(0.8, 0.2, 0, 0);
        } else { // Center area
          skinIndices.push(0, 0, 0, 0);
          skinWeights.push(0.5, 0.5, 0, 0);
        }
      } 
      // Bottom: mostly legs with better separation
      else {
        if (x < -0.01) { // Left leg
          skinIndices.push(1, 0, 0, 0);
          skinWeights.push(0.95, 0.05, 0, 0);
        } else if (x > 0.01) { // Right leg
          skinIndices.push(2, 0, 0, 0);
          skinWeights.push(0.95, 0.05, 0, 0);
        } else { // Center between legs
          skinIndices.push(0, 0, 0, 0);
          skinWeights.push(0.4, 0.6, 0, 0);
        }
      }
    }
    
    geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices, 4));
    geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4));
  }

  /**
   * Create a hat
   */
  createHat(data = {}) {
    const group = new THREE.Group();
    const color = data.color || 0x7c3aed;
    const brimColor = data.brimColor || 0xFFD700;

    const hatMesh = new THREE.Mesh(
      new THREE.ConeGeometry(0.13, 0.28, 16),
      new THREE.MeshStandardMaterial({ color: color, metalness: 0.3, roughness: 0.7 })
    );
    hatMesh.position.y = 0.19;
    group.add(hatMesh);

    const brimMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.16, 0.022, 18),
      new THREE.MeshStandardMaterial({ color: brimColor, metalness: 0.7, roughness: 0.3 })
    );
    brimMesh.position.y = 0.07;
    group.add(brimMesh);

    group.hatMesh = hatMesh; // for animation
    return { mesh: group, bones: {}, height: 0.28 };
  }

  /**
   * Create a staff
   */
  createStaff(data = {}) {
    const color = data.color || 0x8B5A2B;
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.022, 0.55, 10),
      new THREE.MeshStandardMaterial({ color: color, metalness: 0.2, roughness: 0.7 })
    );
    mesh.position.set(0, -0.18, 0.04);
    mesh.rotation.set(-Math.PI / 8, Math.PI / 12, Math.PI / 20);
    return { mesh, bones: {}, height: 0.55 };
  }

  /**
   * Animate clothing through bone manipulation (not direct mesh positioning)
   */
  animateClothing(animationType, time) {
    this.clothing.forEach((clothing, type) => {
      switch (type) {
        case 'robe':
          this.animateRobe(clothing, animationType, time);
          break;
        case 'hat':
          this.animateHat(clothing, animationType, time);
          break;
      }
    });
  }

  /**
   * Animate robe through bone rotation (not mesh position)
   */
  animateRobe(clothing, animationType, time) {
    if (animationType === 'walk') {
      // Animate the chest bone for sway
      clothing.bones.chest.rotation.z = 0.10 * Math.sin(time);
    } else {
      // Reset to idle
      clothing.bones.chest.rotation.z = 0;
    }
  }

  /**
   * Animate hat through bone rotation
   */
  animateHat(clothing, animationType, time) {
    if (animationType === 'walk' && clothing.mesh.hatMesh) {
      clothing.mesh.hatMesh.rotation.z = 0.03 * Math.sin(time - 0.2);
    } else if (clothing.mesh.hatMesh) {
      clothing.mesh.hatMesh.rotation.z = 0;
    }
  }

  /**
   * Get all clothing of a specific type
   */
  getClothing(type) {
    return this.clothing.get(type);
  }

  /**
   * Check if clothing is equipped
   */
  hasClothing(type) {
    return this.clothing.has(type);
  }

  /**
   * Auto-hide body parts that would be covered by clothing
   */
  autoHideBodyParts(type) {
    const characterBones = this.character.bones;
    
    switch (type) {
      case 'robe':
        // Hide torso, abdomen, pelvis, and legs when robe is equipped
        if (characterBones.torso.children[0]) characterBones.torso.children[0].visible = false;
        if (characterBones.abdomen.children[0]) characterBones.abdomen.children[0].visible = false;
        if (characterBones.pelvis.children[0]) characterBones.pelvis.children[0].visible = false;
        if (characterBones.upperLegs.left.children[0]) characterBones.upperLegs.left.children[0].visible = false;
        if (characterBones.upperLegs.right.children[0]) characterBones.upperLegs.right.children[0].visible = false;
        if (characterBones.lowerLegs.left.children[0]) characterBones.lowerLegs.left.children[0].visible = false;
        if (characterBones.lowerLegs.right.children[0]) characterBones.lowerLegs.right.children[0].visible = false;
        if (characterBones.feet.left.children[0]) characterBones.feet.left.children[0].visible = false;
        if (characterBones.feet.right.children[0]) characterBones.feet.right.children[0].visible = false;
        // Note: Hands remain visible as they might extend beyond robe sleeves
        break;
        
      case 'zubon':
        // Hide legs and feet when zubon is equipped
        if (characterBones.upperLegs.left.children[0]) characterBones.upperLegs.left.children[0].visible = false;
        if (characterBones.upperLegs.right.children[0]) characterBones.upperLegs.right.children[0].visible = false;
        if (characterBones.lowerLegs.left.children[0]) characterBones.lowerLegs.left.children[0].visible = false;
        if (characterBones.lowerLegs.right.children[0]) characterBones.lowerLegs.right.children[0].visible = false;
        if (characterBones.feet.left.children[0]) characterBones.feet.left.children[0].visible = false;
        if (characterBones.feet.right.children[0]) characterBones.feet.right.children[0].visible = false;
        break;
        
      case 'hat':
        // Hide head when hat is equipped (optional - some might want to see the head)
        // Uncomment the next line if you want to hide the head with hats
        // if (characterBones.head.children[0]) characterBones.head.children[0].visible = false;
        break;
    }
  }

  /**
   * Auto-show body parts that were hidden by clothing
   */
  autoShowBodyParts(type) {
    const characterBones = this.character.bones;
    
    switch (type) {
      case 'robe':
        // Show torso, abdomen, pelvis, and legs when robe is removed
        if (characterBones.torso.children[0]) characterBones.torso.children[0].visible = true;
        if (characterBones.abdomen.children[0]) characterBones.abdomen.children[0].visible = true;
        if (characterBones.pelvis.children[0]) characterBones.pelvis.children[0].visible = true;
        if (characterBones.upperLegs.left.children[0]) characterBones.upperLegs.left.children[0].visible = true;
        if (characterBones.upperLegs.right.children[0]) characterBones.upperLegs.right.children[0].visible = true;
        if (characterBones.lowerLegs.left.children[0]) characterBones.lowerLegs.left.children[0].visible = true;
        if (characterBones.lowerLegs.right.children[0]) characterBones.lowerLegs.right.children[0].visible = true;
        if (characterBones.feet.left.children[0]) characterBones.feet.left.children[0].visible = true;
        if (characterBones.feet.right.children[0]) characterBones.feet.right.children[0].visible = true;
        break;
        
      case 'zubon':
        // Show legs and feet when zubon is removed
        if (characterBones.upperLegs.left.children[0]) characterBones.upperLegs.left.children[0].visible = true;
        if (characterBones.upperLegs.right.children[0]) characterBones.upperLegs.right.children[0].visible = true;
        if (characterBones.lowerLegs.left.children[0]) characterBones.lowerLegs.left.children[0].visible = true;
        if (characterBones.lowerLegs.right.children[0]) characterBones.lowerLegs.right.children[0].visible = true;
        if (characterBones.feet.left.children[0]) characterBones.feet.left.children[0].visible = true;
        if (characterBones.feet.right.children[0]) characterBones.feet.right.children[0].visible = true;
        break;
        
      case 'hat':
        // Show head when hat is removed
        // if (characterBones.head.children[0]) characterBones.head.children[0].visible = true;
        break;
    }
  }
} 