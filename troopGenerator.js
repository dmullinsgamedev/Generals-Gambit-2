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

  // Return both the mesh and the chosen bodyType/subtype for saving
  return { mesh: group, bodyType, subtype };
}

// (Implementations for generateBipedTroopMesh, generateQuadrupedTroopMesh, generateFlyingTroopMesh, generateMountedTroopMesh, generateInsectoidTroopMesh follow, each with subtypes, role-based weapons/equipment, and visual cues.)

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
  
  // --- FACIAL FEATURES (same as before) ---
  // Eyes, pupils, nose, mouth, ears...
  // ... (omitted for brevity)

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

  // --- ROLE-SPECIFIC WEAPONS & EQUIPMENT ---
  if (role === 'ranged') {
    // Large bow
    const bow = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.012, 8, 24, Math.PI), darkMaterial);
    bow.position.set(0.18, 0.23, 0.13);
    bow.rotation.z = Math.PI / 2;
    group.add(bow);
    // Quiver
    const quiver = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.18, 8), clothMaterial);
    quiver.position.set(-0.12, 0.32, -0.13);
    quiver.rotation.x = Math.PI / 4;
    group.add(quiver);
  } else if (role === 'magic') {
    // Large staff
    const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.38, 12), darkMaterial);
    staff.position.set(0.23, 0.18, 0.17);
    group.add(staff);
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 10), accentMaterial);
    orb.position.set(0.23, 0.38, 0.17);
    group.add(orb);
    // Robe
    const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.22, 16), clothMaterial);
    robe.position.y = 0.08;
    group.add(robe);
    // Magic aura
    const aura = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0x8e54e9, transparent: true, opacity: 0.18, emissive: 0x8e54e9, emissiveIntensity: 0.5 })
    );
    aura.position.set(0, 0.25, 0);
    group.add(aura);
  } else if (role === 'defender') {
    // Large shield
    const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.025, 18), goldMaterial);
    shield.position.set(-0.26, 0.18, 0.17);
    shield.rotation.x = Math.PI / 2;
    group.add(shield);
    // One-handed sword
    const sword = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.18, 0.01), armorMaterial);
    sword.position.set(0.26, 0.18, 0.17);
    group.add(sword);
    const hilt = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.015, 0.015), darkMaterial);
    hilt.position.set(0.26, 0.1, 0.17);
    group.add(hilt);
    // Heavy armor
    const armor = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.18, 16), armorMaterial);
    armor.position.y = 0.32;
    group.add(armor);
  } else {
    // Melee: large sword/axe/spear
    const sword = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.28, 0.018), armorMaterial);
    sword.position.set(0.26, 0.18, 0.17);
    group.add(sword);
    const hilt = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.018, 0.018), darkMaterial);
    hilt.position.set(0.26, 0.06, 0.17);
    group.add(hilt);
    // Medium armor
    const armor = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.13, 16), armorMaterial);
    armor.position.y = 0.28;
    group.add(armor);
  }

  // --- ACCESSORIES & ICONS ---
  // Add role-specific icons or patterns (future: shield crest, robe sigil, etc.)

  // Standardize facing: ensure +Z is forward
  group.rotation.y = 0;
  return group;
}

// --- QUADRUPED TROOP ---
function generateQuadrupedTroopMesh(lowerPrompt, role, subtype, skinMaterial, armorMaterial, darkMaterial, accentMaterial, clothMaterial, goldMaterial) {
  const group = new THREE.Group();
  // Body (elongated along +Z)
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 0.5, 18), skinMaterial);
  body.position.y = 0.18;
  body.rotation.x = Math.PI / 2; // Long axis along +Z
  group.add(body);
  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 14), skinMaterial);
  head.position.set(0, 0.28, 0.28); // In front (+Z)
  group.add(head);
  // Legs (4)
  for (let i = -1; i <= 1; i += 2) {
    for (let j = -1; j <= 1; j += 2) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.22, 10), skinMaterial);
      leg.position.set(0.13 * i, 0.02, 0.09 * j);
      leg.rotation.x = Math.PI / 12 * j;
      group.add(leg);
      // Foot
      const foot = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), skinMaterial);
      foot.position.set(0.13 * i, -0.09, 0.09 * j);
      group.add(foot);
    }
  }
  // Tail
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.02, 0.18, 8), darkMaterial);
  tail.position.set(0, 0.18, -0.28); // Behind (-Z)
  tail.rotation.x = Math.PI / 4;
  group.add(tail);
  // Ears
  for (let i = -1; i <= 1; i += 2) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.09, 8), skinMaterial);
    ear.position.set(0.05 * i, 0.36, 0.33);
    ear.rotation.z = i === -1 ? Math.PI / 6 : -Math.PI / 6;
    group.add(ear);
  }
  // Accessories (saddle/blanket)
  const blanket = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.18), clothMaterial);
  blanket.position.set(0, 0.18, 0);
  group.add(blanket);
  // Rider (optional, for 'mounted' prompt)
  if (lowerPrompt.includes('mounted') || lowerPrompt.includes('rider')) {
    const rider = generateBipedTroopMesh(lowerPrompt, role, subtype, skinMaterial, armorMaterial, darkMaterial, accentMaterial, clothMaterial, goldMaterial);
    rider.position.set(0, 0.32, 0);
    rider.scale.set(0.6, 0.6, 0.6);
    group.add(rider);
  }
  // Simple face (eyes, nose)
  for (let i = -1; i <= 1; i += 2) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), accentMaterial);
    eye.position.set(0.03 * i, 0.32, 0.34);
    group.add(eye);
  }
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.04, 8), skinMaterial);
  nose.position.set(0, 0.3, 0.36);
  nose.rotation.x = Math.PI / 2;
  group.add(nose);
  // Add a face marker (beak/nose) for debugging
  const faceMarker = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.06, 8), accentMaterial);
  faceMarker.position.set(0, 0.32, 0.38);
  faceMarker.rotation.x = Math.PI / 2;
  group.add(faceMarker);
  // Standardize facing: ensure +Z is forward
  group.rotation.y = 0;
  return group;
}

// --- FLYING TROOP ---
function generateFlyingTroopMesh(lowerPrompt, role, subtype, skinMaterial, armorMaterial, darkMaterial, accentMaterial, clothMaterial, goldMaterial) {
  const group = new THREE.Group();
  // Add body (like biped)
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.32, 18), skinMaterial);
  body.position.y = 0.22;
  body.castShadow = true;
  group.add(body);
  // Add head (like biped)
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), skinMaterial);
  head.position.y = 0.42;
  group.add(head);
  // Add a beak or face marker for debugging
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 8), accentMaterial);
  beak.position.set(0, 0.42, 0.15);
  beak.rotation.x = Math.PI / 2;
  group.add(beak);
  // Add wings
  for (let i = -1; i <= 1; i += 2) {
    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.02, 0.32), accentMaterial);
    wing.position.set(0.08 * i, 0.38, -0.12);
    wing.rotation.y = i * Math.PI / 8;
    group.add(wing);
  }
  // Raise the troop above the ground
  group.position.y = 0.25;
  // Add a shadow or glow effect
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), new THREE.MeshStandardMaterial({ color: 0x00e0ff, transparent: true, opacity: 0.12, emissive: 0x00e0ff, emissiveIntensity: 0.3 }));
  glow.position.set(0, 0.1, 0);
  group.add(glow);
  // Standardize facing: ensure +Z is forward
  group.rotation.y = 0;
  return group;
}

// --- MOUNTED TROOP ---
function generateMountedTroopMesh(lowerPrompt, role, subtype, skinMaterial, armorMaterial, darkMaterial, accentMaterial, clothMaterial, goldMaterial) {
  const group = new THREE.Group();
  // Base body (elongated along +Z)
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 0.2), skinMaterial);
  body.position.y = 0.2;
  body.rotation.x = Math.PI / 2; // Long axis along +Z
  group.add(body);
  // Chest plate
  const chest = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.08, 0.19),
    new THREE.MeshLambertMaterial({color: 0x888888}) // Gray for armor
  );
  chest.position.y = 0.3;
  group.add(chest);
  // Saddle (optional, for 'mounted' prompt)
  if (lowerPrompt.includes('mounted') || lowerPrompt.includes('rider')) {
    const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.05), darkMaterial);
    saddle.position.set(0, 0.15, 0.05);
    saddle.rotation.x = Math.PI / 2;
    group.add(saddle);
  }
  // Rider (optional, for 'mounted' prompt)
  if (lowerPrompt.includes('mounted') || lowerPrompt.includes('rider')) {
    const rider = generateBipedTroopMesh(lowerPrompt, role, subtype, skinMaterial, armorMaterial, darkMaterial, accentMaterial, clothMaterial, goldMaterial);
    rider.position.set(0, 0.32, 0);
    rider.scale.set(0.6, 0.6, 0.6);
    group.add(rider);
  }
  // Simple face (eyes, nose)
  for (let i = -1; i <= 1; i += 2) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), accentMaterial);
    eye.position.set(0.03 * i, 0.32, 0.34);
    group.add(eye);
  }
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.04, 8), skinMaterial);
  nose.position.set(0, 0.3, 0.36);
  nose.rotation.x = Math.PI / 2;
  group.add(nose);
  // Add a face marker (beak/nose) for debugging
  const faceMarker = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.06, 8), accentMaterial);
  faceMarker.position.set(0, 0.32, 0.38);
  faceMarker.rotation.x = Math.PI / 2;
  group.add(faceMarker);
  // Standardize facing: ensure +Z is forward
  group.rotation.y = 0;
  return group;
}

// --- INSECTOID TROOP ---
function generateInsectoidTroopMesh(lowerPrompt, role, subtype, skinMaterial, armorMaterial, darkMaterial, accentMaterial, clothMaterial, greenMaterial) {
  const group = new THREE.Group();
  // Base body (larger than biped)
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 0.2), skinMaterial);
  body.position.y = 0.2;
  body.castShadow = true;
  group.add(body);

  // Chest plate
  const chest = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.08, 0.19),
    new THREE.MeshLambertMaterial({color: 0x4e9a06}) // Green for insectoid
  );
  chest.position.y = 0.3;
  group.add(chest);

  // Armor (optional, based on prompt)
  if (lowerPrompt.includes('armor') || lowerPrompt.includes('knight') || lowerPrompt.includes('elite')) {
    const armor = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.16, 0.18),
      armorMaterial
    );
    armor.position.y = 0.32;
    group.add(armor);
  }

  // Simple weapon (based on prompt)
  if (lowerPrompt.includes('sword') || lowerPrompt.includes('blade')) {
    const weapon = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.18, 0.01), armorMaterial);
    weapon.position.set(0.23, 0.18, 0.09);
    group.add(weapon);
    const hilt = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.015, 0.015), darkMaterial);
    hilt.position.set(0.23, 0.1, 0.09);
    group.add(hilt);
  } else if (lowerPrompt.includes('staff') || lowerPrompt.includes('wand')) {
    const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.28, 10), darkMaterial);
    staff.position.set(0.23, 0.18, 0.09);
    group.add(staff);
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), accentMaterial);
    orb.position.set(0.23, 0.33, 0.09);
    group.add(orb);
  }

  // Special effects (e.g., glow, lightning)
  if (lowerPrompt.includes('magic') || lowerPrompt.includes('wizard') || lowerPrompt.includes('mage')) {
    const aura = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0x8e54e9, transparent: true, opacity: 0.18, emissive: 0x8e54e9, emissiveIntensity: 0.5 })
    );
    aura.position.set(0, 0.25, 0);
    group.add(aura);
  }
  
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
  const group = new THREE.Group();
  
  // Add procedural color variations for generals
  const baseColor = generalColor !== undefined ? generalColor : (isPlayer ? 0x1da1f2 : 0xff5e62);
  const colorVariation = Math.random() * 0.2 - 0.1; // ±10% variation for generals
  const color = new THREE.Color(baseColor);
  color.offsetHSL(colorVariation, 0, 0);
  
  const gray = 0x888888;
  const dark = 0x222222;
  const accent = 0x00e0ff;
  const gold = 0xffd700;
  const silver = 0xc0c0c0;
  
  // Determine general type and variant
  let generalType = 'melee';
  if (lowerPrompt.includes('bow') || lowerPrompt.includes('arrow') || lowerPrompt.includes('gun') || lowerPrompt.includes('rifle') || lowerPrompt.includes('sniper')) {
    generalType = 'ranged';
  } else if (lowerPrompt.includes('magic') || lowerPrompt.includes('wizard') || lowerPrompt.includes('mage') || lowerPrompt.includes('spell')) {
    generalType = 'magic';
  }
  
  const variant = determineGeneralVariant(lowerPrompt, generalType);
  
  // Analyze prompt for visual characteristics
  const isHeavy = lowerPrompt.includes('heavy') || lowerPrompt.includes('tank') || lowerPrompt.includes('armor');
  const isLight = lowerPrompt.includes('light') || lowerPrompt.includes('fast') || lowerPrompt.includes('quick') || lowerPrompt.includes('stealth');
  const isElite = lowerPrompt.includes('elite') || lowerPrompt.includes('royal') || lowerPrompt.includes('knight');
  const isVeteran = lowerPrompt.includes('veteran') || lowerPrompt.includes('seasoned') || lowerPrompt.includes('experienced');
  const isYoung = lowerPrompt.includes('young') || lowerPrompt.includes('fresh') || lowerPrompt.includes('new') || lowerPrompt.includes('recruit');
  const isLegendary = lowerPrompt.includes('legendary') || lowerPrompt.includes('hero') || lowerPrompt.includes('champion');
  
  // Determine size and proportions with more variation for generals
  let bodyScale = 1.5 + (Math.random() * 0.3 - 0.15); // Base 1.5x size with ±15% variation
  let headScale = 1.2 + (Math.random() * 0.2 - 0.1); // Base 1.2x head with ±10% variation
  let weaponScale = 1.3 + (Math.random() * 0.4 - 0.2); // Base 1.3x weapon with ±20% variation
  
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
  
  // Variant-specific body structure for generals
  addGeneralVariantBody(group, variant, bodyScale, color.getHex(), gray, dark, accent, gold);
  
  // Head with more variation for generals
  const head = new THREE.Mesh(
    new THREE.BoxGeometry(0.3 * headScale, 0.3 * headScale, 0.25 * headScale),
    new THREE.MeshLambertMaterial({color: gray})
  );
  head.position.y = 0.9;
  group.add(head);
  
  // Add variant-specific details for generals
  addGeneralVariantDetails(group, variant, generalType, color.getHex(), gray, dark, accent, weaponScale, gold, silver);
  
  // Add procedural visual details based on description for generals
  addGeneralProceduralDetails(group, lowerPrompt, color.getHex(), gray, dark, accent, gold, silver);
  
  // At the end, return an object with mesh property
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