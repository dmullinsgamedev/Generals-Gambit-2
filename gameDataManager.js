// Game Data Manager Module
// Centralizes all game constants, data structures, and configuration

import { simpleLogger } from './logger.js';

class GameDataManager {
  constructor() {
    this.isInitialized = false;
    this.data = {};
  }

  // Initialize the data manager
  initialize() {
    if (this.isInitialized) return;
    
    simpleLogger.addLog('INFO', ['Initializing Game Data Manager']);
    
    // Load all game data
    this.loadGenerals();
    this.loadFormations();
    this.loadTroopTypes();
    this.loadTroopVariants();
    this.loadWeapons();
    this.loadDescriptors();
    this.loadTitles();
    this.loadPatterns();
    this.loadGameConstants();
    this.loadTerrainData();
    
    this.isInitialized = true;
    simpleLogger.addLog('INFO', ['Game Data Manager initialized successfully']);
  }

  // Load general data
  loadGenerals() {
    this.data.generals = [
      {
        name: 'Warrior',
        hp: 120,
        troops: 'melee',
        color: 0xff5e62,
        special: 'Battle Cry',
        desc: 'High HP, melee troops.'
      },
      {
        name: 'Archer',
        hp: 90,
        troops: 'ranged',
        color: 0x1da1f2,
        special: 'Volley',
        desc: 'Low HP, long ranged troops.'
      },
      {
        name: 'Mage',
        hp: 70,
        troops: 'magic',
        color: 0x8e54e9,
        special: 'Fireball',
        desc: 'Medium HP, short range, fast damage.'
      }
    ];
  }

  // Load formation data
  loadFormations() {
    this.data.formations = [
      {
        name: 'Phalanx',
        bonus: {atk:1.1, def:1.4, speed:0.6},
        desc: 'Ancient Greek formation with overlapping shields. Excellent defense, slow movement.'
      },
      {
        name: 'Testudo',
        bonus: {atk:0.7, def:1.5, speed:0.5},
        desc: 'Roman turtle formation with shields overhead. Maximum defense, very slow.'
      },
      {
        name: 'Wedge',
        bonus: {atk:1.3, def:0.8, speed:1.4},
        desc: 'Cavalry charge formation. High attack and speed, vulnerable flanks.'
      },
      {
        name: 'Line',
        bonus: {atk:1.0, def:1.0, speed:1.0},
        desc: 'Standard infantry line. Balanced attack, defense, and mobility.'
      },
      {
        name: 'Square',
        bonus: {atk:0.8, def:1.3, speed:0.7},
        desc: 'Defensive square formation. Strong defense, limited mobility.'
      },
      {
        name: 'Skirmish',
        bonus: {atk:0.9, def:0.7, speed:1.6},
        desc: 'Light infantry skirmish line. High mobility, low defense.'
      },
      {
        name: 'Column',
        bonus: {atk:1.2, def:0.9, speed:1.2},
        desc: 'Deep column formation. Good attack power, moderate mobility.'
      },
      {
        name: 'Echelon',
        bonus: {atk:1.1, def:0.9, speed:1.3},
        desc: 'Staggered line formation. Good attack and mobility, moderate defense.'
      },
      {
        name: 'Hammer and Anvil',
        bonus: {atk:1.4, def:1.1, speed:0.8},
        desc: 'Two-pronged attack formation. High attack, moderate defense, slow.'
      },
      {
        name: 'Crescent',
        bonus: {atk:1.2, def:0.8, speed:1.1},
        desc: 'Curved formation for flanking. Good attack, vulnerable center.'
      },
      {
        name: 'Circle',
        bonus: {atk:0.9, def:1.2, speed:0.6},
        desc: 'Defensive circle formation. Good defense, very slow movement.'
      },
      {
        name: 'Arrowhead',
        bonus: {atk:1.3, def:0.7, speed:1.5},
        desc: 'Deep penetration formation. Maximum attack, weak defense.'
      },
      {
        name: 'Shield Wall',
        bonus: {atk:0.8, def:1.4, speed:0.8},
        desc: 'Viking shield wall. Excellent defense, moderate attack.'
      },
      {
        name: 'Pincer',
        bonus: {atk:1.2, def:0.8, speed:1.2},
        desc: 'Double flanking formation. Good attack and mobility.'
      },
      {
        name: 'Turtle',
        bonus: {atk:0.6, def:1.6, speed:0.4},
        desc: 'Maximum defensive formation. Highest defense, very slow.'
      },
      {
        name: 'Spearhead',
        bonus: {atk:1.4, def:0.6, speed:1.3},
        desc: 'Deep penetration formation. Maximum attack, weak defense.'
      },
      {
        name: 'Scatter',
        bonus: {atk:0.8, def:0.6, speed:1.7},
        desc: 'Irregular skirmish formation. Maximum mobility, weak combat.'
      },
      {
        name: 'Box',
        bonus: {atk:0.9, def:1.2, speed:0.9},
        desc: 'Compact defensive box. Good defense, moderate mobility.'
      },
      {
        name: 'Encirclement',
        bonus: {atk:1.1, def:0.9, speed:1.0},
        desc: 'Surrounding formation. Balanced stats for containment.'
      }
    ];
  }

  // Load troop type data
  loadTroopTypes() {
    this.data.troopTypes = {
      melee:   { atk: 2,   hp: 6, range: 1, rate: 5 },
      ranged:  { atk: 1, hp: 2, range: 7, rate: 8 },
      magic:   { atk: 1,   hp: 3, range: 3.5, rate: 3 }
    };
  }

  // Load troop variants data
  loadTroopVariants() {
    this.data.troopVariants = {
      melee: [
        { name: 'Warrior', keywords: ['warrior', 'fighter', 'soldier'], weapon: 'sword', special: 'slash' },
        { name: 'Knight', keywords: ['knight', 'royal', 'elite'], weapon: 'broadsword', special: 'charge' },
        { name: 'Berserker', keywords: ['berserker', 'rage', 'fierce'], weapon: 'axe', special: 'whirlwind' },
        { name: 'Guard', keywords: ['guard', 'defend', 'protect'], weapon: 'shield', special: 'shield_bash' },
        { name: 'Ninja', keywords: ['ninja', 'stealth', 'assassin'], weapon: 'dagger', special: 'backstab' },
        { name: 'Samurai', keywords: ['samurai', 'honor', 'katana'], weapon: 'katana', special: 'iaijutsu' },
        { name: 'Barbarian', keywords: ['barbarian', 'wild', 'savage'], weapon: 'club', special: 'smash' },
        { name: 'Paladin', keywords: ['paladin', 'holy', 'divine'], weapon: 'mace', special: 'holy_strike' },
        { name: 'Gladiator', keywords: ['gladiator', 'arena', 'combat'], weapon: 'trident', special: 'net_throw' },
        { name: 'Viking', keywords: ['viking', 'norse', 'raid'], weapon: 'battleaxe', special: 'berserk_rage' },
        { name: 'Spartan', keywords: ['spartan', 'phalanx', 'discipline'], weapon: 'spear', special: 'phalanx_charge' },
        { name: 'Mercenary', keywords: ['mercenary', 'hired', 'blade'], weapon: 'rapier', special: 'precise_strike' },
        { name: 'Brawler', keywords: ['brawler', 'fist', 'punch'], weapon: 'fists', special: 'combo_strike' },
        { name: 'Executioner', keywords: ['executioner', 'axe', 'death'], weapon: 'executioner_axe', special: 'decapitate' },
        { name: 'Duelist', keywords: ['duelist', 'fencing', 'elegant'], weapon: 'foil', special: 'riposte' },
        { name: 'Warlord', keywords: ['warlord', 'command', 'lead'], weapon: 'battle_sword', special: 'rally_cry' },
        { name: 'Tank', keywords: ['tank', 'heavy', 'armor'], weapon: 'warhammer', special: 'crush' },
        { name: 'Scout', keywords: ['scout', 'light', 'fast'], weapon: 'short_sword', special: 'quick_strike' },
        { name: 'Berserker', keywords: ['berserker', 'fury', 'blood'], weapon: 'dual_axes', special: 'blood_rage' },
        { name: 'Champion', keywords: ['champion', 'hero', 'legend'], weapon: 'legendary_sword', special: 'heroic_strike' }
      ],
      ranged: [
        { name: 'Archer', keywords: ['archer', 'bow', 'arrow'], weapon: 'longbow', special: 'volley' },
        { name: 'Sniper', keywords: ['sniper', 'precision', 'rifle'], weapon: 'rifle', special: 'headshot' },
        { name: 'Crossbowman', keywords: ['crossbow', 'bolt', 'heavy'], weapon: 'crossbow', special: 'piercing_bolt' },
        { name: 'Gunslinger', keywords: ['gunslinger', 'pistol', 'quick'], weapon: 'pistol', special: 'quick_draw' },
        { name: 'Ranger', keywords: ['ranger', 'forest', 'nature'], weapon: 'composite_bow', special: 'nature_shot' },
        { name: 'Marksman', keywords: ['marksman', 'accuracy', 'scope'], weapon: 'scoped_rifle', special: 'precision_shot' },
        { name: 'Artillery', keywords: ['artillery', 'cannon', 'explosive'], weapon: 'cannon', special: 'explosive_round' },
        { name: 'Gunner', keywords: ['gunner', 'machine_gun', 'rapid'], weapon: 'machine_gun', special: 'suppressing_fire' },
        { name: 'Hunter', keywords: ['hunter', 'track', 'trap'], weapon: 'hunting_bow', special: 'trap_shot' },
        { name: 'Sharpshooter', keywords: ['sharpshooter', 'dead_eye', 'expert'], weapon: 'sniper_rifle', special: 'dead_eye' },
        { name: 'Ballista', keywords: ['ballista', 'siege', 'heavy'], weapon: 'ballista', special: 'siege_shot' },
        { name: 'Javelin', keywords: ['javelin', 'throw', 'spear'], weapon: 'javelin', special: 'throwing_spear' },
        { name: 'Boomerang', keywords: ['boomerang', 'return', 'curved'], weapon: 'boomerang', special: 'return_throw' },
        { name: 'Slingshot', keywords: ['slingshot', 'stone', 'simple'], weapon: 'slingshot', special: 'stone_throw' },
        { name: 'Blowgun', keywords: ['blowgun', 'dart', 'poison'], weapon: 'blowgun', special: 'poison_dart' },
        { name: 'Trebuchet', keywords: ['trebuchet', 'catapult', 'siege'], weapon: 'trebuchet', special: 'boulder_throw' },
        { name: 'Musket', keywords: ['musket', 'flintlock', 'historical'], weapon: 'musket', special: 'musket_shot' },
        { name: 'Laser', keywords: ['laser', 'beam', 'energy'], weapon: 'laser_rifle', special: 'laser_beam' },
        { name: 'Plasma', keywords: ['plasma', 'ion', 'advanced'], weapon: 'plasma_rifle', special: 'plasma_blast' },
        { name: 'Railgun', keywords: ['railgun', 'magnetic', 'hyper'], weapon: 'railgun', special: 'hyper_velocity' }
      ],
      magic: [
        { name: 'Wizard', keywords: ['wizard', 'spell', 'arcane'], weapon: 'staff', special: 'fireball' },
        { name: 'Mage', keywords: ['mage', 'magic', 'mystic'], weapon: 'wand', special: 'arcane_blast' },
        { name: 'Sorcerer', keywords: ['sorcerer', 'chaos', 'wild'], weapon: 'orb', special: 'chaos_bolt' },
        { name: 'Warlock', keywords: ['warlock', 'dark', 'shadow'], weapon: 'grimoire', special: 'shadow_bolt' },
        { name: 'Druid', keywords: ['druid', 'nature', 'forest'], weapon: 'nature_staff', special: 'nature_wrath' },
        { name: 'Necromancer', keywords: ['necromancer', 'death', 'undead'], weapon: 'skull_staff', special: 'death_bolt' },
        { name: 'Pyromancer', keywords: ['pyromancer', 'fire', 'flame'], weapon: 'fire_staff', special: 'inferno' },
        { name: 'Cryomancer', keywords: ['cryomancer', 'ice', 'frost'], weapon: 'ice_staff', special: 'blizzard' },
        { name: 'Electromancer', keywords: ['electromancer', 'lightning', 'thunder'], weapon: 'lightning_staff', special: 'thunder_strike' },
        { name: 'Geomancer', keywords: ['geomancer', 'earth', 'stone'], weapon: 'earth_staff', special: 'earthquake' },
        { name: 'Aeromancer', keywords: ['aeromancer', 'wind', 'air'], weapon: 'wind_staff', special: 'tornado' },
        { name: 'Hydromancer', keywords: ['hydromancer', 'water', 'ocean'], weapon: 'water_staff', special: 'tsunami' },
        { name: 'Chronomancer', keywords: ['chronomancer', 'time', 'temporal'], weapon: 'time_staff', special: 'time_warp' },
        { name: 'Illusionist', keywords: ['illusionist', 'illusion', 'mind'], weapon: 'illusion_staff', special: 'phantasm' },
        { name: 'Summoner', keywords: ['summoner', 'summon', 'creature'], weapon: 'summoning_staff', special: 'summon_familiar' },
        { name: 'Enchanter', keywords: ['enchanter', 'enchant', 'buff'], weapon: 'enchanting_staff', special: 'empower' },
        { name: 'Diviner', keywords: ['diviner', 'divine', 'prophecy'], weapon: 'divine_staff', special: 'divine_judgment' }
      ]
    };
  }

  // Load weapons data
  loadWeapons() {
    this.data.weapons = {
      melee: ['sword', 'axe', 'spear', 'mace', 'hammer', 'dagger', 'rapier', 'broadsword', 'katana', 'trident'],
      ranged: ['bow', 'crossbow', 'rifle', 'pistol', 'longbow', 'composite_bow', 'sniper_rifle', 'machine_gun'],
      magic: ['staff', 'wand', 'orb', 'grimoire', 'nature_staff', 'fire_staff', 'ice_staff', 'lightning_staff']
    };
  }

  // Load descriptors data
  loadDescriptors() {
    this.data.descriptors = [
      'legendary', 'heroic', 'mighty', 'powerful', 'fearsome', 'renowned',
      'elite', 'royal', 'noble', 'commanding', 'distinguished', 'honored',
      'veteran', 'seasoned', 'experienced', 'battle-hardened', 'proven',
      'tactical', 'strategic', 'brilliant', 'masterful', 'skilled',
      'heavy', 'armored', 'protected', 'defensive', 'fortified',
      'aggressive', 'fierce', 'ruthless', 'merciless', 'deadly',
      'stealthy', 'shadowy', 'mysterious', 'enigmatic', 'elusive',
      'elite', 'veteran', 'seasoned', 'battle-hardened', 'experienced',
      'young', 'fresh', 'new', 'recruit', 'trainee',
      'light', 'unarmored',
      'calm', 'disciplined', 'wild', 'controlled',
      'common', 'peasant', 'mercenary'
    ];
  }

  // Load titles data
  loadTitles() {
    this.data.titles = [
      'Commander', 'General', 'Warlord', 'Champion', 'Hero', 'Legend',
      'Lord', 'Captain', 'Leader', 'Master', 'Veteran', 'Elite',
      'Royal', 'Noble', 'Knight', 'Paladin', 'Guardian', 'Protector'
    ];
  }

  // Load pattern data
  loadPatterns() {
    this.data.patterns = {
      general: [
        '{descriptor} {title} {variant}',
        '{title} {variant} {descriptor}',
        '{descriptor} {variant} commander',
        '{title} {descriptor} {troopType} warrior',
        '{descriptor} {variant} general',
        '{title} {variant} {descriptor}',
        '{descriptor} {troopType} {variant} leader',
        '{title} {descriptor} {variant}'
      ],
      troop: [
        '{descriptor} {variant} with {weapon}',
        '{variant} {descriptor} warrior',
        '{descriptor} {troopType} {variant}',
        '{variant} armed with {weapon}',
        '{descriptor} {variant} soldier',
        '{variant} {descriptor} fighter',
        '{descriptor} {variant} {troopType} unit',
        '{variant} with {weapon} and {descriptor} armor'
      ]
    };
  }

  // Load game constants
  loadGameConstants() {
    this.data.constants = {
      roundLimit: 1,
      defaultColors: {
        player: 0x1da1f2,
        enemy: 0xff5e62,
        melee: 0xff5e62,
        ranged: 0x1da1f2,
        magic: 0x8e54e9
      },
      terrain: {
        groundColor: 0x90EE90,
        treeColor: 0x228B22,
        trunkColor: 0x8B4513,
        rockColor: 0x696969
      },
      battle: {
        attackCooldown: 100,
        projectileSpeed: 0.1,
        explosionDuration: 1000
      }
    };
  }

  // Load terrain data
  loadTerrainData() {
    this.data.terrain = {
      groundSize: 50,
      groundSegments: 20,
      treeCount: 30,
      rockCount: 20,
      heightVariation: 0.5
    };
  }

  // Get all generals
  getGenerals() {
    return this.data.generals;
  }

  // Get a random general
  getRandomGeneral() {
    return this.data.generals[Math.floor(Math.random() * this.data.generals.length)];
  }

  // Get general by name
  getGeneralByName(name) {
    return this.data.generals.find(g => g.name.toLowerCase() === name.toLowerCase());
  }

  // Get all formations
  getFormations() {
    return this.data.formations;
  }

  // Get a random formation
  getRandomFormation() {
    return this.data.formations[Math.floor(Math.random() * this.data.formations.length)];
  }

  // Get formation by name
  getFormationByName(name) {
    return this.data.formations.find(f => f.name.toLowerCase() === name.toLowerCase());
  }

  // Get troop types
  getTroopTypes() {
    return this.data.troopTypes;
  }

  // Get troop type by name
  getTroopType(name) {
    return this.data.troopTypes[name];
  }

  // Get troop variants
  getTroopVariants() {
    return this.data.troopVariants;
  }

  // Get troop variants by type
  getTroopVariantsByType(type) {
    return this.data.troopVariants[type] || [];
  }

  // Get random troop variant by type
  getRandomTroopVariant(type) {
    const variants = this.getTroopVariantsByType(type);
    return variants[Math.floor(Math.random() * variants.length)];
  }

  // Get weapons by type
  getWeaponsByType(type) {
    return this.data.weapons[type] || [];
  }

  // Get random weapon by type
  getRandomWeapon(type) {
    const weapons = this.getWeaponsByType(type);
    return weapons[Math.floor(Math.random() * weapons.length)];
  }

  // Get random descriptor
  getRandomDescriptor() {
    return this.data.descriptors[Math.floor(Math.random() * this.data.descriptors.length)];
  }

  // Get random title
  getRandomTitle() {
    return this.data.titles[Math.floor(Math.random() * this.data.titles.length)];
  }

  // Get random pattern
  getRandomPattern(type) {
    const patterns = this.data.patterns[type] || [];
    return patterns[Math.floor(Math.random() * patterns.length)];
  }

  // Get game constants
  getConstants() {
    return this.data.constants;
  }

  // Get terrain data
  getTerrainData() {
    return this.data.terrain;
  }

  // Generate general description
  generateGeneralDescription(variant, generalData) {
    const descriptor = this.getRandomDescriptor();
    const title = this.getRandomTitle();
    const pattern = this.getRandomPattern('general');
    
    return pattern
      .replace('{descriptor}', descriptor)
      .replace('{title}', title)
      .replace('{variant}', variant.name.toLowerCase())
      .replace('{troopType}', generalData.troops);
  }

  // Generate troop description
  generateTroopDescription(variant, troopType) {
    const descriptor = this.getRandomDescriptor();
    const weapon = this.getRandomWeapon(troopType);
    const pattern = this.getRandomPattern('troop');
    
    return pattern
      .replace('{descriptor}', descriptor)
      .replace('{variant}', variant.name.toLowerCase())
      .replace('{troopType}', troopType)
      .replace('{weapon}', weapon);
  }
  
  // Generate general from prompt
  generateGeneralFromPrompt(prompt) {
    // Parse prompt to determine general type
    const lowerPrompt = prompt.toLowerCase();
    
    let generalType = 'infantry';
    if (lowerPrompt.includes('cavalry') || lowerPrompt.includes('horse') || lowerPrompt.includes('mounted')) {
      generalType = 'cavalry';
    } else if (lowerPrompt.includes('archer') || lowerPrompt.includes('bow') || lowerPrompt.includes('ranged')) {
      generalType = 'archer';
    }
    
    // Get random general of the specified type
    const generals = this.getGenerals();
    const typeGenerals = generals.filter(g => g.troopType === generalType);
    const general = typeGenerals.length > 0 ? typeGenerals[Math.floor(Math.random() * typeGenerals.length)] : generals[0];
    
    return {
      ...general,
      name: prompt,
      description: prompt
    };
  }

  // Add new general
  addGeneral(general) {
    this.data.generals.push(general);
    simpleLogger.addLog('INFO', ['Added new general:', general.name]);
  }

  // Add new formation
  addFormation(formation) {
    this.data.formations.push(formation);
    simpleLogger.addLog('INFO', ['Added new formation:', formation.name]);
  }

  // Add new troop variant
  addTroopVariant(type, variant) {
    if (!this.data.troopVariants[type]) {
      this.data.troopVariants[type] = [];
    }
    this.data.troopVariants[type].push(variant);
    simpleLogger.addLog('INFO', ['Added new troop variant:', variant.name, 'for type:', type]);
  }

  // Update game constant
  updateConstant(category, key, value) {
    if (this.data.constants[category]) {
      this.data.constants[category][key] = value;
      simpleLogger.addLog('INFO', [`Updated constant ${category}.${key} to:`, value]);
    }
  }

  // Get all data (for debugging/export)
  getAllData() {
    return this.data;
  }

  // Export data to JSON
  exportData() {
    return JSON.stringify(this.data, null, 2);
  }

  // Import data from JSON
  importData(jsonData) {
    try {
      this.data = JSON.parse(jsonData);
      this.isInitialized = true;
      simpleLogger.addLog('INFO', ['Game data imported successfully']);
      return true;
    } catch (error) {
      simpleLogger.addLog('ERROR', ['Failed to import game data:', error.message]);
      return false;
    }
  }

  // Reset to default data
  reset() {
    this.isInitialized = false;
    this.data = {};
    this.initialize();
    simpleLogger.addLog('INFO', ['Game data reset to defaults']);
  }

  // Destroy the data manager
  destroy() {
    this.data = {};
    this.isInitialized = false;
    simpleLogger.addLog('INFO', ['Game Data Manager destroyed']);
  }
}

// Create singleton instance
const gameDataManager = new GameDataManager();

// Export functions for backward compatibility
export function getGenerals() {
  return gameDataManager.getGenerals();
}

export function getFormations() {
  return gameDataManager.getFormations();
}

export function getTroopTypes() {
  return gameDataManager.getTroopTypes();
}

export function getTroopVariants() {
  return gameDataManager.getTroopVariants();
}

export function getRandomGeneral() {
  return gameDataManager.getRandomGeneral();
}

export function getRandomFormation() {
  return gameDataManager.getRandomFormation();
}

export function getRandomTroopVariant(type) {
  return gameDataManager.getRandomTroopVariant(type);
}

export function generateGeneralDescription(variant, generalData) {
  return gameDataManager.generateGeneralDescription(variant, generalData);
}

export function generateTroopDescription(variant, troopType) {
  return gameDataManager.generateTroopDescription(variant, troopType);
}

// Export the manager instance for advanced usage
export { gameDataManager }; 