// ============================================================================
// ADVANCED TROOP GENERATION SYSTEM
// ============================================================================

import { getTroopVariants } from './gameDataManager.js';

// --- Custom 3D Troop Generation ---
export function generateCustomTroopMesh(prompt, isPlayer, troopColor, forcedBodyType, forcedSubtype) {
  if (typeof prompt !== 'string') {
    prompt = String(prompt || '');
  }
  const lowerPrompt = prompt.toLowerCase();

  // --- ROLE/CLASS DETECTION ---
  let role = 'melee';
  if (lowerPrompt.match(/(bow|archer|crossbow|gun|ranged|sniper|shooter)/)) role = 'ranged';
  else if (lowerPrompt.match(/(magic|mage|wizard|sorcerer|spell|shaman|witch|warlock)/)) role = 'magic';
  else if (lowerPrompt.match(/(shield|tank|defender|paladin|guard|protector)/)) role = 'defender';
  else if (lowerPrompt.match(/(mounted|rider|cavalry|horse|beast)/)) role = 'mounted';
  else if (lowerPrompt.match(/(fly|wing|dragon|griffin|bird|flying|angel)/)) role = 'flying';
  else if (lowerPrompt.match(/(spider|insect|bug|arachnid|alien|mantis|scorpion)/)) role = 'insectoid';

  // --- BODY TYPE & SUBTYPE SELECTION ---
  let bodyType = forcedBodyType || 'biped';
  let subtype = forcedSubtype || 'default';

  // Define possible body types and subtypes
  const BODY_TYPES = ['biped', 'quadruped', 'flying', 'mounted', 'insectoid'];
  const SUBTYPES = {
    biped: ['default', 'orc', 'goblin', 'skeleton', 'knight', 'samurai', 'barbarian'],
    quadruped: ['beast', 'lizard', 'wolf', 'centaur', 'lion', 'tiger', 'boar'],
    flying: ['default', 'angelic', 'draconic', 'griffin', 'bat', 'bird', 'insectoid'],
    mounted: ['horse', 'beast', 'lizard', 'boar', 'raptor'],
    insectoid: ['ant', 'spider', 'mantis', 'scorpion', 'beetle', 'wasp']
  };

  if (!forcedBodyType || !forcedSubtype) {
    if (role === 'mounted') {
      bodyType = 'mounted';
      if (lowerPrompt.match(/(lizard|wolf|beast|boar|raptor)/)) {
        subtype = lowerPrompt.match(/(lizard)/) ? 'lizard' : lowerPrompt.match(/(wolf)/) ? 'wolf' : lowerPrompt.match(/(boar)/) ? 'boar' : lowerPrompt.match(/(raptor)/) ? 'raptor' : 'beast';
      } else {
        subtype = 'horse';
      }
    } else if (role === 'flying') {
      bodyType = 'flying';
      if (lowerPrompt.match(/(angel|feather)/)) subtype = 'angelic';
      else if (lowerPrompt.match(/(dragon|bat|draconic)/)) subtype = 'draconic';
      else if (lowerPrompt.match(/(griffin)/)) subtype = 'griffin';
      else if (lowerPrompt.match(/(bird)/)) subtype = 'bird';
      else if (lowerPrompt.match(/(insect|bug|bee|wasp)/)) subtype = 'insectoid';
      else subtype = 'default';
    } else if (role === 'insectoid') {
      bodyType = 'insectoid';
      if (lowerPrompt.match(/(spider)/)) subtype = 'spider';
      else if (lowerPrompt.match(/(mantis)/)) subtype = 'mantis';
      else if (lowerPrompt.match(/(scorpion)/)) subtype = 'scorpion';
      else if (lowerPrompt.match(/(beetle)/)) subtype = 'beetle';
      else if (lowerPrompt.match(/(wasp)/)) subtype = 'wasp';
      else subtype = 'ant';
    } else if (role === 'mounted' || lowerPrompt.match(/(centaur)/)) {
      bodyType = 'quadruped';
      subtype = 'centaur';
    } else if (lowerPrompt.match(/(lizard|wolf|beast|quadruped|lion|tiger|boar)/)) {
      bodyType = 'quadruped';
      if (lowerPrompt.match(/(lizard)/)) subtype = 'lizard';
      else if (lowerPrompt.match(/(wolf)/)) subtype = 'wolf';
      else if (lowerPrompt.match(/(lion)/)) subtype = 'lion';
      else if (lowerPrompt.match(/(tiger)/)) subtype = 'tiger';
      else if (lowerPrompt.match(/(boar)/)) subtype = 'boar';
      else subtype = 'beast';
    } else if (!forcedBodyType && !forcedSubtype) {
      // No keyword: pick random body type and subtype
      const randomBodyType = BODY_TYPES[Math.floor(Math.random() * BODY_TYPES.length)];
      bodyType = randomBodyType;
      const subtypesForType = SUBTYPES[randomBodyType];
      subtype = subtypesForType[Math.floor(Math.random() * subtypesForType.length)];
    }
  }

  // --- DEBUG LOGGING ---
  console.log('[TroopGen] Prompt:', prompt, '| Role:', role, '| BodyType:', bodyType, '| Subtype:', subtype);

  // --- MATERIALS & COLOR CUES ---
  let mainColor = troopColor !== undefined ? troopColor : (isPlayer ? 0x1da1f2 : 0xff5e62);
  if (role === 'magic') mainColor = 0x8e54e9;
  else if (role === 'ranged') mainColor = 0x22ff22;
  else if (role === 'defender') mainColor = 0xffd700;
  else if (role === 'insectoid') mainColor = 0x4e9a06;
  else if (role === 'mounted') mainColor = 0x7c532f;
  const colorVariation = Math.random() * 0.3 - 0.15;
  const color = new THREE.Color(mainColor);
  color.offsetHSL(colorVariation, 0, 0);
  const skinMaterial = new THREE.MeshStandardMaterial({ color: color.getHex(), roughness: 0.5, metalness: 0.1 });
  const armorMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.7, metalness: 0.4 });
  const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8, metalness: 0.2 });
  const accentMaterial = new THREE.MeshStandardMaterial({ color: 0x00e0ff, roughness: 0.3, metalness: 0.7, emissive: 0x00e0ff, emissiveIntensity: 0.2 });
  const clothMaterial = new THREE.MeshStandardMaterial({ color: 0x7c532f, roughness: 0.9, metalness: 0.05 });
  const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.8 });
  const greenMaterial = new THREE.MeshStandardMaterial({ color: 0x22ff22, roughness: 0.5, metalness: 0.2 });

  // --- BODY GENERATION ---
  let group;
  if (bodyType === 'biped') {
    group = generateBipedTroopMesh(lowerPrompt, role, subtype, skinMaterial, armorMaterial, darkMaterial, accentMaterial, clothMaterial, goldMaterial);
  } else if (bodyType === 'quadruped') {
    group = generateQuadrupedTroopMesh(lowerPrompt, role, subtype, skinMaterial, armorMaterial, darkMaterial, accentMaterial, clothMaterial, goldMaterial);
  } else if (bodyType === 'flying') {
    group = generateFlyingTroopMesh(lowerPrompt, role, subtype, skinMaterial, armorMaterial, darkMaterial, accentMaterial, clothMaterial, goldMaterial);
  } else if (bodyType === 'mounted') {
    group = generateMountedTroopMesh(lowerPrompt, role, subtype, skinMaterial, armorMaterial, darkMaterial, accentMaterial, clothMaterial, goldMaterial);
  } else if (bodyType === 'insectoid') {
    group = generateInsectoidTroopMesh(lowerPrompt, role, subtype, skinMaterial, armorMaterial, darkMaterial, accentMaterial, clothMaterial, greenMaterial);
  } else {
    // Fallback: always use full biped mesh for unknown types
    console.warn('[TroopGen] Unknown bodyType:', bodyType, 'for prompt:', prompt, '| Using biped mesh as fallback.');
    group = generateBipedTroopMesh(lowerPrompt, role, 'default', skinMaterial, armorMaterial, darkMaterial, accentMaterial, clothMaterial, goldMaterial);
  }

  // Measure and log fidelity metrics
  measureTroopFidelity(group, prompt, bodyType, subtype);

  // Return both the mesh and the chosen bodyType/subtype for saving
  return { mesh: group, bodyType, subtype };
}

// (Implementations for generateBipedTroopMesh, generateQuadrupedTroopMesh, generateFlyingTroopMesh, generateMountedTroopMesh, generateInsectoidTroopMesh follow, each with subtypes, role-based weapons/equipment, and visual cues.)

// --- BIPED TROOP ---
function generateBipedTroopMesh(lowerPrompt, role, subtype, skinMaterial, armorMaterial, darkMaterial, accentMaterial, clothMaterial, goldMaterial) {
  const group = new THREE.Group();
  
  // === HIGH FIDELITY BODY PARTS ===
  // Torso (high segment count for smoothness)
  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.15, 0.45, 32, 8), // Increased segments
    skinMaterial
  );
  torso.position.y = 0.25;
  torso.castShadow = true;
  group.add(torso);

  // Chest plate (separate from torso for detail)
  const chestPlate = new THREE.Mesh(
    new THREE.CylinderGeometry(0.135, 0.155, 0.25, 32, 4),
    armorMaterial
  );
  chestPlate.position.y = 0.35;
  group.add(chestPlate);

  // Shoulder pads
  for (let i = -1; i <= 1; i += 2) {
    const shoulderPad = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 16, 16),
      armorMaterial
    );
    shoulderPad.position.set(0.18 * i, 0.45, 0);
    group.add(shoulderPad);
  }

  // Head (high segment count)
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 32, 32), // Increased segments
    skinMaterial
  );
  head.position.y = 0.55;
  group.add(head);
  
  // === DETAILED FACIAL FEATURES ===
  // Eyes (with detailed structure)
  for (let i = -1; i <= 1; i += 2) {
    // Eye socket
    const eyeSocket = new THREE.Mesh(
      new THREE.SphereGeometry(0.025, 16, 16),
      darkMaterial
    );
    eyeSocket.position.set(0.08 * i, 0.58, 0.1);
    group.add(eyeSocket);
    
    // Eye white
    const eyeWhite = new THREE.Mesh(
      new THREE.SphereGeometry(0.02, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 })
    );
    eyeWhite.position.set(0.08 * i, 0.58, 0.105);
    group.add(eyeWhite);
    
    // Pupil
    const pupil = new THREE.Mesh(
      new THREE.SphereGeometry(0.008, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.1 })
    );
    pupil.position.set(0.08 * i, 0.58, 0.115);
    group.add(pupil);
    
    // Eyelid
    const eyelid = new THREE.Mesh(
      new THREE.TorusGeometry(0.022, 0.003, 8, 16),
      skinMaterial
    );
    eyelid.position.set(0.08 * i, 0.58, 0.11);
    eyelid.rotation.x = Math.PI / 2;
    group.add(eyelid);
  }

  // Nose (detailed)
  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(0.015, 0.04, 16),
    skinMaterial
  );
  nose.position.set(0, 0.56, 0.15);
  nose.rotation.x = Math.PI / 2;
  group.add(nose);

  // Mouth (detailed)
  const mouth = new THREE.Mesh(
    new THREE.TorusGeometry(0.025, 0.008, 8, 16),
    darkMaterial
  );
  mouth.position.set(0, 0.52, 0.12);
  mouth.rotation.x = Math.PI / 2;
  group.add(mouth);

  // Ears (detailed)
  for (let i = -1; i <= 1; i += 2) {
    const ear = new THREE.Mesh(
      new THREE.ConeGeometry(0.02, 0.06, 16),
      skinMaterial
    );
    ear.position.set(0.13 * i, 0.55, 0);
    ear.rotation.z = i === -1 ? Math.PI / 6 : -Math.PI / 6;
    group.add(ear);
    
    // Inner ear
    const innerEar = new THREE.Mesh(
      new THREE.ConeGeometry(0.012, 0.04, 12),
      darkMaterial
    );
    innerEar.position.set(0.13 * i, 0.55, 0);
    innerEar.rotation.z = i === -1 ? Math.PI / 6 : -Math.PI / 6;
    group.add(innerEar);
  }

  // === DETAILED LIMBS ===
  // Arms with detailed structure
  let leftArm, rightArm, leftForearm, rightForearm, leftHand, rightHand;
  if (role === 'ranged') {
    // Upper arms
    leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.15, 24), skinMaterial);
    leftArm.position.set(-0.16, 0.36, 0.05);
    leftArm.rotation.z = Math.PI / 2.5;
    group.add(leftArm);
    rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.15, 24), skinMaterial);
    rightArm.position.set(0.16, 0.36, 0.05);
    rightArm.rotation.z = -Math.PI / 2.5;
    group.add(rightArm);
    
    // Forearms
    leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.12, 20), skinMaterial);
    leftForearm.position.set(-0.22, 0.25, 0.08);
    leftForearm.rotation.z = Math.PI / 2.2;
    group.add(leftForearm);
    rightForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.12, 20), skinMaterial);
    rightForearm.position.set(0.22, 0.25, 0.08);
    rightForearm.rotation.z = -Math.PI / 2.2;
    group.add(rightForearm);
    
    // Hands (detailed)
    leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.035, 20, 20), skinMaterial);
    leftHand.position.set(-0.28, 0.16, 0.1);
    group.add(leftHand);
    rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.035, 20, 20), skinMaterial);
    rightHand.position.set(0.28, 0.16, 0.1);
    group.add(rightHand);
    
    // Fingers
    for (let i = 0; i < 4; i++) {
      const leftFinger = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.006, 0.025, 8),
        skinMaterial
      );
      leftFinger.position.set(-0.28 + (i - 1.5) * 0.015, 0.14, 0.12);
      leftFinger.rotation.x = Math.PI / 6;
      group.add(leftFinger);
      
      const rightFinger = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.006, 0.025, 8),
        skinMaterial
      );
      rightFinger.position.set(0.28 + (i - 1.5) * 0.015, 0.14, 0.12);
      rightFinger.rotation.x = Math.PI / 6;
      group.add(rightFinger);
    }
  } else if (role === 'magic') {
    // Staff pose (right hand forward)
    leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.15, 24), skinMaterial);
    leftArm.position.set(-0.16, 0.36, 0);
    leftArm.rotation.z = Math.PI / 4;
    group.add(leftArm);
    rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.15, 24), skinMaterial);
    rightArm.position.set(0.16, 0.36, 0.12);
    rightArm.rotation.z = -Math.PI / 8;
    group.add(rightArm);
    
    // Forearms
    leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.12, 20), skinMaterial);
    leftForearm.position.set(-0.22, 0.25, 0.03);
    leftForearm.rotation.z = Math.PI / 3.5;
    group.add(leftForearm);
    rightForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.12, 20), skinMaterial);
    rightForearm.position.set(0.22, 0.25, 0.15);
    rightForearm.rotation.z = -Math.PI / 6;
    group.add(rightForearm);
    
    // Hands
    leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.035, 20, 20), skinMaterial);
    leftHand.position.set(-0.28, 0.16, 0.05);
    group.add(leftHand);
    rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.035, 20, 20), skinMaterial);
    rightHand.position.set(0.28, 0.16, 0.19);
    group.add(rightHand);
  } else if (role === 'defender') {
    // Shield pose (left arm forward)
    leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.15, 24), skinMaterial);
    leftArm.position.set(-0.16, 0.36, 0.12);
    leftArm.rotation.z = Math.PI / 8;
    group.add(leftArm);
    rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.15, 24), skinMaterial);
    rightArm.position.set(0.16, 0.36, 0);
    rightArm.rotation.z = -Math.PI / 4;
    group.add(rightArm);
    
    // Forearms
    leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.12, 20), skinMaterial);
    leftForearm.position.set(-0.22, 0.25, 0.17);
    leftForearm.rotation.z = Math.PI / 6;
    group.add(leftForearm);
    rightForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.12, 20), skinMaterial);
    rightForearm.position.set(0.22, 0.25, 0.03);
    rightForearm.rotation.z = -Math.PI / 3.5;
    group.add(rightForearm);
    
    // Hands
    leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.035, 20, 20), skinMaterial);
    leftHand.position.set(-0.28, 0.16, 0.22);
    group.add(leftHand);
    rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.035, 20, 20), skinMaterial);
    rightHand.position.set(0.28, 0.16, 0.05);
    group.add(rightHand);
  } else {
    // Melee/other: sword pose (right hand forward)
    leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.15, 24), skinMaterial);
    leftArm.position.set(-0.16, 0.36, 0);
    leftArm.rotation.z = Math.PI / 4;
    group.add(leftArm);
    rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.15, 24), skinMaterial);
    rightArm.position.set(0.16, 0.36, 0.12);
    rightArm.rotation.z = -Math.PI / 8;
    group.add(rightArm);
    
    // Forearms
    leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.12, 20), skinMaterial);
    leftForearm.position.set(-0.22, 0.25, 0.03);
    leftForearm.rotation.z = Math.PI / 3.5;
    group.add(leftForearm);
    rightForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.12, 20), skinMaterial);
    rightForearm.position.set(0.22, 0.25, 0.15);
    rightForearm.rotation.z = -Math.PI / 6;
    group.add(rightForearm);
    
    // Hands
    leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.035, 20, 20), skinMaterial);
    leftHand.position.set(-0.28, 0.16, 0.05);
    group.add(leftHand);
    rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.035, 20, 20), skinMaterial);
    rightHand.position.set(0.28, 0.16, 0.19);
    group.add(rightHand);
  }

  // === DETAILED LEGS ===
  for (let i = -1; i <= 1; i += 2) {
    // Upper leg (thigh)
    const upperLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.22, 24), skinMaterial);
    upperLeg.position.set(0.07 * i, 0.08, 0);
    upperLeg.rotation.x = Math.PI / 16;
    group.add(upperLeg);
    
    // Knee cap
    const kneeCap = new THREE.Mesh(new THREE.SphereGeometry(0.025, 16, 16), skinMaterial);
    kneeCap.position.set(0.07 * i, -0.03, 0.02);
    group.add(kneeCap);
    
    // Lower leg (calf)
    const lowerLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.18, 20), skinMaterial);
    lowerLeg.position.set(0.07 * i, -0.08, 0.03);
    lowerLeg.rotation.x = Math.PI / 10;
    group.add(lowerLeg);
    
    // Ankle
    const ankle = new THREE.Mesh(new THREE.SphereGeometry(0.02, 12, 12), skinMaterial);
    ankle.position.set(0.07 * i, -0.15, 0.04);
    group.add(ankle);
    
    // Foot (detailed)
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, 0.12), skinMaterial);
    foot.position.set(0.07 * i, -0.17, 0.08);
    group.add(foot);
    
    // Toes
    for (let j = 0; j < 5; j++) {
      const toe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.006, 0.02, 8),
        skinMaterial
      );
      toe.position.set(0.07 * i + (j - 2) * 0.012, -0.17, 0.14);
      toe.rotation.x = Math.PI / 6;
      group.add(toe);
    }
  }

  // === DETAILED ACCESSORIES ===
  // Loincloth (detailed)
  const loincloth = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.15, 24), clothMaterial);
  loincloth.position.set(0, 0.08, 0.09);
  loincloth.rotation.x = Math.PI;
  group.add(loincloth);
  
  // Belt (detailed)
  const belt = new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.015, 12, 32), darkMaterial);
  belt.position.set(0, 0.18, 0);
  belt.rotation.x = Math.PI / 2;
  group.add(belt);
  
  // Belt buckle
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.02), goldMaterial);
  buckle.position.set(0, 0.18, 0.01);
  group.add(buckle);
  
  // Armbands (detailed)
  for (let i = -1; i <= 1; i += 2) {
    const armband = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.01, 12, 24), accentMaterial);
    armband.position.set(0.19 * i, 0.29, 0);
    armband.rotation.y = Math.PI / 2;
    group.add(armband);
    
    // Armband decoration
    const decoration = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 8), goldMaterial);
    decoration.position.set(0.19 * i, 0.29, 0.035);
    group.add(decoration);
  }

  // === ROLE-SPECIFIC WEAPONS & EQUIPMENT (ENHANCED) ===
  if (role === 'ranged') {
    // Large bow (detailed)
    const bow = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.015, 12, 48, Math.PI), darkMaterial);
    bow.position.set(0.18, 0.23, 0.13);
    bow.rotation.z = Math.PI / 2;
    group.add(bow);
    
    // Bow string
    const bowString = new THREE.Mesh(new THREE.CylinderGeometry(0.001, 0.001, 0.4, 8), darkMaterial);
    bowString.position.set(0.18, 0.23, 0.13);
    bowString.rotation.z = Math.PI / 2;
    group.add(bowString);
    
    // Quiver (detailed)
    const quiver = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.2, 16), clothMaterial);
    quiver.position.set(-0.12, 0.32, -0.13);
    quiver.rotation.x = Math.PI / 4;
    group.add(quiver);
    
    // Arrows in quiver
    for (let i = 0; i < 5; i++) {
      const arrow = new THREE.Mesh(new THREE.CylinderGeometry(0.002, 0.002, 0.15, 8), darkMaterial);
      arrow.position.set(-0.12, 0.32 + i * 0.02, -0.13);
      arrow.rotation.x = Math.PI / 4;
      group.add(arrow);
    }
  } else if (role === 'magic') {
    // Large staff (detailed)
    const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 16), darkMaterial);
    staff.position.set(0.23, 0.18, 0.17);
    group.add(staff);
    
    // Staff orb (detailed)
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.04, 24, 24), accentMaterial);
    orb.position.set(0.23, 0.4, 0.17);
    group.add(orb);
    
    // Staff gem
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.015), goldMaterial);
    gem.position.set(0.23, 0.4, 0.21);
    group.add(gem);
    
    // Robe (detailed)
    const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.25, 32), clothMaterial);
    robe.position.y = 0.08;
    group.add(robe);
    
    // Robe trim
    const robeTrim = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.02, 8, 32), goldMaterial);
    robeTrim.position.y = 0.2;
    robeTrim.rotation.x = Math.PI / 2;
    group.add(robeTrim);
    
    // Magic aura (enhanced)
    const aura = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 24, 24),
      new THREE.MeshStandardMaterial({ color: 0x8e54e9, transparent: true, opacity: 0.15, emissive: 0x8e54e9, emissiveIntensity: 0.6 })
    );
    aura.position.set(0, 0.25, 0);
    group.add(aura);
  } else if (role === 'defender') {
    // Large shield (detailed)
    const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 32), goldMaterial);
    shield.position.set(-0.26, 0.18, 0.17);
    shield.rotation.x = Math.PI / 2;
    group.add(shield);
    
    // Shield boss
    const shieldBoss = new THREE.Mesh(new THREE.SphereGeometry(0.025, 16, 16), goldMaterial);
    shieldBoss.position.set(-0.26, 0.18, 0.2);
    group.add(shieldBoss);
    
    // One-handed sword (detailed)
    const sword = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.2, 0.015), armorMaterial);
    sword.position.set(0.26, 0.18, 0.17);
    group.add(sword);
    
    // Sword guard
    const swordGuard = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.015, 0.025), goldMaterial);
    swordGuard.position.set(0.26, 0.1, 0.17);
    group.add(swordGuard);
    
    // Sword pommel
    const swordPommel = new THREE.Mesh(new THREE.SphereGeometry(0.015, 12, 12), goldMaterial);
    swordPommel.position.set(0.26, 0.02, 0.17);
    group.add(swordPommel);
    
    // Heavy armor (detailed)
    const armor = new THREE.Mesh(new THREE.CylinderGeometry(0.145, 0.165, 0.2, 32), armorMaterial);
    armor.position.y = 0.32;
    group.add(armor);
    
    // Armor pauldrons
    for (let i = -1; i <= 1; i += 2) {
      const pauldron = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), armorMaterial);
      pauldron.position.set(0.2 * i, 0.45, 0);
      group.add(pauldron);
    }
  } else {
    // Melee: large sword/axe/spear (detailed)
    const sword = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.3, 0.02), armorMaterial);
    sword.position.set(0.26, 0.18, 0.17);
    group.add(sword);
    
    // Sword guard
    const swordGuard = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.03), goldMaterial);
    swordGuard.position.set(0.26, 0.06, 0.17);
    group.add(swordGuard);
    
    // Sword pommel
    const swordPommel = new THREE.Mesh(new THREE.SphereGeometry(0.02, 16, 16), goldMaterial);
    swordPommel.position.set(0.26, -0.02, 0.17);
    group.add(swordPommel);
    
    // Medium armor (detailed)
    const armor = new THREE.Mesh(new THREE.CylinderGeometry(0.145, 0.165, 0.15, 32), armorMaterial);
    armor.position.y = 0.28;
    group.add(armor);
  }

  // === ADDITIONAL DETAILS ===
  // Neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.08, 16), skinMaterial);
  neck.position.y = 0.47;
  group.add(neck);
  
  // Waist
  const waist = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.06, 20), skinMaterial);
  waist.position.y = 0.12;
  group.add(waist);

  // Standardize facing: ensure +Z is forward
  group.rotation.y = 0;
  return group;
}

// --- QUADRUPED TROOP ---
function generateQuadrupedTroopMesh(lowerPrompt, role, subtype, skinMaterial, armorMaterial, darkMaterial, accentMaterial, clothMaterial, goldMaterial) {
  const group = new THREE.Group();
  
  // === HIGH FIDELITY BODY PARTS ===
  // Body (elongated along +Z, high segment count)
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 0.5, 32, 8), skinMaterial);
  body.position.y = 0.18;
  body.rotation.x = Math.PI / 2; // Long axis along +Z
  group.add(body);
  
  // Chest plate (separate armor piece)
  const chestPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.165, 0.25, 32, 4), armorMaterial);
  chestPlate.position.y = 0.18;
  chestPlate.rotation.x = Math.PI / 2;
  group.add(chestPlate);
  
  // Head (high segment count)
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 28, 28), skinMaterial);
  head.position.set(0, 0.28, 0.28); // In front (+Z)
  group.add(head);
  
  // === DETAILED FACIAL FEATURES ===
  // Eyes (detailed)
  for (let i = -1; i <= 1; i += 2) {
    // Eye socket
    const eyeSocket = new THREE.Mesh(new THREE.SphereGeometry(0.02, 16, 16), darkMaterial);
    eyeSocket.position.set(0.06 * i, 0.32, 0.34);
    group.add(eyeSocket);
    
    // Eye white
    const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.016, 16, 16), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 }));
    eyeWhite.position.set(0.06 * i, 0.32, 0.345);
    group.add(eyeWhite);
    
    // Pupil
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.006, 12, 12), new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.1 }));
    pupil.position.set(0.06 * i, 0.32, 0.355);
    group.add(pupil);
  }
  
  // Nose (detailed)
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.05, 16), skinMaterial);
  nose.position.set(0, 0.3, 0.36);
  nose.rotation.x = Math.PI / 2;
  group.add(nose);
  
  // Mouth (detailed)
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.006, 8, 16), darkMaterial);
  mouth.position.set(0, 0.28, 0.38);
  mouth.rotation.x = Math.PI / 2;
  group.add(mouth);
  
  // === DETAILED LEGS ===
  for (let i = -1; i <= 1; i += 2) {
    for (let j = -1; j <= 1; j += 2) {
      // Upper leg (thigh)
      const upperLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.12, 20), skinMaterial);
      upperLeg.position.set(0.13 * i, 0.08, 0.09 * j);
      upperLeg.rotation.x = Math.PI / 12 * j;
      group.add(upperLeg);
      
      // Lower leg (calf)
      const lowerLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.1, 16), skinMaterial);
      lowerLeg.position.set(0.13 * i, -0.02, 0.09 * j);
      lowerLeg.rotation.x = Math.PI / 12 * j;
      group.add(lowerLeg);
      
      // Foot (detailed)
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.08), skinMaterial);
      foot.position.set(0.13 * i, -0.09, 0.09 * j);
      group.add(foot);
      
      // Toes
      for (let k = 0; k < 3; k++) {
        const toe = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.004, 0.015, 8), skinMaterial);
        toe.position.set(0.13 * i + (k - 1) * 0.015, -0.09, 0.09 * j + 0.04);
        toe.rotation.x = Math.PI / 6;
        group.add(toe);
      }
    }
  }
  
  // === DETAILED ACCESSORIES ===
  // Tail (detailed)
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.025, 0.2, 16), darkMaterial);
  tail.position.set(0, 0.18, -0.28); // Behind (-Z)
  tail.rotation.x = Math.PI / 4;
  group.add(tail);
  
  // Tail tip
  const tailTip = new THREE.Mesh(new THREE.SphereGeometry(0.025, 12, 12), darkMaterial);
  tailTip.position.set(0, 0.18, -0.38);
  group.add(tailTip);
  
  // Ears (detailed)
  for (let i = -1; i <= 1; i += 2) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.1, 16), skinMaterial);
    ear.position.set(0.06 * i, 0.36, 0.33);
    ear.rotation.z = i === -1 ? Math.PI / 6 : -Math.PI / 6;
    group.add(ear);
    
    // Inner ear
    const innerEar = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.08, 12), darkMaterial);
    innerEar.position.set(0.06 * i, 0.36, 0.33);
    innerEar.rotation.z = i === -1 ? Math.PI / 6 : -Math.PI / 6;
    group.add(innerEar);
  }
  
  // === SADDLE/BLANKET SYSTEM ===
  // Blanket (detailed)
  const blanket = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.2), clothMaterial);
  blanket.position.set(0, 0.18, 0);
  group.add(blanket);
  
  // Saddle straps
  for (let i = -1; i <= 1; i += 2) {
    const strap = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.08, 0.15), darkMaterial);
    strap.position.set(0.1 * i, 0.18, 0);
    group.add(strap);
  }
  
  // Saddle decoration
  const saddleDeco = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.01, 8, 24), goldMaterial);
  saddleDeco.position.set(0, 0.18, 0);
  saddleDeco.rotation.x = Math.PI / 2;
  group.add(saddleDeco);
  
  // === RIDER SYSTEM ===
  // Rider (optional, for 'mounted' prompt)
  if (lowerPrompt.includes('mounted') || lowerPrompt.includes('rider')) {
    const rider = generateBipedTroopMesh(lowerPrompt, role, subtype, skinMaterial, armorMaterial, darkMaterial, accentMaterial, clothMaterial, goldMaterial);
    rider.position.set(0, 0.32, 0);
    rider.scale.set(0.6, 0.6, 0.6);
    group.add(rider);
  }
  
  // === ADDITIONAL DETAILS ===
  // Neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 0.15, 20), skinMaterial);
  neck.position.set(0, 0.28, 0.15);
  neck.rotation.x = Math.PI / 2;
  group.add(neck);
  
  // Mane (for certain subtypes)
  if (subtype === 'lion' || subtype === 'horse') {
    const mane = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), darkMaterial);
    mane.position.set(0, 0.28, 0.15);
    group.add(mane);
  }
  
  // Face marker for debugging
  const faceMarker = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.08, 12), accentMaterial);
  faceMarker.position.set(0, 0.32, 0.42);
  faceMarker.rotation.x = Math.PI / 2;
  group.add(faceMarker);
  
  // Standardize facing: ensure +Z is forward
  group.rotation.y = 0;
  return group;
}

// --- FLYING TROOP ---
function generateFlyingTroopMesh(lowerPrompt, role, subtype, skinMaterial, armorMaterial, darkMaterial, accentMaterial, clothMaterial, goldMaterial) {
  const group = new THREE.Group();
  
  // === HIGH FIDELITY BODY PARTS ===
  // Body (high segment count)
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.32, 32, 8), skinMaterial);
  body.position.y = 0.22;
  body.castShadow = true;
  group.add(body);
  
  // Chest plate (armor)
  const chestPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.155, 0.2, 32, 4), armorMaterial);
  chestPlate.position.y = 0.22;
  group.add(chestPlate);
  
  // Head (high segment count)
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 28, 28), skinMaterial);
  head.position.y = 0.42;
  group.add(head);
  
  // === DETAILED FACIAL FEATURES ===
  // Eyes (detailed)
  for (let i = -1; i <= 1; i += 2) {
    // Eye socket
    const eyeSocket = new THREE.Mesh(new THREE.SphereGeometry(0.02, 16, 16), darkMaterial);
    eyeSocket.position.set(0.06 * i, 0.46, 0.08);
    group.add(eyeSocket);
    
    // Eye white
    const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.016, 16, 16), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 }));
    eyeWhite.position.set(0.06 * i, 0.46, 0.085);
    group.add(eyeWhite);
    
    // Pupil
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.006, 12, 12), new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.1 }));
    pupil.position.set(0.06 * i, 0.46, 0.095);
    group.add(pupil);
  }
  
  // Beak or face marker (detailed)
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 16), accentMaterial);
  beak.position.set(0, 0.42, 0.15);
  beak.rotation.x = Math.PI / 2;
  group.add(beak);
  
  // Beak tip
  const beakTip = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.04, 12), darkMaterial);
  beakTip.position.set(0, 0.42, 0.27);
  beakTip.rotation.x = Math.PI / 2;
  group.add(beakTip);
  
  // === DETAILED WINGS ===
  for (let i = -1; i <= 1; i += 2) {
    // Wing base (shoulder)
    const wingBase = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 16), skinMaterial);
    wingBase.position.set(0.08 * i, 0.38, -0.05);
    group.add(wingBase);
    
    // Primary wing (detailed)
    const primaryWing = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.03, 0.35), accentMaterial);
    primaryWing.position.set(0.08 * i, 0.38, -0.12);
    primaryWing.rotation.y = i * Math.PI / 8;
    group.add(primaryWing);
    
    // Secondary wing (feathers)
    const secondaryWing = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.02, 0.25), clothMaterial);
    secondaryWing.position.set(0.08 * i, 0.38, -0.15);
    secondaryWing.rotation.y = i * Math.PI / 6;
    group.add(secondaryWing);
    
    // Wing feathers (individual)
    for (let j = 0; j < 5; j++) {
      const feather = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.01, 0.08), clothMaterial);
      feather.position.set(0.08 * i + (j - 2) * 0.03, 0.38, -0.2);
      feather.rotation.y = i * Math.PI / 6;
      group.add(feather);
    }
  }
  
  // === DETAILED LIMBS ===
  // Arms (for holding weapons)
  for (let i = -1; i <= 1; i += 2) {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.15, 20), skinMaterial);
    arm.position.set(0.12 * i, 0.35, 0.05);
    arm.rotation.z = i * Math.PI / 6;
    group.add(arm);
    
    // Hand
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.025, 16, 16), skinMaterial);
    hand.position.set(0.18 * i, 0.28, 0.1);
    group.add(hand);
  }
  
  // === DETAILED ACCESSORIES ===
  // Neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 0.1, 20), skinMaterial);
  neck.position.y = 0.37;
  group.add(neck);
  
  // Tail feathers
  const tailFeathers = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.2), accentMaterial);
  tailFeathers.position.set(0, 0.22, -0.25);
  group.add(tailFeathers);
  
  // Individual tail feathers
  for (let i = 0; i < 3; i++) {
    const tailFeather = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.01, 0.15), clothMaterial);
    tailFeather.position.set((i - 1) * 0.03, 0.22, -0.35);
    group.add(tailFeather);
  }
  
  // === FLIGHT EFFECTS ===
  // Raise the troop above the ground
  group.position.y = 0.25;
  
  // Enhanced glow effect
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 24, 24), 
    new THREE.MeshStandardMaterial({ 
      color: 0x00e0ff, 
      transparent: true, 
      opacity: 0.1, 
      emissive: 0x00e0ff, 
      emissiveIntensity: 0.4 
    })
  );
  glow.position.set(0, 0.1, 0);
  group.add(glow);
  
  // Flight trail
  const flightTrail = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.02, 0.3, 12),
    new THREE.MeshStandardMaterial({ 
      color: 0x00e0ff, 
      transparent: true, 
      opacity: 0.3, 
      emissive: 0x00e0ff, 
      emissiveIntensity: 0.2 
    })
  );
  flightTrail.position.set(0, 0.1, -0.2);
  flightTrail.rotation.x = Math.PI / 2;
  group.add(flightTrail);
  
  // === ROLE-SPECIFIC EQUIPMENT ===
  if (role === 'ranged') {
    // Bow (held in hands)
    const bow = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.012, 8, 32, Math.PI), darkMaterial);
    bow.position.set(0.18, 0.28, 0.1);
    bow.rotation.z = Math.PI / 2;
    group.add(bow);
  } else if (role === 'magic') {
    // Staff (held in hands)
    const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.25, 12), darkMaterial);
    staff.position.set(0.18, 0.28, 0.1);
    group.add(staff);
    
    // Staff orb
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.025, 16, 16), accentMaterial);
    orb.position.set(0.18, 0.4, 0.1);
    group.add(orb);
  }
  
  // Standardize facing: ensure +Z is forward
  group.rotation.y = 0;
  return group;
}

// --- MOUNTED TROOP ---
function generateMountedTroopMesh(lowerPrompt, role, subtype, skinMaterial, armorMaterial, darkMaterial, accentMaterial, clothMaterial, goldMaterial) {
  const group = new THREE.Group();
  
  // === HIGH FIDELITY BODY PARTS ===
  // Base body (elongated along +Z, high segment count)
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.42, 0.22), skinMaterial);
  body.position.y = 0.21;
  group.add(body);
  
  // Chest plate (detailed armor)
  const chest = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.1, 0.21),
    armorMaterial
  );
  chest.position.y = 0.31;
  group.add(chest);
  
  // Shoulder armor
  for (let i = -1; i <= 1; i += 2) {
    const shoulderArmor = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16), armorMaterial);
    shoulderArmor.position.set(0.15 * i, 0.36, 0);
    group.add(shoulderArmor);
  }
  
  // === DETAILED FACIAL FEATURES ===
  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 24), skinMaterial);
  head.position.set(0, 0.42, 0.15);
  group.add(head);
  
  // Eyes (detailed)
  for (let i = -1; i <= 1; i += 2) {
    // Eye socket
    const eyeSocket = new THREE.Mesh(new THREE.SphereGeometry(0.025, 16, 16), darkMaterial);
    eyeSocket.position.set(0.05 * i, 0.46, 0.25);
    group.add(eyeSocket);
    
    // Eye white
    const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.02, 16, 16), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 }));
    eyeWhite.position.set(0.05 * i, 0.46, 0.255);
    group.add(eyeWhite);
    
    // Pupil
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.008, 12, 12), new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.1 }));
    pupil.position.set(0.05 * i, 0.46, 0.265);
    group.add(pupil);
  }
  
  // Nose (detailed)
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.06, 16), skinMaterial);
  nose.position.set(0, 0.44, 0.28);
  nose.rotation.x = Math.PI / 2;
  group.add(nose);
  
  // Mouth (detailed)
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.008, 8, 16), darkMaterial);
  mouth.position.set(0, 0.42, 0.3);
  mouth.rotation.x = Math.PI / 2;
  group.add(mouth);
  
  // === DETAILED LEGS ===
  for (let i = -1; i <= 1; i += 2) {
    for (let j = -1; j <= 1; j += 2) {
      // Upper leg (thigh)
      const upperLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.15, 20), skinMaterial);
      upperLeg.position.set(0.12 * i, 0.08, 0.08 * j);
      upperLeg.rotation.x = Math.PI / 12 * j;
      group.add(upperLeg);
      
      // Lower leg (calf)
      const lowerLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.12, 16), skinMaterial);
      lowerLeg.position.set(0.12 * i, -0.02, 0.08 * j);
      lowerLeg.rotation.x = Math.PI / 12 * j;
      group.add(lowerLeg);
      
      // Foot (detailed)
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.025, 0.1), skinMaterial);
      foot.position.set(0.12 * i, -0.1, 0.08 * j);
      group.add(foot);
      
      // Hooves
      for (let k = 0; k < 2; k++) {
        const hoof = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.006, 0.02, 8), darkMaterial);
        hoof.position.set(0.12 * i + (k - 0.5) * 0.02, -0.1, 0.08 * j + 0.05);
        hoof.rotation.x = Math.PI / 6;
        group.add(hoof);
      }
    }
  }
  
  // === DETAILED SADDLE SYSTEM ===
  // Saddle base (detailed)
  const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.08), darkMaterial);
  saddle.position.set(0, 0.15, 0.05);
  group.add(saddle);
  
  // Saddle seat
  const saddleSeat = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.06), clothMaterial);
  saddleSeat.position.set(0, 0.21, 0.05);
  group.add(saddleSeat);
  
  // Saddle straps
  for (let i = -1; i <= 1; i += 2) {
    const strap = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.15, 0.02), darkMaterial);
    strap.position.set(0.12 * i, 0.15, 0.05);
    group.add(strap);
    
    // Strap buckle
    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.02, 0.02), goldMaterial);
    buckle.position.set(0.12 * i, 0.08, 0.05);
    group.add(buckle);
  }
  
  // Saddle decoration
  const saddleDeco = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.015, 8, 24), goldMaterial);
  saddleDeco.position.set(0, 0.21, 0.05);
  saddleDeco.rotation.x = Math.PI / 2;
  group.add(saddleDeco);
  
  // === RIDER SYSTEM ===
  // Rider (optional, for 'mounted' prompt)
  if (lowerPrompt.includes('mounted') || lowerPrompt.includes('rider')) {
    const rider = generateBipedTroopMesh(lowerPrompt, role, subtype, skinMaterial, armorMaterial, darkMaterial, accentMaterial, clothMaterial, goldMaterial);
    rider.position.set(0, 0.35, 0);
    rider.scale.set(0.6, 0.6, 0.6);
    group.add(rider);
  }
  
  // === ADDITIONAL DETAILS ===
  // Neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.2, 20), skinMaterial);
  neck.position.set(0, 0.42, 0.05);
  neck.rotation.x = Math.PI / 2;
  group.add(neck);
  
  // Mane (detailed)
  const mane = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), darkMaterial);
  mane.position.set(0, 0.42, 0.05);
  group.add(mane);
  
  // Individual mane strands
  for (let i = 0; i < 8; i++) {
    const maneStrand = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.004, 0.1, 8), darkMaterial);
    maneStrand.position.set((i - 3.5) * 0.03, 0.42, 0.05);
    maneStrand.rotation.x = Math.PI / 2;
    group.add(maneStrand);
  }
  
  // Tail (detailed)
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.25, 16), darkMaterial);
  tail.position.set(0, 0.21, -0.15);
  tail.rotation.x = Math.PI / 4;
  group.add(tail);
  
  // Tail tip
  const tailTip = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 12), darkMaterial);
  tailTip.position.set(0, 0.21, -0.3);
  group.add(tailTip);
  
  // === ARMOR DETAILS ===
  // Leg armor
  for (let i = -1; i <= 1; i += 2) {
    const legArmor = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.12, 16), armorMaterial);
    legArmor.position.set(0.12 * i, 0.08, 0);
    group.add(legArmor);
  }
  
  // Face marker for debugging
  const faceMarker = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.1, 12), accentMaterial);
  faceMarker.position.set(0, 0.46, 0.35);
  faceMarker.rotation.x = Math.PI / 2;
  group.add(faceMarker);
  
  // Standardize facing: ensure +Z is forward
  group.rotation.y = 0;
  return group;
}

// --- INSECTOID TROOP ---
function generateInsectoidTroopMesh(lowerPrompt, role, subtype, skinMaterial, armorMaterial, darkMaterial, accentMaterial, clothMaterial, greenMaterial) {
  const group = new THREE.Group();
  
  // === HIGH FIDELITY BODY PARTS ===
  // Base body (larger than biped, high segment count)
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.44, 0.24), skinMaterial);
  body.position.y = 0.22;
  body.castShadow = true;
  group.add(body);

  // Chest plate (detailed armor)
  const chest = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.1, 0.23),
    greenMaterial
  );
  chest.position.y = 0.32;
  group.add(chest);

  // === DETAILED FACIAL FEATURES ===
  // Head (detailed)
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 28, 28), skinMaterial);
  head.position.set(0, 0.48, 0.15);
  group.add(head);
  
  // Compound eyes (insect-like)
  for (let i = -1; i <= 1; i += 2) {
    // Eye cluster base
    const eyeCluster = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 16), darkMaterial);
    eyeCluster.position.set(0.08 * i, 0.52, 0.25);
    group.add(eyeCluster);
    
    // Individual eye facets
    for (let j = 0; j < 6; j++) {
      const eyeFacet = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 8), accentMaterial);
      eyeFacet.position.set(0.08 * i + (j - 2.5) * 0.015, 0.52, 0.25);
      group.add(eyeFacet);
    }
  }
  
  // Mandibles (insect jaws)
  for (let i = -1; i <= 1; i += 2) {
    const mandible = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.08, 12), darkMaterial);
    mandible.position.set(0.04 * i, 0.48, 0.3);
    mandible.rotation.x = Math.PI / 2;
    mandible.rotation.z = i * Math.PI / 8;
    group.add(mandible);
  }
  
  // Antennae
  for (let i = -1; i <= 1; i += 2) {
    const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.004, 0.12, 12), darkMaterial);
    antenna.position.set(0.06 * i, 0.56, 0.2);
    antenna.rotation.z = i * Math.PI / 6;
    group.add(antenna);
    
    // Antenna tip
    const antennaTip = new THREE.Mesh(new THREE.SphereGeometry(0.006, 8, 8), accentMaterial);
    antennaTip.position.set(0.06 * i, 0.56, 0.2);
    group.add(antennaTip);
  }

  // === DETAILED LIMBS ===
  // Arms (insect-like, multiple segments)
  for (let i = -1; i <= 1; i += 2) {
    // Upper arm
    const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.12, 16), skinMaterial);
    upperArm.position.set(0.18 * i, 0.4, 0.05);
    upperArm.rotation.z = i * Math.PI / 6;
    group.add(upperArm);
    
    // Lower arm
    const lowerArm = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.1, 16), skinMaterial);
    lowerArm.position.set(0.25 * i, 0.35, 0.1);
    lowerArm.rotation.z = i * Math.PI / 4;
    group.add(lowerArm);
    
    // Hand/claw
    const claw = new THREE.Mesh(new THREE.SphereGeometry(0.025, 16, 16), darkMaterial);
    claw.position.set(0.3 * i, 0.3, 0.15);
    group.add(claw);
    
    // Claw fingers
    for (let j = 0; j < 3; j++) {
      const clawFinger = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.002, 0.04, 8), darkMaterial);
      clawFinger.position.set(0.3 * i, 0.3, 0.15);
      clawFinger.rotation.z = i * (Math.PI / 3 + j * Math.PI / 6);
      group.add(clawFinger);
    }
  }

  // === DETAILED LEGS ===
  for (let i = -1; i <= 1; i += 2) {
    for (let j = -1; j <= 1; j += 2) {
      // Upper leg (thigh)
      const upperLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.15, 20), skinMaterial);
      upperLeg.position.set(0.12 * i, 0.08, 0.08 * j);
      upperLeg.rotation.x = Math.PI / 12 * j;
      group.add(upperLeg);
      
      // Middle leg segment
      const middleLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.12, 16), skinMaterial);
      middleLeg.position.set(0.12 * i, -0.02, 0.08 * j);
      middleLeg.rotation.x = Math.PI / 12 * j;
      group.add(middleLeg);
      
      // Lower leg (calf)
      const lowerLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.1, 16), skinMaterial);
      lowerLeg.position.set(0.12 * i, -0.1, 0.08 * j);
      lowerLeg.rotation.x = Math.PI / 12 * j;
      group.add(lowerLeg);
      
      // Foot (insect-like)
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.08), skinMaterial);
      foot.position.set(0.12 * i, -0.18, 0.08 * j);
      group.add(foot);
      
      // Foot claws
      for (let k = 0; k < 3; k++) {
        const footClaw = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.001, 0.02, 6), darkMaterial);
        footClaw.position.set(0.12 * i + (k - 1) * 0.015, -0.18, 0.08 * j + 0.05);
        footClaw.rotation.x = Math.PI / 6;
        group.add(footClaw);
      }
    }
  }

  // === DETAILED ARMOR SYSTEM ===
  // Armor (optional, based on prompt)
  if (lowerPrompt.includes('armor') || lowerPrompt.includes('knight') || lowerPrompt.includes('elite')) {
    const armor = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.12, 0.25),
      armorMaterial
    );
    armor.position.y = 0.32;
    group.add(armor);
    
    // Shoulder armor
    for (let i = -1; i <= 1; i += 2) {
      const shoulderArmor = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), armorMaterial);
      shoulderArmor.position.set(0.18 * i, 0.42, 0);
      group.add(shoulderArmor);
    }
  }

  // === INSECT-SPECIFIC FEATURES ===
  // Wings (for flying insects)
  if (subtype === 'wasp' || subtype === 'bee' || lowerPrompt.includes('wing')) {
    for (let i = -1; i <= 1; i += 2) {
      const wing = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.01, 0.25), new THREE.MeshStandardMaterial({ 
        color: 0x4e9a06, 
        transparent: true, 
        opacity: 0.7 
      }));
      wing.position.set(0.1 * i, 0.4, -0.1);
      wing.rotation.y = i * Math.PI / 8;
      group.add(wing);
    }
  }
  
  // Stinger (for certain subtypes)
  if (subtype === 'wasp' || subtype === 'scorpion') {
    const stinger = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.06, 12), darkMaterial);
    stinger.position.set(0, 0.22, -0.15);
    stinger.rotation.x = Math.PI;
    group.add(stinger);
  }
  
  // Shell segments (for beetle)
  if (subtype === 'beetle') {
    for (let i = 0; i < 3; i++) {
      const shellSegment = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.04, 0.2), greenMaterial);
      shellSegment.position.set(0, 0.32 + i * 0.04, 0);
      group.add(shellSegment);
    }
  }

  // === ADDITIONAL DETAILS ===
  // Neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 0.1, 20), skinMaterial);
  neck.position.y = 0.42;
  group.add(neck);
  
  // Abdomen segments
  for (let i = 0; i < 3; i++) {
    const abdomenSegment = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.18), skinMaterial);
    abdomenSegment.position.set(0, 0.08 - i * 0.06, 0);
    group.add(abdomenSegment);
  }
  
  // Face marker for debugging
  const faceMarker = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.08, 12), accentMaterial);
  faceMarker.position.set(0, 0.52, 0.35);
  faceMarker.rotation.x = Math.PI / 2;
  group.add(faceMarker);

  // Standardize facing: ensure +Z is forward
  group.rotation.y = 0;
  return group;
}

function determineTroopVariant(prompt, troopType) {
  const variants = getTroopVariants()[troopType];
  let bestMatch = variants[0];
  let maxScore = 0;
  
  variants.forEach(variant => {
    let score = 0;
    variant.keywords.forEach(keyword => {
      if (prompt.includes(keyword)) {
        score += 1;
      }
    });
    if (score > maxScore) {
      maxScore = score;
      bestMatch = variant;
    }
  });
  
  return bestMatch;
}

function addVariantBody(group, variant, bodyScale, color, gray, dark, accent) {
  // Body
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.3 * bodyScale, 0.4 * bodyScale, 0.2 * bodyScale),
    new THREE.MeshLambertMaterial({color})
  );
  body.position.y = 0.2;
  body.castShadow = true;
  group.add(body);
  
  // Chest plate
  const chest = new THREE.Mesh(
    new THREE.BoxGeometry(0.22 * bodyScale, 0.08 * bodyScale, 0.19 * bodyScale),
    new THREE.MeshLambertMaterial({color: gray})
  );
  chest.position.y = 0.3;
  group.add(chest);
}

function addVariantDetails(group, variant, troopType, color, gray, dark, accent, weaponScale) {
  // Add weapon based on variant
  addWeapon(group, variant, troopType, weaponScale, dark, accent);
  
  // Add armor/accessories based on variant
  addArmor(group, variant, color, gray, dark);
  
  // Add special effects based on variant
  addSpecialEffects(group, variant, accent);
}

function addWeapon(group, variant, troopType, weaponScale, dark, accent) {
  const weaponType = variant.weapon;
  
  if (troopType === 'melee') {
    addMeleeWeapon(group, weaponType, weaponScale, dark);
  } else if (troopType === 'ranged') {
    addRangedWeapon(group, weaponType, weaponScale, dark, accent);
  } else if (troopType === 'magic') {
    addMagicWeapon(group, weaponType, weaponScale, accent);
  }
}

function addMeleeWeapon(group, weaponType, weaponScale, dark) {
  let weapon;
  
  if (weaponType === 'sword' || weaponType === 'broadsword') {
    weapon = new THREE.Mesh(
      new THREE.BoxGeometry(0.05 * weaponScale, 0.4 * weaponScale, 0.02 * weaponScale),
      new THREE.MeshLambertMaterial({color: dark})
    );
    weapon.position.set(0.25, 0.3, 0);
  } else if (weaponType === 'axe' || weaponType === 'battleaxe') {
    weapon = new THREE.Mesh(
      new THREE.BoxGeometry(0.08 * weaponScale, 0.3 * weaponScale, 0.05 * weaponScale),
      new THREE.MeshLambertMaterial({color: dark})
    );
    weapon.position.set(0.25, 0.3, 0);
  } else if (weaponType === 'spear') {
    weapon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02 * weaponScale, 0.02 * weaponScale, 0.5 * weaponScale, 6),
      new THREE.MeshLambertMaterial({color: dark})
    );
    weapon.position.set(0.25, 0.3, 0);
  } else {
    // Default weapon
    weapon = new THREE.Mesh(
      new THREE.BoxGeometry(0.05 * weaponScale, 0.3 * weaponScale, 0.05 * weaponScale),
      new THREE.MeshLambertMaterial({color: dark})
    );
    weapon.position.set(0.2, 0.3, 0);
  }
  
  group.add(weapon);
}

function addRangedWeapon(group, weaponType, weaponScale, dark, accent) {
  let weapon;
  
  if (weaponType === 'longbow' || weaponType === 'composite_bow') {
    weapon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02 * weaponScale, 0.02 * weaponScale, 0.4 * weaponScale, 6),
      new THREE.MeshLambertMaterial({color: dark})
    );
    weapon.position.set(0.25, 0.3, 0);
    weapon.rotation.z = Math.PI / 2;
  } else if (weaponType === 'rifle' || weaponType === 'sniper_rifle') {
    weapon = new THREE.Mesh(
      new THREE.BoxGeometry(0.03 * weaponScale, 0.02 * weaponScale, 0.3 * weaponScale),
      new THREE.MeshLambertMaterial({color: dark})
    );
    weapon.position.set(0.25, 0.3, 0);
  } else {
    // Default ranged weapon
    weapon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02 * weaponScale, 0.02 * weaponScale, 0.4 * weaponScale, 6),
      new THREE.MeshLambertMaterial({color: dark})
    );
    weapon.position.set(0.25, 0.3, 0);
    weapon.rotation.z = Math.PI / 2;
  }
  
  group.add(weapon);
}

function addMagicWeapon(group, weaponType, weaponScale, accent) {
  let weapon;
  
  if (weaponType === 'staff' || weaponType === 'nature_staff') {
    weapon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03 * weaponScale, 0.03 * weaponScale, 0.4 * weaponScale, 6),
      new THREE.MeshLambertMaterial({color: accent})
    );
    weapon.position.set(0.2, 0.3, 0);
  } else if (weaponType === 'wand') {
    weapon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015 * weaponScale, 0.015 * weaponScale, 0.2 * weaponScale, 6),
      new THREE.MeshLambertMaterial({color: accent})
    );
    weapon.position.set(0.2, 0.3, 0);
  } else {
    // Default magic weapon
    weapon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03 * weaponScale, 0.03 * weaponScale, 0.3 * weaponScale, 6),
      new THREE.MeshLambertMaterial({color: accent})
    );
    weapon.position.set(0.2, 0.3, 0);
  }
  
  group.add(weapon);
}

function addArmor(group, variant, color, gray, dark) {
  // Add shoulder pads
  const shoulderPad = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.05, 0.08),
    new THREE.MeshLambertMaterial({color: gray})
  );
  shoulderPad.position.set(0.2, 0.4, 0);
  group.add(shoulderPad);
  
  const shoulderPad2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.05, 0.08),
    new THREE.MeshLambertMaterial({color: gray})
  );
  shoulderPad2.position.set(-0.2, 0.4, 0);
  group.add(shoulderPad2);
  
  // Add leg armor
  const legArmor = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.15, 0.06),
    new THREE.MeshLambertMaterial({color: gray})
  );
  legArmor.position.set(0.08, 0.05, 0);
  group.add(legArmor);
  
  const legArmor2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.15, 0.06),
    new THREE.MeshLambertMaterial({color: gray})
  );
  legArmor2.position.set(-0.08, 0.05, 0);
  group.add(legArmor2);
}

function addSpecialEffects(group, variant, accent) {
  // Add glowing effects for magic users
  if (variant.special.includes('fire') || variant.special.includes('flame')) {
    const fireEffect = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 8, 8),
      new THREE.MeshLambertMaterial({color: 0xff4400, emissive: 0xff2200, emissiveIntensity: 0.5})
    );
    fireEffect.position.set(0, 0.6, 0);
    group.add(fireEffect);
  }
  
  // Add lightning effects
  if (variant.special.includes('lightning') || variant.special.includes('thunder')) {
    const lightningEffect = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 8, 8),
      new THREE.MeshLambertMaterial({color: accent, emissive: accent, emissiveIntensity: 0.7})
    );
    lightningEffect.position.set(0, 0.6, 0);
    group.add(lightningEffect);
  }
}

// Add procedural visual details based on troop description
function addProceduralDetails(group, prompt, color, gray, dark, accent) {
  // Add helmet variations
  if (prompt.includes('elite') || prompt.includes('royal') || prompt.includes('knight')) {
    const helmet = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.12, 0.16),
      new THREE.MeshLambertMaterial({color: dark})
    );
    helmet.position.set(0, 0.56, 0);
    group.add(helmet);
  } else if (prompt.includes('stealth') || prompt.includes('ninja')) {
    const hood = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 0.15, 8),
      new THREE.MeshLambertMaterial({color: dark})
    );
    hood.position.set(0, 0.58, 0);
    group.add(hood);
  }
  
  // Add cape for elite/veteran troops
  if (prompt.includes('elite') || prompt.includes('veteran') || prompt.includes('royal')) {
    const cape = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.3, 0.02),
      new THREE.MeshLambertMaterial({color: dark})
    );
    cape.position.set(0, 0.25, -0.12);
    group.add(cape);
  }
  
  // Add belt for experienced troops
  if (prompt.includes('veteran') || prompt.includes('seasoned') || prompt.includes('experienced')) {
    const belt = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.03, 0.15),
      new THREE.MeshLambertMaterial({color: dark})
    );
    belt.position.set(0, 0.15, 0);
    group.add(belt);
  }
  
  // Add shoulder armor for heavy troops
  if (prompt.includes('heavy') || prompt.includes('armor') || prompt.includes('tank')) {
    const shoulderArmor = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.08, 0.1),
      new THREE.MeshLambertMaterial({color: gray})
    );
    shoulderArmor.position.set(0.25, 0.42, 0);
    group.add(shoulderArmor);
    
    const shoulderArmor2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.08, 0.1),
      new THREE.MeshLambertMaterial({color: gray})
    );
    shoulderArmor2.position.set(-0.25, 0.42, 0);
    group.add(shoulderArmor2);
  }
  
  // Add leg armor variations
  if (prompt.includes('armor') || prompt.includes('protected')) {
    const legArmor = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.2, 0.08),
      new THREE.MeshLambertMaterial({color: gray})
    );
    legArmor.position.set(0.1, 0.05, 0);
    group.add(legArmor);
    
    const legArmor2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.2, 0.08),
      new THREE.MeshLambertMaterial({color: gray})
    );
    legArmor2.position.set(-0.1, 0.05, 0);
    group.add(legArmor2);
  }
  
  // Add magic effects for magic users
  if (prompt.includes('magic') || prompt.includes('wizard') || prompt.includes('mage')) {
    const magicAura = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 8, 8),
      new THREE.MeshLambertMaterial({color: accent, transparent: true, opacity: 0.2})
    );
    magicAura.position.set(0, 0.2, 0);
    group.add(magicAura);
  }
  
  // Add stealth effects for stealthy troops
  if (prompt.includes('stealth') || prompt.includes('ninja') || prompt.includes('assassin')) {
    const stealthEffect = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 8, 8),
      new THREE.MeshLambertMaterial({color: 0x333333, transparent: true, opacity: 0.1})
    );
    stealthEffect.position.set(0, 0.2, 0);
    group.add(stealthEffect);
  }
  
  // Add random accessories (30% chance)
  if (Math.random() < 0.3) {
    const accessories = [
      () => {
        const pouch = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, 0.06, 0.04),
          new THREE.MeshLambertMaterial({color: dark})
        );
        pouch.position.set(-0.2, 0.2, 0);
        group.add(pouch);
      },
      () => {
        const bandolier = new THREE.Mesh(
          new THREE.BoxGeometry(0.25, 0.02, 0.02),
          new THREE.MeshLambertMaterial({color: dark})
        );
        bandolier.position.set(0, 0.45, 0);
        bandolier.rotation.z = Math.PI / 4;
        group.add(bandolier);
      },
      () => {
        const badge = new THREE.Mesh(
          new THREE.CircleGeometry(0.03, 8),
          new THREE.MeshLambertMaterial({color: accent})
        );
        badge.position.set(0.15, 0.35, 0.11);
        badge.rotation.x = Math.PI / 2;
        group.add(badge);
      }
    ];
    
    const randomAccessory = accessories[Math.floor(Math.random() * accessories.length)];
    randomAccessory();
  }
}

// --- Troop Variant Determination ---
export function determineTroopVariantFromPrompt(prompt, troopType) {
  const lowerPrompt = prompt.toLowerCase();
  const variants = getTroopVariants()[troopType];
  
  // Add error handling for invalid troop types
  if (!variants || variants.length === 0) {
    console.warn(`No variants found for troop type: ${troopType}. Using default melee variant.`);
    const defaultVariants = getTroopVariants()['melee'];
    return defaultVariants ? defaultVariants[0] : { name: 'default', weapon: 'sword', keywords: [] };
  }
  
  let bestMatch = variants[0];
  let maxScore = 0;
  
  variants.forEach(variant => {
    let score = 0;
    variant.keywords.forEach(keyword => {
      if (lowerPrompt.includes(keyword)) {
        score += 1;
      }
    });
    if (score > maxScore) {
      maxScore = score;
      bestMatch = variant;
    }
  });
  
  return bestMatch;
} 

// ============================================================================
// ADVANCED GENERAL GENERATION SYSTEM
// ============================================================================

// --- Custom 3D General Generation ---
export function generateCustomGeneralMesh(prompt, isPlayer, generalColor) {
  if (typeof prompt !== 'string') {
    prompt = String(prompt || '');
  }
  const lowerPrompt = prompt.toLowerCase();
  
  // === HIGH FIDELITY MATERIALS ===
  const baseColor = generalColor !== undefined ? generalColor : (isPlayer ? 0x1da1f2 : 0xff5e62);
  const colorVariation = Math.random() * 0.2 - 0.1;
  const color = new THREE.Color(baseColor);
  color.offsetHSL(colorVariation, 0, 0);
  
  const skinMaterial = new THREE.MeshStandardMaterial({ color: color.getHex(), roughness: 0.5, metalness: 0.1 });
  const armorMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.7, metalness: 0.4 });
  const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8, metalness: 0.2 });
  const accentMaterial = new THREE.MeshStandardMaterial({ color: 0x00e0ff, roughness: 0.3, metalness: 0.7, emissive: 0x00e0ff, emissiveIntensity: 0.2 });
  const clothMaterial = new THREE.MeshStandardMaterial({ color: 0x7c532f, roughness: 0.9, metalness: 0.05 });
  const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.8 });
  const silverMaterial = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, roughness: 0.2, metalness: 0.9 });
  
  // === ROLE DETECTION ===
  let role = 'melee';
  if (lowerPrompt.match(/(bow|archer|crossbow|gun|ranged|sniper|shooter)/)) role = 'ranged';
  else if (lowerPrompt.match(/(magic|mage|wizard|sorcerer|spell|shaman|witch|warlock)/)) role = 'magic';
  else if (lowerPrompt.match(/(shield|tank|defender|paladin|guard|protector)/)) role = 'defender';
  
  // === PROMPT ANALYSIS ===
  const isHeavy = lowerPrompt.includes('heavy') || lowerPrompt.includes('tank') || lowerPrompt.includes('armor');
  const isLight = lowerPrompt.includes('light') || lowerPrompt.includes('fast') || lowerPrompt.includes('quick') || lowerPrompt.includes('stealth');
  const isElite = lowerPrompt.includes('elite') || lowerPrompt.includes('royal') || lowerPrompt.includes('knight');
  const isVeteran = lowerPrompt.includes('veteran') || lowerPrompt.includes('seasoned') || lowerPrompt.includes('experienced');
  const isYoung = lowerPrompt.includes('young') || lowerPrompt.includes('fresh') || lowerPrompt.includes('new') || lowerPrompt.includes('recruit');
  const isLegendary = lowerPrompt.includes('legendary') || lowerPrompt.includes('hero') || lowerPrompt.includes('champion');
  
  // === SCALE DETERMINATION ===
  let bodyScale = 1.5 + (Math.random() * 0.3 - 0.15);
  let headScale = 1.2 + (Math.random() * 0.2 - 0.1);
  let weaponScale = 1.3 + (Math.random() * 0.4 - 0.2);
  
  if (isHeavy) {
    bodyScale *= 1.2;
    headScale *= 0.9;
    weaponScale *= 1.3;
  } else if (isLight) {
    bodyScale *= 0.9;
    headScale *= 1.1;
    weaponScale *= 0.9;
  } else if (isElite) {
    bodyScale *= 1.1;
    headScale *= 1.0;
    weaponScale *= 1.2;
  }
  
  if (isVeteran) {
    bodyScale *= 1.05;
    weaponScale *= 1.1;
  } else if (isYoung) {
    bodyScale *= 0.95;
    weaponScale *= 0.9;
  }
  
  if (isLegendary) {
    bodyScale *= 1.15;
    weaponScale *= 1.25;
  }
  
  // === HIGH FIDELITY GENERAL GENERATION ===
  const group = new THREE.Group();

  // === MANNEQUIN BODY SEGMENTS ===
  // Pelvis
  const pelvis = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16 * bodyScale, 0.18 * bodyScale, 0.18 * bodyScale, 24),
    armorMaterial
  );
  pelvis.position.y = 0.1 * bodyScale;
  group.add(pelvis);

  // Torso
  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15 * bodyScale, 0.18 * bodyScale, 0.38 * bodyScale, 24),
    armorMaterial
  );
  torso.position.y = 0.35 * bodyScale;
  group.add(torso);

  // Chest/shoulder joint spheres
  for (let i = -1; i <= 1; i += 2) {
    const shoulder = new THREE.Mesh(
      new THREE.SphereGeometry(0.09 * bodyScale, 16, 16),
      armorMaterial
    );
    shoulder.position.set(0.18 * bodyScale * i, 0.54 * bodyScale, 0);
    group.add(shoulder);
  }

  // Head (ellipsoid, no features)
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.13 * headScale, 24, 24),
    skinMaterial
  );
  head.scale.y = 1.25;
  head.position.y = 0.7 * bodyScale;
  group.add(head);

  // === ARMS ===
  for (let i = -1; i <= 1; i += 2) {
    // Upper arm
    const upperArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045 * bodyScale, 0.045 * bodyScale, 0.22 * bodyScale, 16),
      skinMaterial
    );
    upperArm.position.set(0.23 * bodyScale * i, 0.44 * bodyScale, 0);
    upperArm.rotation.z = i * Math.PI / 8;
    group.add(upperArm);
    // Shoulder joint
    const shoulderJoint = new THREE.Mesh(
      new THREE.SphereGeometry(0.045 * bodyScale, 12, 12),
      armorMaterial
    );
    shoulderJoint.position.set(0.23 * bodyScale * i, 0.55 * bodyScale, 0);
    group.add(shoulderJoint);
    // Elbow joint
    const elbowJoint = new THREE.Mesh(
      new THREE.SphereGeometry(0.04 * bodyScale, 12, 12),
      armorMaterial
    );
    elbowJoint.position.set(0.28 * bodyScale * i, 0.33 * bodyScale, 0);
    group.add(elbowJoint);
    // Lower arm
    const lowerArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04 * bodyScale, 0.04 * bodyScale, 0.18 * bodyScale, 16),
      skinMaterial
    );
    lowerArm.position.set(0.32 * bodyScale * i, 0.23 * bodyScale, 0);
    lowerArm.rotation.z = i * Math.PI / 10;
    group.add(lowerArm);
    // Wrist joint
    const wristJoint = new THREE.Mesh(
      new THREE.SphereGeometry(0.035 * bodyScale, 12, 12),
      armorMaterial
    );
    wristJoint.position.set(0.36 * bodyScale * i, 0.14 * bodyScale, 0);
    group.add(wristJoint);
    // Hand (blocky)
    const hand = new THREE.Mesh(
      new THREE.BoxGeometry(0.06 * bodyScale, 0.04 * bodyScale, 0.08 * bodyScale),
      skinMaterial
    );
    hand.position.set(0.39 * bodyScale * i, 0.09 * bodyScale, 0);
    group.add(hand);
  }

  // === LEGS ===
  for (let i = -1; i <= 1; i += 2) {
    // Hip joint
    const hipJoint = new THREE.Mesh(
      new THREE.SphereGeometry(0.055 * bodyScale, 12, 12),
      armorMaterial
    );
    hipJoint.position.set(0.09 * bodyScale * i, 0.01 * bodyScale, 0);
    group.add(hipJoint);
    // Upper leg
    const upperLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05 * bodyScale, 0.05 * bodyScale, 0.22 * bodyScale, 16),
      skinMaterial
    );
    upperLeg.position.set(0.09 * bodyScale * i, -0.13 * bodyScale, 0);
    group.add(upperLeg);
    // Knee joint
    const kneeJoint = new THREE.Mesh(
      new THREE.SphereGeometry(0.045 * bodyScale, 12, 12),
      armorMaterial
    );
    kneeJoint.position.set(0.09 * bodyScale * i, -0.23 * bodyScale, 0);
    group.add(kneeJoint);
    // Lower leg
    const lowerLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045 * bodyScale, 0.045 * bodyScale, 0.18 * bodyScale, 16),
      skinMaterial
    );
    lowerLeg.position.set(0.09 * bodyScale * i, -0.32 * bodyScale, 0);
    group.add(lowerLeg);
    // Ankle joint
    const ankleJoint = new THREE.Mesh(
      new THREE.SphereGeometry(0.035 * bodyScale, 12, 12),
      armorMaterial
    );
    ankleJoint.position.set(0.09 * bodyScale * i, -0.4 * bodyScale, 0);
    group.add(ankleJoint);
    // Foot (blocky)
    const foot = new THREE.Mesh(
      new THREE.BoxGeometry(0.08 * bodyScale, 0.04 * bodyScale, 0.13 * bodyScale),
      skinMaterial
    );
    foot.position.set(0.09 * bodyScale * i, -0.45 * bodyScale, 0.04 * bodyScale);
    group.add(foot);
  }

  // === COOL GENERAL ENHANCEMENTS ===
  
  // === DETAILED HEAD ===
  // Eyes (detailed)
  for (let i = -1; i <= 1; i += 2) {
    // Eye socket
    const eyeSocket = new THREE.Mesh(
      new THREE.SphereGeometry(0.035 * headScale, 20, 20),
      darkMaterial
    );
    eyeSocket.position.set(0.12 * headScale * i, 0.8 * bodyScale, 0.15 * headScale);
    group.add(eyeSocket);
    
    // Eye white
    const eyeWhite = new THREE.Mesh(
      new THREE.SphereGeometry(0.028 * headScale, 20, 20),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 })
    );
    eyeWhite.position.set(0.12 * headScale * i, 0.8 * bodyScale, 0.155 * headScale);
    group.add(eyeWhite);
    
    // Pupil
    const pupil = new THREE.Mesh(
      new THREE.SphereGeometry(0.012 * headScale, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.1 })
    );
    pupil.position.set(0.12 * headScale * i, 0.8 * bodyScale, 0.165 * headScale);
    group.add(pupil);
    
    // Eyelid
    const eyelid = new THREE.Mesh(
      new THREE.TorusGeometry(0.03 * headScale, 0.005 * headScale, 8, 20),
      skinMaterial
    );
    eyelid.position.set(0.12 * headScale * i, 0.8 * bodyScale, 0.15 * headScale);
    eyelid.rotation.x = Math.PI / 2;
    group.add(eyelid);
  }
  
  // Nose (detailed)
  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(0.025 * headScale, 0.06 * headScale, 20),
    skinMaterial
  );
  nose.position.set(0, 0.78 * bodyScale, 0.22 * headScale);
  nose.rotation.x = Math.PI / 2;
  group.add(nose);
  
  // Mouth (detailed)
  const mouth = new THREE.Mesh(
    new THREE.TorusGeometry(0.035 * headScale, 0.01 * headScale, 8, 20),
    darkMaterial
  );
  mouth.position.set(0, 0.72 * bodyScale, 0.18 * headScale);
  mouth.rotation.x = Math.PI / 2;
  group.add(mouth);
  
  // Ears (detailed)
  for (let i = -1; i <= 1; i += 2) {
    const ear = new THREE.Mesh(
      new THREE.ConeGeometry(0.03 * headScale, 0.08 * headScale, 20),
      skinMaterial
    );
    ear.position.set(0.2 * headScale * i, 0.78 * bodyScale, 0);
    ear.rotation.z = i === -1 ? Math.PI / 6 : -Math.PI / 6;
    group.add(ear);
    
    // Inner ear
    const innerEar = new THREE.Mesh(
      new THREE.ConeGeometry(0.02 * headScale, 0.06 * headScale, 16),
      darkMaterial
    );
    innerEar.position.set(0.2 * headScale * i, 0.78 * bodyScale, 0);
    innerEar.rotation.z = i === -1 ? Math.PI / 6 : -Math.PI / 6;
    group.add(innerEar);
  }
  
  // === DETAILED LIMBS ===
  // Arms (detailed)
  for (let i = -1; i <= 1; i += 2) {
    // Upper arm
    const upperArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05 * bodyScale, 0.06 * bodyScale, 0.25 * bodyScale, 24),
      skinMaterial
    );
    upperArm.position.set(0.3 * bodyScale * i, 0.45 * bodyScale, 0);
    upperArm.rotation.z = i * Math.PI / 8;
    group.add(upperArm);
    
    // Forearm
    const forearm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045 * bodyScale, 0.055 * bodyScale, 0.2 * bodyScale, 20),
      skinMaterial
    );
    forearm.position.set(0.45 * bodyScale * i, 0.35 * bodyScale, 0.05 * bodyScale);
    forearm.rotation.z = i * Math.PI / 6;
    group.add(forearm);
    
    // Hand
    const hand = new THREE.Mesh(
      new THREE.SphereGeometry(0.05 * bodyScale, 24, 24),
      skinMaterial
    );
    hand.position.set(0.55 * bodyScale * i, 0.25 * bodyScale, 0.1 * bodyScale);
    group.add(hand);
    
    // Fingers
    for (let j = 0; j < 4; j++) {
      const finger = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012 * bodyScale, 0.008 * bodyScale, 0.04 * bodyScale, 12),
        skinMaterial
      );
      finger.position.set(0.55 * bodyScale * i + (j - 1.5) * 0.02 * bodyScale, 0.23 * bodyScale, 0.14 * bodyScale);
      finger.rotation.x = Math.PI / 6;
      group.add(finger);
    }
  }
  
  // === DETAILED LEGS ===
  for (let i = -1; i <= 1; i += 2) {
    // Upper leg (thigh)
    const upperLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06 * bodyScale, 0.07 * bodyScale, 0.3 * bodyScale, 24),
      skinMaterial
    );
    upperLeg.position.set(0.12 * bodyScale * i, 0.05 * bodyScale, 0);
    upperLeg.rotation.x = Math.PI / 16;
    group.add(upperLeg);
    
    // Knee cap
    const kneeCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.04 * bodyScale, 20, 20),
      skinMaterial
    );
    kneeCap.position.set(0.12 * bodyScale * i, -0.05 * bodyScale, 0.02 * bodyScale);
    group.add(kneeCap);
    
    // Lower leg (calf)
    const lowerLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055 * bodyScale, 0.065 * bodyScale, 0.25 * bodyScale, 20),
      skinMaterial
    );
    lowerLeg.position.set(0.12 * bodyScale * i, -0.15 * bodyScale, 0.03 * bodyScale);
    lowerLeg.rotation.x = Math.PI / 10;
    group.add(lowerLeg);
    
    // Ankle
    const ankle = new THREE.Mesh(
      new THREE.SphereGeometry(0.035 * bodyScale, 16, 16),
      skinMaterial
    );
    ankle.position.set(0.12 * bodyScale * i, -0.25 * bodyScale, 0.04 * bodyScale);
    group.add(ankle);
    
    // Foot (detailed)
    const foot = new THREE.Mesh(
      new THREE.BoxGeometry(0.1 * bodyScale, 0.05 * bodyScale, 0.2 * bodyScale),
      skinMaterial
    );
    foot.position.set(0.12 * bodyScale * i, -0.3 * bodyScale, 0.1 * bodyScale);
    group.add(foot);
    
    // Toes
    for (let j = 0; j < 5; j++) {
      const toe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012 * bodyScale, 0.008 * bodyScale, 0.03 * bodyScale, 12),
        skinMaterial
      );
      toe.position.set(0.12 * bodyScale * i + (j - 2) * 0.02 * bodyScale, -0.3 * bodyScale, 0.2 * bodyScale);
      toe.rotation.x = Math.PI / 6;
      group.add(toe);
    }
  }
  
  // === DETAILED ACCESSORIES ===
  // Belt (detailed)
  const belt = new THREE.Mesh(
    new THREE.TorusGeometry(0.15 * bodyScale, 0.02 * bodyScale, 12, 40),
    darkMaterial
  );
  belt.position.set(0, 0.15 * bodyScale, 0);
  belt.rotation.x = Math.PI / 2;
  group.add(belt);
  
  // Belt buckle (detailed)
  const buckle = new THREE.Mesh(
    new THREE.BoxGeometry(0.06 * bodyScale, 0.03 * bodyScale, 0.03 * bodyScale),
    goldMaterial
  );
  buckle.position.set(0, 0.15 * bodyScale, 0.02 * bodyScale);
  group.add(buckle);
  
  // Armbands (detailed)
  for (let i = -1; i <= 1; i += 2) {
    const armband = new THREE.Mesh(
      new THREE.TorusGeometry(0.055 * bodyScale, 0.015 * bodyScale, 12, 28),
      accentMaterial
    );
    armband.position.set(0.3 * bodyScale * i, 0.35 * bodyScale, 0);
    armband.rotation.y = Math.PI / 2;
    group.add(armband);
    
    // Armband decoration
    const decoration = new THREE.Mesh(
      new THREE.SphereGeometry(0.012 * bodyScale, 12, 12),
      goldMaterial
    );
    decoration.position.set(0.3 * bodyScale * i, 0.35 * bodyScale, 0.055 * bodyScale);
    group.add(decoration);
  }
  
  // === ROLE-SPECIFIC WEAPONS & EQUIPMENT ===
  if (role === 'ranged') {
    // Large bow (detailed)
    const bow = new THREE.Mesh(
      new THREE.TorusGeometry(0.25 * weaponScale, 0.02 * weaponScale, 12, 56, Math.PI),
      darkMaterial
    );
    bow.position.set(0.6 * bodyScale, 0.4 * bodyScale, 0.15 * bodyScale);
    bow.rotation.z = Math.PI / 2;
    group.add(bow);
    
    // Bow string
    const bowString = new THREE.Mesh(
      new THREE.CylinderGeometry(0.002 * weaponScale, 0.002 * weaponScale, 0.5 * weaponScale, 8),
      darkMaterial
    );
    bowString.position.set(0.6 * bodyScale, 0.4 * bodyScale, 0.15 * bodyScale);
    bowString.rotation.z = Math.PI / 2;
    group.add(bowString);
    
    // Quiver (detailed)
    const quiver = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04 * weaponScale, 0.05 * weaponScale, 0.25 * weaponScale, 20),
      clothMaterial
    );
    quiver.position.set(-0.2 * bodyScale, 0.5 * bodyScale, -0.15 * bodyScale);
    quiver.rotation.x = Math.PI / 4;
    group.add(quiver);
    
    // Arrows in quiver
    for (let i = 0; i < 6; i++) {
      const arrow = new THREE.Mesh(
        new THREE.CylinderGeometry(0.003 * weaponScale, 0.003 * weaponScale, 0.2 * weaponScale, 8),
        darkMaterial
      );
      arrow.position.set(-0.2 * bodyScale, 0.5 * bodyScale + i * 0.03 * weaponScale, -0.15 * bodyScale);
      arrow.rotation.x = Math.PI / 4;
      group.add(arrow);
    }
  } else if (role === 'magic') {
    // Large staff (detailed)
    const staff = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025 * weaponScale, 0.025 * weaponScale, 0.5 * weaponScale, 20),
      darkMaterial
    );
    staff.position.set(0.6 * bodyScale, 0.3 * bodyScale, 0.15 * bodyScale);
    group.add(staff);
    
    // Staff orb (detailed)
    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(0.05 * weaponScale, 32, 32),
      accentMaterial
    );
    orb.position.set(0.6 * bodyScale, 0.55 * bodyScale, 0.15 * bodyScale);
    group.add(orb);
    
    // Staff gem
    const gem = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.02 * weaponScale),
      goldMaterial
    );
    gem.position.set(0.6 * bodyScale, 0.55 * bodyScale, 0.2 * bodyScale);
    group.add(gem);
    
    // Robe (detailed)
    const robe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22 * bodyScale, 0.24 * bodyScale, 0.35 * bodyScale, 40),
      clothMaterial
    );
    robe.position.y = 0.15 * bodyScale;
    group.add(robe);
    
    // Robe trim
    const robeTrim = new THREE.Mesh(
      new THREE.TorusGeometry(0.24 * bodyScale, 0.025 * bodyScale, 8, 40),
      goldMaterial
    );
    robeTrim.position.y = 0.3 * bodyScale;
    robeTrim.rotation.x = Math.PI / 2;
    group.add(robeTrim);
    
    // Magic aura (enhanced)
    const aura = new THREE.Mesh(
      new THREE.SphereGeometry(0.3 * bodyScale, 32, 32),
      new THREE.MeshStandardMaterial({ 
        color: 0x8e54e9, 
        transparent: true, 
        opacity: 0.12, 
        emissive: 0x8e54e9, 
        emissiveIntensity: 0.7 
      })
    );
    aura.position.set(0, 0.4 * bodyScale, 0);
    group.add(aura);
  } else if (role === 'defender') {
    // Large shield (detailed)
    const shield = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15 * weaponScale, 0.15 * weaponScale, 0.04 * weaponScale, 40),
      goldMaterial
    );
    shield.position.set(-0.4 * bodyScale, 0.35 * bodyScale, 0.15 * bodyScale);
    shield.rotation.x = Math.PI / 2;
    group.add(shield);
    
    // Shield boss
    const shieldBoss = new THREE.Mesh(
      new THREE.SphereGeometry(0.04 * weaponScale, 20, 20),
      goldMaterial
    );
    shieldBoss.position.set(-0.4 * bodyScale, 0.35 * bodyScale, 0.19 * bodyScale);
    group.add(shieldBoss);
    
    // One-handed sword (detailed)
    const sword = new THREE.Mesh(
      new THREE.BoxGeometry(0.04 * weaponScale, 0.25 * weaponScale, 0.02 * weaponScale),
      silverMaterial
    );
    sword.position.set(0.6 * bodyScale, 0.35 * bodyScale, 0.15 * bodyScale);
    group.add(sword);
    
    // Sword guard
    const swordGuard = new THREE.Mesh(
      new THREE.BoxGeometry(0.08 * weaponScale, 0.02 * weaponScale, 0.035 * weaponScale),
      goldMaterial
    );
    swordGuard.position.set(0.6 * bodyScale, 0.25 * bodyScale, 0.15 * bodyScale);
    group.add(swordGuard);
    
    // Sword pommel
    const swordPommel = new THREE.Mesh(
      new THREE.SphereGeometry(0.02 * weaponScale, 16, 16),
      goldMaterial
    );
    swordPommel.position.set(0.6 * bodyScale, 0.15 * bodyScale, 0.15 * bodyScale);
    group.add(swordPommel);
    
    // Heavy armor (detailed)
    const armor = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22 * bodyScale, 0.24 * bodyScale, 0.25 * bodyScale, 40),
      armorMaterial
    );
    armor.position.y = 0.45 * bodyScale;
    group.add(armor);
    
    // Armor pauldrons
    for (let i = -1; i <= 1; i += 2) {
      const pauldron = new THREE.Mesh(
        new THREE.SphereGeometry(0.08 * bodyScale, 20, 20),
        armorMaterial
      );
      pauldron.position.set(0.28 * bodyScale * i, 0.6 * bodyScale, 0);
      group.add(pauldron);
    }
  } else {
    // Melee: large sword/axe/spear (detailed)
    const sword = new THREE.Mesh(
      new THREE.BoxGeometry(0.05 * weaponScale, 0.35 * weaponScale, 0.025 * weaponScale),
      silverMaterial
    );
    sword.position.set(0.6 * bodyScale, 0.35 * bodyScale, 0.15 * bodyScale);
    group.add(sword);
    
    // Sword guard
    const swordGuard = new THREE.Mesh(
      new THREE.BoxGeometry(0.1 * weaponScale, 0.025 * weaponScale, 0.04 * weaponScale),
      goldMaterial
    );
    swordGuard.position.set(0.6 * bodyScale, 0.2 * bodyScale, 0.15 * bodyScale);
    group.add(swordGuard);
    
    // Sword pommel
    const swordPommel = new THREE.Mesh(
      new THREE.SphereGeometry(0.025 * weaponScale, 20, 20),
      goldMaterial
    );
    swordPommel.position.set(0.6 * bodyScale, 0.1 * bodyScale, 0.15 * bodyScale);
    group.add(swordPommel);
    
    // Medium armor (detailed)
    const armor = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22 * bodyScale, 0.24 * bodyScale, 0.2 * bodyScale, 40),
      armorMaterial
    );
    armor.position.y = 0.4 * bodyScale;
    group.add(armor);
  }
  
  // === ADDITIONAL DETAILS ===
  // Neck
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12 * bodyScale, 0.15 * bodyScale, 0.12 * bodyScale, 20),
    skinMaterial
  );
  neck.position.y = 0.65 * bodyScale;
  group.add(neck);
  
  // Waist
  const waist = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18 * bodyScale, 0.2 * bodyScale, 0.08 * bodyScale, 24),
    skinMaterial
  );
  waist.position.y = 0.12 * bodyScale;
  group.add(waist);
  
  // === COOL GENERAL ENHANCEMENTS ===
  
  // Helmet/Crown based on type
  if (isElite || isLegendary) {
    // Crown for elite/legendary generals
    const crown = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2 * headScale, 0.22 * headScale, 0.08 * headScale, 16),
      goldMaterial
    );
    crown.position.y = 0.85 * bodyScale;
    group.add(crown);
    
    // Crown jewels
    for (let i = 0; i < 5; i++) {
      const jewel = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.015 * headScale),
        new THREE.MeshStandardMaterial({ 
          color: [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff][i], 
          roughness: 0.1, 
          metalness: 0.9,
          emissive: [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff][i],
          emissiveIntensity: 0.3
        })
      );
      jewel.position.set((i - 2) * 0.06 * headScale, 0.89 * bodyScale, 0.22 * headScale);
      group.add(jewel);
    }
  } else if (isHeavy) {
    // Helmet for heavy generals
    const helmet = new THREE.Mesh(
      new THREE.SphereGeometry(0.2 * headScale, 20, 20),
      armorMaterial
    );
    helmet.position.y = 0.85 * bodyScale;
    group.add(helmet);
    
    // Helmet visor
    const visor = new THREE.Mesh(
      new THREE.BoxGeometry(0.3 * headScale, 0.05 * headScale, 0.02 * headScale),
      darkMaterial
    );
    visor.position.set(0, 0.8 * bodyScale, 0.2 * headScale);
    group.add(visor);
  }
  
  // Cape/Cloak for dramatic effect
  const cape = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25 * bodyScale, 0.3 * bodyScale, 0.4 * bodyScale, 24),
    new THREE.MeshStandardMaterial({ 
      color: isPlayer ? 0x1da1f2 : 0xff5e62, 
      roughness: 0.8, 
      metalness: 0.1,
      transparent: true,
      opacity: 0.8
    })
  );
  cape.position.set(0, 0.2 * bodyScale, -0.1 * bodyScale);
  group.add(cape);
  
  // Cape trim
  const capeTrim = new THREE.Mesh(
    new THREE.TorusGeometry(0.25 * bodyScale, 0.02 * bodyScale, 8, 24),
    goldMaterial
  );
  capeTrim.position.set(0, 0.4 * bodyScale, -0.1 * bodyScale);
  capeTrim.rotation.x = Math.PI / 2;
  group.add(capeTrim);
  
  // Glowing aura effect
  const aura = new THREE.Mesh(
    new THREE.SphereGeometry(0.35 * bodyScale, 32, 32),
    new THREE.MeshStandardMaterial({ 
      color: isPlayer ? 0x1da1f2 : 0xff5e62, 
      transparent: true, 
      opacity: 0.15, 
      emissive: isPlayer ? 0x1da1f2 : 0xff5e62, 
      emissiveIntensity: 0.4 
    })
  );
  aura.position.set(0, 0.4 * bodyScale, 0);
  group.add(aura);
  
  // Inner aura (more intense)
  const innerAura = new THREE.Mesh(
    new THREE.SphereGeometry(0.25 * bodyScale, 24, 24),
    new THREE.MeshStandardMaterial({ 
      color: isPlayer ? 0x1da1f2 : 0xff5e62, 
      transparent: true, 
      opacity: 0.25, 
      emissive: isPlayer ? 0x1da1f2 : 0xff5e62, 
      emissiveIntensity: 0.6 
    })
  );
  innerAura.position.set(0, 0.4 * bodyScale, 0);
  group.add(innerAura);
  
  // Floating energy orbs around the general
  for (let i = 0; i < 3; i++) {
    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(0.03 * bodyScale, 16, 16),
      new THREE.MeshStandardMaterial({ 
        color: isPlayer ? 0x00e0ff : 0xff6b6b, 
        transparent: true, 
        opacity: 0.8, 
        emissive: isPlayer ? 0x00e0ff : 0xff6b6b, 
        emissiveIntensity: 0.7 
      })
    );
    const angle = (i / 3) * Math.PI * 2;
    orb.position.set(
      Math.cos(angle) * 0.3 * bodyScale, 
      0.4 * bodyScale + Math.sin(angle * 3) * 0.1 * bodyScale, 
      Math.sin(angle) * 0.3 * bodyScale
    );
    group.add(orb);
  }
  
  // Ground energy effect
  const groundEffect = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4 * bodyScale, 0.5 * bodyScale, 0.02 * bodyScale, 32),
    new THREE.MeshStandardMaterial({ 
      color: isPlayer ? 0x1da1f2 : 0xff5e62, 
      transparent: true, 
      opacity: 0.3, 
      emissive: isPlayer ? 0x1da1f2 : 0xff5e62, 
      emissiveIntensity: 0.5 
    })
  );
  groundEffect.position.set(0, 0.01 * bodyScale, 0);
  group.add(groundEffect);
  
  // Energy particles (small glowing spheres)
  for (let i = 0; i < 8; i++) {
    const particle = new THREE.Mesh(
      new THREE.SphereGeometry(0.008 * bodyScale, 8, 8),
      new THREE.MeshStandardMaterial({ 
        color: isPlayer ? 0x00e0ff : 0xff6b6b, 
        transparent: true, 
        opacity: 0.9, 
        emissive: isPlayer ? 0x00e0ff : 0xff6b6b, 
        emissiveIntensity: 1.0 
      })
    );
    const angle = (i / 8) * Math.PI * 2;
    const radius = 0.25 * bodyScale + Math.random() * 0.1 * bodyScale;
    particle.position.set(
      Math.cos(angle) * radius, 
      0.2 * bodyScale + Math.random() * 0.4 * bodyScale, 
      Math.sin(angle) * radius
    );
    group.add(particle);
  }
  
  // Shoulder armor spikes for intimidation
  for (let i = -1; i <= 1; i += 2) {
    const spike = new THREE.Mesh(
      new THREE.ConeGeometry(0.015 * bodyScale, 0.08 * bodyScale, 8),
      goldMaterial
    );
    spike.position.set(0.25 * bodyScale * i, 0.6 * bodyScale, 0.07 * bodyScale);
    spike.rotation.z = i * Math.PI / 6;
    group.add(spike);
  }
  
  // Belt pouches and accessories
  for (let i = -1; i <= 1; i += 2) {
    const pouch = new THREE.Mesh(
      new THREE.BoxGeometry(0.06 * bodyScale, 0.08 * bodyScale, 0.04 * bodyScale),
      darkMaterial
    );
    pouch.position.set(0.15 * bodyScale * i, 0.15 * bodyScale, 0.02 * bodyScale);
    group.add(pouch);
    
    // Pouch decoration
    const pouchDeco = new THREE.Mesh(
      new THREE.SphereGeometry(0.015 * bodyScale, 8, 8),
      goldMaterial
    );
    pouchDeco.position.set(0.15 * bodyScale * i, 0.15 * bodyScale, 0.06 * bodyScale);
    group.add(pouchDeco);
  }
  
  // Enhanced weapon glow for legendary generals
  if (isLegendary) {
    // Weapon aura
    const weaponAura = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08 * weaponScale, 0.08 * weaponScale, 0.4 * weaponScale, 16),
      new THREE.MeshStandardMaterial({ 
        color: 0xffd700, 
        transparent: true, 
        opacity: 0.4, 
        emissive: 0xffd700, 
        emissiveIntensity: 0.8 
      })
    );
    weaponAura.position.set(0.6 * bodyScale, 0.35 * bodyScale, 0.15 * bodyScale);
    group.add(weaponAura);
  }
  
  // === FACING DIRECTION ===
  // Enemy generals should face the opposite direction from player generals
  if (!isPlayer) {
    group.rotation.y = Math.PI; // Rotate 180 degrees to face the player
  }
  
  // === FIDELITY MEASUREMENT ===
  measureTroopFidelity(group, prompt, 'general', role);
  
  // Return the mesh
  return { mesh: group };
}

function determineGeneralVariant(prompt, generalType) {
  const variants = getTroopVariants()[generalType];
  let bestMatch = variants[0];
  let maxScore = 0;
  
  variants.forEach(variant => {
    let score = 0;
    variant.keywords.forEach(keyword => {
      if (prompt.includes(keyword)) {
        score += 1;
      }
    });
    if (score > maxScore) {
      maxScore = score;
      bestMatch = variant;
    }
  });
  
  return bestMatch;
}

function addGeneralVariantBody(group, variant, bodyScale, color, gray, dark, accent, gold) {
  // Body (larger than regular troops)
  const body = new THREE.BoxGeometry(0.5 * bodyScale, 0.8 * bodyScale, 0.3 * bodyScale);
  const bodyMesh = new THREE.Mesh(body, new THREE.MeshLambertMaterial({color}));
  bodyMesh.position.y = 0.4;
  bodyMesh.castShadow = true;
  group.add(bodyMesh);
  
  // Enhanced chest plate for generals
  const chest = new THREE.Mesh(
    new THREE.BoxGeometry(0.35 * bodyScale, 0.12 * bodyScale, 0.25 * bodyScale),
    new THREE.MeshLambertMaterial({color: gray})
  );
  chest.position.y = 0.45;
  group.add(chest);
  
  // Add decorative chest details
  const chestDetail = new THREE.Mesh(
    new THREE.BoxGeometry(0.2 * bodyScale, 0.05 * bodyScale, 0.02 * bodyScale),
    new THREE.MeshLambertMaterial({color: gold})
  );
  chestDetail.position.y = 0.5;
  group.add(chestDetail);
}

function addGeneralVariantDetails(group, variant, generalType, color, gray, dark, accent, weaponScale, gold, silver) {
  // Add weapon based on variant
  addGeneralWeapon(group, variant, generalType, weaponScale, dark, accent, gold, silver);
  
  // Add armor/accessories based on variant
  addGeneralArmor(group, variant, color, gray, dark, gold, silver);
  
  // Add special effects based on variant
  addGeneralSpecialEffects(group, variant, accent, gold);
}

function addGeneralWeapon(group, variant, generalType, weaponScale, dark, accent, gold, silver) {
  const weaponType = variant.weapon;
  
  if (generalType === 'melee') {
    addGeneralMeleeWeapon(group, weaponType, weaponScale, dark, gold, silver);
  } else if (generalType === 'ranged') {
    addGeneralRangedWeapon(group, weaponType, weaponScale, dark, accent);
  } else if (generalType === 'magic') {
    addGeneralMagicWeapon(group, weaponType, weaponScale, accent, gold);
  }
}

function addGeneralMeleeWeapon(group, weaponType, weaponScale, dark, gold, silver) {
  let weapon;
  
  if (weaponType === 'sword' || weaponType === 'broadsword') {
    // Sword blade
    weapon = new THREE.Mesh(
      new THREE.BoxGeometry(0.08 * weaponScale, 0.8 * weaponScale, 0.03 * weaponScale),
      new THREE.MeshLambertMaterial({color: silver})
    );
    weapon.position.set(0.5, 0.5, 0);
    group.add(weapon);
    
    // Sword hilt
    const hilt = new THREE.Mesh(
      new THREE.BoxGeometry(0.12 * weaponScale, 0.15 * weaponScale, 0.05 * weaponScale),
      new THREE.MeshLambertMaterial({color: gold})
    );
    hilt.position.set(0.5, 0.15, 0);
    group.add(hilt);
    
    // Sword guard
    const guard = new THREE.Mesh(
      new THREE.BoxGeometry(0.2 * weaponScale, 0.05 * weaponScale, 0.08 * weaponScale),
      new THREE.MeshLambertMaterial({color: gold})
    );
    guard.position.set(0.5, 0.22, 0);
    group.add(guard);
  } else if (weaponType === 'axe' || weaponType === 'battleaxe') {
    // Axe head
    weapon = new THREE.Mesh(
      new THREE.BoxGeometry(0.15 * weaponScale, 0.4 * weaponScale, 0.08 * weaponScale),
      new THREE.MeshLambertMaterial({color: silver})
    );
    weapon.position.set(0.5, 0.5, 0);
    group.add(weapon);
    
    // Axe handle
    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03 * weaponScale, 0.03 * weaponScale, 0.6 * weaponScale, 6),
      new THREE.MeshLambertMaterial({color: dark})
    );
    handle.position.set(0.5, 0.3, 0);
    group.add(handle);
  } else {
    // Default weapon
    weapon = new THREE.Mesh(
      new THREE.BoxGeometry(0.08 * weaponScale, 0.6 * weaponScale, 0.05 * weaponScale),
      new THREE.MeshLambertMaterial({color: dark})
    );
    weapon.position.set(0.5, 0.5, 0);
    group.add(weapon);
  }
}

function addGeneralRangedWeapon(group, weaponType, weaponScale, dark, accent) {
  let weapon;
  
  if (weaponType === 'longbow' || weaponType === 'composite_bow') {
    weapon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03 * weaponScale, 0.03 * weaponScale, 0.6 * weaponScale, 6),
      new THREE.MeshLambertMaterial({color: dark})
    );
    weapon.position.set(0.5, 0.5, 0);
    weapon.rotation.z = Math.PI / 2;
    group.add(weapon);
  } else if (weaponType === 'rifle' || weaponType === 'sniper_rifle') {
    weapon = new THREE.Mesh(
      new THREE.BoxGeometry(0.05 * weaponScale, 0.03 * weaponScale, 0.4 * weaponScale),
      new THREE.MeshLambertMaterial({color: dark})
    );
    weapon.position.set(0.5, 0.5, 0);
    group.add(weapon);
  } else {
    // Default ranged weapon
    weapon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03 * weaponScale, 0.03 * weaponScale, 0.5 * weaponScale, 6),
      new THREE.MeshLambertMaterial({color: dark})
    );
    weapon.position.set(0.5, 0.5, 0);
    weapon.rotation.z = Math.PI / 2;
    group.add(weapon);
  }
}

function addGeneralMagicWeapon(group, weaponType, weaponScale, accent, gold) {
  let weapon;
  
  if (weaponType === 'staff' || weaponType === 'nature_staff') {
    // Staff shaft
    weapon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04 * weaponScale, 0.04 * weaponScale, 0.6 * weaponScale, 6),
      new THREE.MeshLambertMaterial({color: dark})
    );
    weapon.position.set(0.4, 0.5, 0);
    group.add(weapon);
    
    // Staff orb
    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(0.08 * weaponScale, 8, 8),
      new THREE.MeshLambertMaterial({color: accent, emissive: accent, emissiveIntensity: 0.3})
    );
    orb.position.set(0.4, 0.8, 0);
    group.add(orb);
  } else if (weaponType === 'wand') {
    weapon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02 * weaponScale, 0.02 * weaponScale, 0.3 * weaponScale, 6),
      new THREE.MeshLambertMaterial({color: gold})
    );
    weapon.position.set(0.4, 0.5, 0);
    group.add(weapon);
  } else {
    // Default magic weapon
    weapon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04 * weaponScale, 0.04 * weaponScale, 0.5 * weaponScale, 6),
      new THREE.MeshLambertMaterial({color: accent})
    );
    weapon.position.set(0.4, 0.5, 0);
    group.add(weapon);
  }
}

function addGeneralArmor(group, variant, color, gray, dark, gold, silver) {
  // Enhanced shoulder pads for generals
  const shoulderPad = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.08, 0.12),
    new THREE.MeshLambertMaterial({color: gray})
  );
  shoulderPad.position.set(0.35, 0.6, 0);
  group.add(shoulderPad);
  
  const shoulderPad2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.08, 0.12),
    new THREE.MeshLambertMaterial({color: gray})
  );
  shoulderPad2.position.set(-0.35, 0.6, 0);
  group.add(shoulderPad2);
  
  // Enhanced leg armor for generals
  const legArmor = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.25, 0.08),
    new THREE.MeshLambertMaterial({color: gray})
  );
  legArmor.position.set(0.12, 0.05, 0);
  group.add(legArmor);
  
  const legArmor2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.25, 0.08),
    new THREE.MeshLambertMaterial({color: gray})
  );
  legArmor2.position.set(-0.12, 0.05, 0);
  group.add(legArmor2);
  
  // Belt for generals
  const belt = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.05, 0.2),
    new THREE.MeshLambertMaterial({color: dark})
  );
  belt.position.set(0, 0.2, 0);
  group.add(belt);
  
  // Belt buckle
  const buckle = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.06, 0.02),
    new THREE.MeshLambertMaterial({color: gold})
  );
  buckle.position.set(0, 0.23, 0.11);
  group.add(buckle);
}

function addGeneralSpecialEffects(group, variant, accent, gold) {
  // Add glowing effects for magic users
  if (variant.special.includes('fire') || variant.special.includes('flame')) {
    const fireEffect = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 8, 8),
      new THREE.MeshLambertMaterial({color: 0xff4400, emissive: 0xff2200, emissiveIntensity: 0.7})
    );
    fireEffect.position.set(0, 1.2, 0);
    group.add(fireEffect);
  }
  
  // Add lightning effects
  if (variant.special.includes('lightning') || variant.special.includes('thunder')) {
    const lightningEffect = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 8, 8),
      new THREE.MeshLambertMaterial({color: accent, emissive: accent, emissiveIntensity: 0.9})
    );
    lightningEffect.position.set(0, 1.2, 0);
    group.add(lightningEffect);
  }
}

// Add procedural visual details based on general description
function addGeneralProceduralDetails(group, prompt, color, gray, dark, accent, gold, silver) {
  // Add crown/helmet variations for generals
  if (prompt.includes('elite') || prompt.includes('royal') || prompt.includes('knight')) {
    const crown = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.15, 0.35),
      new THREE.MeshLambertMaterial({color: gold})
    );
    crown.position.set(0, 1.05, 0);
    group.add(crown);
    
    // Crown jewels
    const jewel = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 8, 8),
      new THREE.MeshLambertMaterial({color: accent, emissive: accent, emissiveIntensity: 0.5})
    );
    jewel.position.set(0, 1.12, 0.18);
    group.add(jewel);
  } else if (prompt.includes('stealth') || prompt.includes('ninja')) {
    const hood = new THREE.Mesh(
      new THREE.ConeGeometry(0.18, 0.25, 8),
      new THREE.MeshLambertMaterial({color: dark})
    );
    hood.position.set(0, 1.1, 0);
    group.add(hood);
  } else {
    // Default general helmet
    const helmet = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.2, 0.3),
      new THREE.MeshLambertMaterial({color: dark})
    );
    helmet.position.set(0, 1.05, 0);
    group.add(helmet);
  }
  
  // Add cape for elite/veteran generals
  if (prompt.includes('elite') || prompt.includes('veteran') || prompt.includes('royal') || prompt.includes('legendary')) {
    const cape = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.5, 0.03),
      new THREE.MeshLambertMaterial({color: dark})
    );
    cape.position.set(0, 0.4, -0.18);
    group.add(cape);
    
    // Cape clasp
    const clasp = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.05, 0.02),
      new THREE.MeshLambertMaterial({color: gold})
    );
    clasp.position.set(0, 0.65, -0.2);
    group.add(clasp);
  }
  
  // Add shoulder armor for heavy generals
  if (prompt.includes('heavy') || prompt.includes('armor') || prompt.includes('tank')) {
    const shoulderArmor = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.12, 0.15),
      new THREE.MeshLambertMaterial({color: silver})
    );
    shoulderArmor.position.set(0.4, 0.66, 0);
    group.add(shoulderArmor);
    
    const shoulderArmor2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.12, 0.15),
      new THREE.MeshLambertMaterial({color: silver})
    );
    shoulderArmor2.position.set(-0.4, 0.66, 0);
    group.add(shoulderArmor2);
  }
  
  // Add enhanced leg armor for armored generals
  if (prompt.includes('armor') || prompt.includes('protected')) {
    const legArmor = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.3, 0.1),
      new THREE.MeshLambertMaterial({color: silver})
    );
    legArmor.position.set(0.15, 0.05, 0);
    group.add(legArmor);
    
    const legArmor2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.3, 0.1),
      new THREE.MeshLambertMaterial({color: silver})
    );
    legArmor2.position.set(-0.15, 0.05, 0);
    group.add(legArmor2);
  }
  
  // Add magic effects for magic generals
  if (prompt.includes('magic') || prompt.includes('wizard') || prompt.includes('mage')) {
    const magicAura = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 8, 8),
      new THREE.MeshLambertMaterial({color: accent, transparent: true, opacity: 0.3})
    );
    magicAura.position.set(0, 0.4, 0);
    group.add(magicAura);
  }
  
  // Add legendary effects for legendary generals
  if (prompt.includes('legendary') || prompt.includes('hero') || prompt.includes('champion')) {
    const legendaryAura = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 8, 8),
      new THREE.MeshLambertMaterial({color: gold, transparent: true, opacity: 0.2})
    );
    legendaryAura.position.set(0, 0.4, 0);
    group.add(legendaryAura);
  }
  
  // Add random accessories for generals (40% chance)
  if (Math.random() < 0.4) {
    const accessories = [
      () => {
        const pouch = new THREE.Mesh(
          new THREE.BoxGeometry(0.12, 0.08, 0.06),
          new THREE.MeshLambertMaterial({color: dark})
        );
        pouch.position.set(-0.3, 0.25, 0);
        group.add(pouch);
      },
      () => {
        const bandolier = new THREE.Mesh(
          new THREE.BoxGeometry(0.4, 0.03, 0.03),
          new THREE.MeshLambertMaterial({color: dark})
        );
        bandolier.position.set(0, 0.7, 0);
        bandolier.rotation.z = Math.PI / 4;
        group.add(bandolier);
      },
      () => {
        const badge = new THREE.Mesh(
          new THREE.CircleGeometry(0.05, 8),
          new THREE.MeshLambertMaterial({color: gold})
        );
        badge.position.set(0.25, 0.5, 0.18);
        badge.rotation.x = Math.PI / 2;
        group.add(badge);
      },
      () => {
        const amulet = new THREE.Mesh(
          new THREE.SphereGeometry(0.04, 8, 8),
          new THREE.MeshLambertMaterial({color: accent, emissive: accent, emissiveIntensity: 0.3})
        );
        amulet.position.set(0, 0.6, 0.16);
        group.add(amulet);
      }
    ];
    
    const randomAccessory = accessories[Math.floor(Math.random() * accessories.length)];
    randomAccessory();
  }
  // --- ENHANCED HEAD/FACE DETAIL in addGeneralProceduralDetails ---
  // Add enhanced facial features
  if (Math.random() < 0.7) {
    // Nose
    const nose = new THREE.Mesh(
      new THREE.ConeGeometry(0.05, 0.12, 8),
      new THREE.MeshLambertMaterial({color: gray})
    );
    nose.position.set(0, 1.0, 0.13);
    nose.rotation.x = Math.PI / 2;
    group.add(nose);
    // Mouth
    const mouth = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.03, 0.01),
      new THREE.MeshLambertMaterial({color: dark})
    );
    mouth.position.set(0, 0.93, 0.13);
    group.add(mouth);
    // Eyebrows
    const browL = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.015, 0.01),
      new THREE.MeshLambertMaterial({color: dark})
    );
    browL.position.set(-0.06, 1.07, 0.13);
    browL.rotation.z = Math.PI / 12;
    group.add(browL);
    const browR = browL.clone();
    browR.position.x = 0.06;
    browR.rotation.z = -Math.PI / 12;
    group.add(browR);
    // Facial hair (random)
    if (Math.random() < 0.5) {
      const beard = new THREE.Mesh(
        new THREE.ConeGeometry(0.09, 0.18, 8),
        new THREE.MeshLambertMaterial({color: dark})
      );
      beard.position.set(0, 0.88, 0.13);
      beard.rotation.x = Math.PI / 2;
      group.add(beard);
    }
  }
  // Add helmet/crown/hood variations
  if (prompt.includes('plume') || Math.random() < 0.2) {
    const plume = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.35, 8),
      new THREE.MeshLambertMaterial({color: accent})
    );
    plume.position.set(0, 1.22, 0);
    group.add(plume);
  }
  if (prompt.includes('horn') || Math.random() < 0.15) {
    for (let i = -1; i <= 1; i += 2) {
      const horn = new THREE.Mesh(
        new THREE.ConeGeometry(0.04, 0.18, 8),
        new THREE.MeshLambertMaterial({color: gold})
      );
      horn.position.set(0.13 * i, 1.13, 0.08);
      horn.rotation.z = i === -1 ? Math.PI / 6 : -Math.PI / 6;
      horn.rotation.x = -Math.PI / 8;
      group.add(horn);
    }
  }
  // --- ENHANCED CAPE/CLASP ---
  if (prompt.includes('cape') || Math.random() < 0.2) {
    const fancyCape = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.6, 0.04),
      new THREE.MeshLambertMaterial({color: accent})
    );
    fancyCape.position.set(0, 0.35, -0.22);
    group.add(fancyCape);
    // Cape trim
    const trim = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.04, 0.045),
      new THREE.MeshLambertMaterial({color: gold})
    );
    trim.position.set(0, 0.05, -0.24);
    group.add(trim);
  }
  // --- ENHANCED ARMOR LAYERS in addGeneralArmor ---
  // Add layered chest armor
  const chestLayer = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.08, 0.22),
    new THREE.MeshLambertMaterial({color: gold})
  );
  chestLayer.position.y = 0.5;
  group.add(chestLayer);
  // Arm guards
  for (let i = -1; i <= 1; i += 2) {
    const armGuard = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.13, 0.09),
      new THREE.MeshLambertMaterial({color: silver})
    );
    armGuard.position.set(0.32 * i, 0.35, 0);
    group.add(armGuard);
  }
  // Shin guards/boots
  for (let i = -1; i <= 1; i += 2) {
    const boot = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.13, 0.09),
      new THREE.MeshLambertMaterial({color: dark})
    );
    boot.position.set(0.09 * i, -0.08, 0.04);
    group.add(boot);
  }
// Weapon glow for legendary/magic
  if (prompt.includes('legendary') || prompt.includes('magic')) {
    const weaponGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 8, 8),
      new THREE.MeshLambertMaterial({color: accent, transparent: true, opacity: 0.18, emissive: accent, emissiveIntensity: 0.5})
    );
    weaponGlow.position.set(0.5, 0.7, 0);
    group.add(weaponGlow);
  }
  // ... existing code ...
  // --- ENHANCED SPECIAL EFFECTS in addGeneralSpecialEffects ---
  if (prompt.includes('legendary') || prompt.includes('hero')) {
    const symbol = new THREE.Mesh(
      new THREE.TorusGeometry(0.18, 0.04, 8, 16),
      new THREE.MeshLambertMaterial({color: gold, emissive: gold, emissiveIntensity: 0.4})
    );
    symbol.position.set(0, 1.35, 0);
    symbol.rotation.x = Math.PI / 2;
    group.add(symbol);
  }
  if (prompt.includes('magic') || prompt.includes('wizard')) {
    for (let i = 0; i < 3; i++) {
      const orb = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 8, 8),
        new THREE.MeshLambertMaterial({color: accent, transparent: true, opacity: 0.5, emissive: accent, emissiveIntensity: 0.5})
      );
      orb.position.set(0.18 * Math.cos(i * 2 * Math.PI / 3), 1.18, 0.18 * Math.sin(i * 2 * Math.PI / 3));
      group.add(orb);
    }
  }
  // ... existing code ...
} 

// === FIDELITY METRICS FUNCTION ===
function measureTroopFidelity(group, prompt, bodyType, subtype) {
  let primitiveCount = 0;
  let polyCount = 0;
  
  group.traverse(obj => {
    if (obj.isMesh && obj.geometry) {
      primitiveCount++;
      try {
        if (obj.geometry.index) {
          polyCount += obj.geometry.index.count / 3;
        } else if (obj.geometry.attributes && obj.geometry.attributes.position) {
          polyCount += obj.geometry.attributes.position.count / 3;
        }
      } catch (error) {
        console.warn('[TroopGen] Error counting polygons for mesh:', error);
      }
    }
  });
  
  // Determine fidelity level
  let fidelityLevel = 'Low';
  if (primitiveCount >= 16 && polyCount >= 2000) {
    fidelityLevel = 'High';
  } else if (primitiveCount >= 7 && polyCount >= 500) {
    fidelityLevel = 'Medium';
  }
  
  console.log(`[TroopGen] Fidelity Metrics for "${prompt}":`);
  console.log(`  - Body Type: ${bodyType} (${subtype})`);
  console.log(`  - Primitives: ${primitiveCount}`);
  console.log(`  - Polygons: ${Math.round(polyCount)}`);
  console.log(`  - Fidelity Level: ${fidelityLevel}`);
  
  return { primitiveCount, polyCount, fidelityLevel };
}