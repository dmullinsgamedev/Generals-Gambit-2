// ============================================================================
// ADVANCED TROOP GENERATION SYSTEM
// ============================================================================

import { TROOP_VARIANTS } from './gameData.js';

// --- Custom 3D Troop Generation ---
export function generateCustomTroopMesh(prompt, isPlayer, troopColor) {
  const lowerPrompt = prompt.toLowerCase();
  const group = new THREE.Group();
  const color = troopColor !== undefined ? troopColor : (isPlayer ? 0x1da1f2 : 0xff5e62);
  const gray = 0x888888;
  const dark = 0x222222;
  const accent = 0x00e0ff;
  
  // Determine troop type and variant
  let troopType = 'melee';
  if (lowerPrompt.includes('bow') || lowerPrompt.includes('arrow') || lowerPrompt.includes('gun') || lowerPrompt.includes('rifle') || lowerPrompt.includes('sniper')) {
    troopType = 'ranged';
  } else if (lowerPrompt.includes('magic') || lowerPrompt.includes('wizard') || lowerPrompt.includes('mage') || lowerPrompt.includes('spell')) {
    troopType = 'magic';
  }
  
  const variant = determineTroopVariant(lowerPrompt, troopType);
  
  // Analyze prompt for visual characteristics
  const isHeavy = lowerPrompt.includes('heavy') || lowerPrompt.includes('tank') || lowerPrompt.includes('armor');
  const isLight = lowerPrompt.includes('light') || lowerPrompt.includes('fast') || lowerPrompt.includes('quick') || lowerPrompt.includes('stealth');
  const isElite = lowerPrompt.includes('elite') || lowerPrompt.includes('royal') || lowerPrompt.includes('knight');
  
  // Determine size and proportions
  let bodyScale = 1;
  let headScale = 1;
  let weaponScale = 1;
  
  if (isHeavy) {
    bodyScale = 1.3;
    headScale = 0.9;
    weaponScale = 1.2;
  } else if (isLight) {
    bodyScale = 0.8;
    headScale = 1.1;
    weaponScale = 0.9;
  } else if (isElite) {
    bodyScale = 1.1;
    headScale = 1.0;
    weaponScale = 1.1;
  }
  
  // Variant-specific body structure
  addVariantBody(group, variant, bodyScale, color, gray, dark, accent);
  
  // Head
  const head = new THREE.Mesh(
    new THREE.BoxGeometry(0.2 * headScale, 0.15 * headScale, 0.15 * headScale),
    new THREE.MeshLambertMaterial({color: gray})
  );
  head.position.y = 0.5;
  group.add(head);
  
  // Add variant-specific details
  addVariantDetails(group, variant, troopType, color, gray, dark, accent, weaponScale);
  
  return group;
}

function determineTroopVariant(prompt, troopType) {
  const variants = TROOP_VARIANTS[troopType];
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

// --- Troop Variant Determination ---
export function determineTroopVariantFromPrompt(prompt, troopType) {
  const lowerPrompt = prompt.toLowerCase();
  const variants = TROOP_VARIANTS[troopType];
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