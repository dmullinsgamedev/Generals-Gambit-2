// ============================================================================
// TROOP GENERATION SYSTEM
// ============================================================================

import { TROOP_VARIANTS } from '../data/GameData.js';

// --- Custom 3D Troop Generation ---
export function generateCustomTroopMesh(prompt, isPlayer, troopColor, forcedBodyType, forcedSubtype) {
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
    group = generateBipedTroopMesh(lowerPrompt, role, subtype, skinMaterial, armorMaterial, darkMaterial, accentMaterial, clothMaterial, goldMaterial);
  }

  // Return both the mesh and the chosen bodyType/subtype for saving
  return { mesh: group, bodyType, subtype };
}

// --- BIPED TROOP ---
function generateBipedTroopMesh(lowerPrompt, role, subtype, skinMaterial, armorMaterial, darkMaterial, accentMaterial, clothMaterial, goldMaterial) {
  const group = new THREE.Group();
  
  // Torso (cylinder)
  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.15, 0.45, 18),
    skinMaterial
  );
  torso.position.y = 0.25;
  torso.castShadow = true;
  group.add(torso);

  // Head (sphere)
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 18, 18),
    skinMaterial
  );
  head.position.y = 0.55;
  group.add(head);
  
  // Eyes
  for (let i = -1; i <= 1; i += 2) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    eye.position.set(0.04 * i, 0.58, 0.1);
    group.add(eye);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.01, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    pupil.position.set(0.04 * i, 0.58, 0.12);
    group.add(pupil);
  }
  
  // Nose
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.01, 0.02, 6), skinMaterial);
  nose.position.set(0, 0.54, 0.13);
  nose.rotation.x = Math.PI / 2;
  group.add(nose);
  
  // Mouth
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.01, 0.01), new THREE.MeshBasicMaterial({ color: 0x000000 }));
  mouth.position.set(0, 0.48, 0.12);
  group.add(mouth);
  
  // Ears
  for (let i = -1; i <= 1; i += 2) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.04, 6), skinMaterial);
    ear.position.set(0.12 * i, 0.58, 0);
    ear.rotation.z = Math.PI / 2 * i;
    group.add(ear);
  }

  // --- LIMBS (pose for weapon) ---
  // Arms
  let leftArm, rightArm, leftHand, rightHand;
  if (role === 'ranged') {
    // Drawn bow pose
    leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.22, 12), skinMaterial);
    leftArm.position.set(-0.16, 0.36, 0.05);
    leftArm.rotation.z = Math.PI / 2.5;
    group.add(leftArm);
    rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.22, 12), skinMaterial);
    rightArm.position.set(0.16, 0.36, 0.05);
    rightArm.rotation.z = -Math.PI / 2.5;
    group.add(rightArm);
    // Hands
    leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 10), skinMaterial);
    leftHand.position.set(-0.26, 0.14, 0.07);
    group.add(leftHand);
    rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 10), skinMaterial);
    rightHand.position.set(0.26, 0.14, 0.07);
    group.add(rightHand);
  } else if (role === 'magic') {
    // Staff pose (right hand forward)
    leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.22, 12), skinMaterial);
    leftArm.position.set(-0.16, 0.36, 0);
    leftArm.rotation.z = Math.PI / 4;
    group.add(leftArm);
    rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.22, 12), skinMaterial);
    rightArm.position.set(0.16, 0.36, 0.12);
    rightArm.rotation.z = -Math.PI / 8;
    group.add(rightArm);
    // Hands
    leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 10), skinMaterial);
    leftHand.position.set(-0.26, 0.14, 0.07);
    group.add(leftHand);
    rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 10), skinMaterial);
    rightHand.position.set(0.26, 0.14, 0.17);
    group.add(rightHand);
  } else if (role === 'defender') {
    // Shield pose (left arm forward)
    leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.22, 12), skinMaterial);
    leftArm.position.set(-0.16, 0.36, 0.12);
    leftArm.rotation.z = Math.PI / 8;
    group.add(leftArm);
    rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.22, 12), skinMaterial);
    rightArm.position.set(0.16, 0.36, 0);
    rightArm.rotation.z = -Math.PI / 4;
    group.add(rightArm);
    // Hands
    leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 10), skinMaterial);
    leftHand.position.set(-0.26, 0.14, 0.17);
    group.add(leftHand);
    rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 10), skinMaterial);
    rightHand.position.set(0.26, 0.14, 0.07);
    group.add(rightHand);
  } else {
    // Melee/other: sword pose (right hand forward)
    leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.22, 12), skinMaterial);
    leftArm.position.set(-0.16, 0.36, 0);
    leftArm.rotation.z = Math.PI / 4;
    group.add(leftArm);
    rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.22, 12), skinMaterial);
    rightArm.position.set(0.16, 0.36, 0.12);
    rightArm.rotation.z = -Math.PI / 8;
    group.add(rightArm);
    // Hands
    leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 10), skinMaterial);
    leftHand.position.set(-0.26, 0.14, 0.07);
    group.add(leftHand);
    rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 10), skinMaterial);
    rightHand.position.set(0.26, 0.14, 0.17);
    group.add(rightHand);
  }

  // Legs (same as before)
  for (let i = -1; i <= 1; i += 2) {
    const upperLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.22, 12), skinMaterial);
    upperLeg.position.set(0.07 * i, 0.08, 0);
    upperLeg.rotation.x = Math.PI / 16;
    group.add(upperLeg);
    const lowerLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.18, 12), skinMaterial);
    lowerLeg.position.set(0.07 * i, -0.08, 0.03);
    lowerLeg.rotation.x = Math.PI / 10;
    group.add(lowerLeg);
    // Foot (sphere)
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), skinMaterial);
    foot.position.set(0.07 * i, -0.17, 0.05);
    group.add(foot);
  }

  // --- ACCESSORIES ---
  // Loincloth
  const loincloth = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.13, 12), clothMaterial);
  loincloth.position.set(0, 0.08, 0.09);
  loincloth.rotation.x = Math.PI;
  group.add(loincloth);
  // Belt
  const belt = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.012, 8, 16), darkMaterial);
  belt.position.set(0, 0.18, 0);
  belt.rotation.x = Math.PI / 2;
  group.add(belt);
  // Armbands
  for (let i = -1; i <= 1; i += 2) {
    const armband = new THREE.Mesh(new THREE.TorusGeometry(0.032, 0.008, 8, 12), accentMaterial);
    armband.position.set(0.19 * i, 0.29, 0);
    armband.rotation.y = Math.PI / 2;
    group.add(armband);
  }

  // --- WEAPONS ---
  if (role === 'ranged') {
    // Bow
    const bow = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.01, 8, 16), darkMaterial);
    bow.position.set(0, 0.25, 0.15);
    bow.rotation.x = Math.PI / 2;
    group.add(bow);
  } else if (role === 'magic') {
    // Staff
    const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.4, 8), darkMaterial);
    staff.position.set(0.3, 0.25, 0.2);
    staff.rotation.z = -Math.PI / 6;
    group.add(staff);
    // Staff orb
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), accentMaterial);
    orb.position.set(0.35, 0.45, 0.25);
    group.add(orb);
  } else if (role === 'defender') {
    // Shield
    const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 12), armorMaterial);
    shield.position.set(-0.25, 0.25, 0.2);
    shield.rotation.z = Math.PI / 6;
    group.add(shield);
  } else {
    // Sword
    const sword = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.3, 0.02), darkMaterial);
    sword.position.set(0.35, 0.25, 0.2);
    sword.rotation.z = -Math.PI / 6;
    group.add(sword);
    // Sword handle
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.05, 8), goldMaterial);
    handle.position.set(0.35, 0.1, 0.2);
    handle.rotation.z = -Math.PI / 6;
    group.add(handle);
  }

  return group;
}

// Simplified versions of other body types (keeping the structure but reducing complexity)
function generateQuadrupedTroopMesh(lowerPrompt, role, subtype, skinMaterial, armorMaterial, darkMaterial, accentMaterial, clothMaterial, goldMaterial) {
  const group = new THREE.Group();
  
  // Body
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.6, 12), skinMaterial);
  body.position.y = 0.3;
  body.castShadow = true;
  group.add(body);
  
  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 12), skinMaterial);
  head.position.set(0.4, 0.4, 0);
  group.add(head);
  
  // Legs
  for (let i = -1; i <= 1; i += 2) {
    for (let j = -1; j <= 1; j += 2) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.3, 8), skinMaterial);
      leg.position.set(0.15 * i, 0.15, 0.15 * j);
      group.add(leg);
    }
  }
  
  return group;
}

function generateFlyingTroopMesh(lowerPrompt, role, subtype, skinMaterial, armorMaterial, darkMaterial, accentMaterial, clothMaterial, goldMaterial) {
  const group = new THREE.Group();
  
  // Body
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.4, 12), skinMaterial);
  body.position.y = 0.2;
  group.add(body);
  
  // Wings
  for (let i = -1; i <= 1; i += 2) {
    const wing = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.2), clothMaterial);
    wing.position.set(0.2 * i, 0.3, 0);
    wing.rotation.y = Math.PI / 4 * i;
    group.add(wing);
  }
  
  return group;
}

function generateMountedTroopMesh(lowerPrompt, role, subtype, skinMaterial, armorMaterial, darkMaterial, accentMaterial, clothMaterial, goldMaterial) {
  const group = new THREE.Group();
  
  // Mount body
  const mountBody = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.5, 12), skinMaterial);
  mountBody.position.y = 0.25;
  group.add(mountBody);
  
  // Rider
  const rider = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.3, 12), skinMaterial);
  rider.position.y = 0.55;
  group.add(rider);
  
  return group;
}

function generateInsectoidTroopMesh(lowerPrompt, role, subtype, skinMaterial, armorMaterial, darkMaterial, accentMaterial, clothMaterial, greenMaterial) {
  const group = new THREE.Group();
  
  // Body segments
  for (let i = 0; i < 3; i++) {
    const segment = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), greenMaterial);
    segment.position.set(0, 0.2 + i * 0.15, 0);
    group.add(segment);
  }
  
  // Legs
  for (let i = 0; i < 6; i++) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.2, 6), greenMaterial);
    leg.position.set(Math.cos(i * Math.PI / 3) * 0.1, 0.1, Math.sin(i * Math.PI / 3) * 0.1);
    leg.rotation.z = Math.PI / 4;
    group.add(leg);
  }
  
  return group;
}

// --- TROOP VARIANT DETECTION ---
export function determineTroopVariantFromPrompt(prompt, troopType) {
  const lowerPrompt = prompt.toLowerCase();
  const variants = TROOP_VARIANTS[troopType] || TROOP_VARIANTS.melee;
  
  // Find matching variant by keywords
  for (const variant of variants) {
    for (const keyword of variant.keywords) {
      if (lowerPrompt.includes(keyword)) {
        return variant;
      }
    }
  }
  
  // Return random variant if no match
  return variants[Math.floor(Math.random() * variants.length)];
}

// Only the mannequin-style generateCustomGeneralMesh should remain below.
export function generateCustomGeneralMesh(prompt, isPlayer, generalColor) {
  const lowerPrompt = prompt.toLowerCase();
  
  // Determine general type
  let generalType = 'warrior';
  if (lowerPrompt.match(/(archer|bow|ranged)/)) generalType = 'archer';
  else if (lowerPrompt.match(/(mage|wizard|magic)/)) generalType = 'mage';
  
  // Create materials
  const color = generalColor !== undefined ? generalColor : (isPlayer ? 0x1da1f2 : 0xff5e62);
  const skinMaterial = new THREE.MeshStandardMaterial({ color: color, roughness: 0.5, metalness: 0.1 });
  const armorMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.7, metalness: 0.4 });
  const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.8 });
  
  const group = new THREE.Group();
  
  // Larger, more detailed body for general
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.6, 18), skinMaterial);
  torso.position.y = 0.3;
  torso.castShadow = true;
  group.add(torso);
  
  // Armor
  const armor = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.21, 0.58, 18), armorMaterial);
  armor.position.y = 0.3;
  group.add(armor);
  
  // Head with helmet
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 18, 18), skinMaterial);
  head.position.y = 0.68;
  group.add(head);
  
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.17, 18, 18), goldMaterial);
  helmet.position.y = 0.68;
  group.add(helmet);
  
  // Add weapon based on type
  if (generalType === 'archer') {
    const bow = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.015, 8, 16), new THREE.MeshBasicMaterial({ color: 0x8B4513 }));
    bow.position.set(0, 0.4, 0.2);
    bow.rotation.x = Math.PI / 2;
    group.add(bow);
  } else if (generalType === 'mage') {
    const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.5, 8), new THREE.MeshBasicMaterial({ color: 0x8B4513 }));
    staff.position.set(0.3, 0.35, 0.2);
    staff.rotation.z = -Math.PI / 6;
    group.add(staff);
  } else {
    const sword = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.4, 0.025), new THREE.MeshBasicMaterial({ color: 0x696969 }));
    sword.position.set(0.35, 0.35, 0.2);
    sword.rotation.z = -Math.PI / 6;
    group.add(sword);
  }
  
  return { mesh: group, generalType };
} 