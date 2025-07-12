// Formation Manager Module
// Handles formation positioning, preview, generation, and type detection

import { simpleLogger } from './logger.js';
import { getFormations } from './gameDataManager.js';
import { terrainManager } from './terrainManager.js';

class FormationManager {
  constructor() {
    this.formationKeywords = {
      phalanx: ['phalanx', 'spartan', 'greek', 'spear wall', 'shield wall', 'discipline'],
      testudo: ['testudo', 'turtle', 'roman', 'shield shell'],
      wedge: ['wedge', 'triangle', 'triangular', 'cavalry charge'],
      line: ['line', 'straight', 'row', 'column', 'single', 'single-file', 'wall'],
      square: ['square', 'box', 'defensive square', 'block'],
      skirmish: ['skirmish', 'skirmisher', 'loose', 'spread', 'open order'],
      column: ['column', 'deep', 'march', 'file'],
      echelon: ['echelon', 'staggered', 'diagonal'],
      'hammer and anvil': ['hammer and anvil', 'double', 'two-pronged', 'anvil', 'hammer'],
      crescent: ['crescent', 'curved', 'arc', 'bowed'],
      circle: ['circle', 'circular', 'ring', 'encircle'],
      arrowhead: ['arrowhead', 'arrow', 'point', 'penetration'],
      'shield wall': ['shield wall', 'viking', 'wall of shields'],
      pincer: ['pincer', 'double flank', 'envelopment', 'clamp'],
      turtle: ['turtle', 'maximum defense', 'shield shell', 'testudo'],
      spearhead: ['spearhead', 'spear', 'deep wedge'],
      scatter: ['scatter', 'irregular', 'chaotic', 'dispersed'],
      box: ['box', 'compact', 'defensive box'],
      encirclement: ['encirclement', 'surround', 'containment', 'enclose']
    };
  }

  // Position troops in formation for actual battle
  positionTroopsInFormation(troops, formation, isPlayer) {
    const baseZ = isPlayer ? -4 : 4; // Armies on Z axis (player at bottom, enemy at top)
    const baseX = 0;
    
    console.log(`Formation manager positioning ${troops.length} ${isPlayer ? 'player' : 'enemy'} troops in formation:`, formation);
    simpleLogger.addLog('DEBUG', ['Positioning troops in formation:', formation]);
    
    if (!formation) {
      console.warn('No formation provided, using default line formation');
      simpleLogger.addLog('WARN', ['No formation provided, using default line formation']);
      this.applyLineFormation(troops, baseX, baseZ, isPlayer);
      return;
    }
    
    const formationName = formation.name.toLowerCase();
    const formationType = this.detectFormationType(formationName);
    
    switch (formationType) {
      case 'line':
        this.applyLineFormation(troops, baseX, baseZ, isPlayer);
        break;
      case 'wedge':
        this.applyWedgeFormation(troops, baseX, baseZ, isPlayer);
        break;
      case 'circle':
        this.applyCircleFormation(troops, baseX, baseZ, isPlayer);
        break;
      case 'square':
        this.applySquareFormation(troops, baseX, baseZ, isPlayer);
        break;
      default:
        console.log('Applying DEFAULT LINE formation (no specific match found)');
        this.applyLineFormation(troops, baseX, baseZ, isPlayer);
    }
    
    simpleLogger.addLog('INFO', [`Positioned ${troops.length} ${isPlayer ? 'player' : 'enemy'} troops in ${formation.name} formation at baseZ=${baseZ}`]);
  }

  // Position troops in formation for preview (3D visualization)
  positionTroopsInFormationPreview(troops, formation) {
    const formationName = formation.name.toLowerCase();
    const formationType = this.detectFormationType(formationName);
    
    switch (formationType) {
      case 'line':
        this.applyLineFormationPreview(troops);
        break;
      case 'wedge':
        this.applyWedgeFormationPreview(troops);
        break;
      case 'circle':
        this.applyCircleFormationPreview(troops);
        break;
      case 'square':
        this.applySquareFormationPreview(troops);
        break;
      case 'skirmish':
        this.applySkirmishFormationPreview(troops);
        break;
      case 'column':
        this.applyColumnFormationPreview(troops);
        break;
      case 'pincer':
        this.applyPincerFormationPreview(troops);
        break;
      case 'turtle':
        this.applyTurtleFormationPreview(troops);
        break;
      default:
        this.applyDefaultFormationPreview(troops);
    }
  }

  // Generate formation from prompt
  generateFormationFromPrompt(prompt) {
    const lowerPrompt = prompt.toLowerCase();

    // Try to match prompt to a formation type
    let bestFormation = 'line';
    let maxMatches = 0;
    for (const [formation, words] of Object.entries(this.formationKeywords)) {
      const matches = words.filter(word => lowerPrompt.includes(word)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestFormation = formation;
      }
    }

    // Find the matching FORMATIONS entry
    const formations = getFormations();
    const formationObj = formations.find(f => f.name.toLowerCase() === bestFormation) || formations.find(f => f.name.toLowerCase() === 'line');

    // Allow bonus/desc overrides from prompt
    let atkBonus = formationObj.bonus.atk;
    let defBonus = formationObj.bonus.def;
    let speedBonus = formationObj.bonus.speed;
    let desc = formationObj.desc;

    // Bonus adjustments based on keywords
    if (lowerPrompt.includes('fast') || lowerPrompt.includes('quick') || lowerPrompt.includes('light')) {
      speedBonus *= 1.1;
    } else if (lowerPrompt.includes('heavy') || lowerPrompt.includes('strong') || lowerPrompt.includes('powerful')) {
      atkBonus *= 1.1;
      defBonus *= 0.9;
    } else if (lowerPrompt.includes('elite') || lowerPrompt.includes('tactical') || lowerPrompt.includes('strategic')) {
      atkBonus *= 1.1;
      speedBonus *= 0.9;
    }

    return {
      name: formationObj.name,
      bonus: {
        atk: atkBonus,
        def: defBonus,
        speed: speedBonus
      },
      desc: desc,
      prompt: lowerPrompt
    };
  }

  // Detect formation type from formation name
  detectFormationType(formationName) {
    if (formationName.includes('line') || formationName.includes('wall') || formationName.includes('echelon') || formationName.includes('skirmish') || formationName.includes('column')) {
      return 'line';
    } else if (formationName.includes('wedge') || formationName.includes('triangle') || formationName.includes('spearhead') || formationName.includes('arrowhead') || formationName.includes('hammer and anvil') || formationName.includes('crescent') || formationName.includes('pincer')) {
      return 'wedge';
    } else if (formationName.includes('circle') || formationName.includes('circular') || formationName.includes('encirclement')) {
      return 'circle';
    } else if (formationName.includes('square') || formationName.includes('box') || formationName.includes('phalanx') || formationName.includes('testudo') || formationName.includes('shield wall') || formationName.includes('turtle')) {
      return 'square';
    }
    return 'line'; // Default
  }

  // Formation application methods for battle positioning
  applyLineFormation(troops, baseX, baseZ, isPlayer) {
    const spacing = 0.8;
    troops.forEach((troop, index) => {
      const x = baseX + (index - troops.length / 2) * spacing;
      const z = baseZ;
      const terrainHeight = terrainManager.getTerrainHeightAt(x, z);
      troop.mesh.position.set(x, terrainHeight + 0.5, z);
      troop.position = { x: x, y: terrainHeight + 0.5, z: z };
      troop.mesh.rotation.y = isPlayer ? 0 : Math.PI;
    });
  }

  applyWedgeFormation(troops, baseX, baseZ, isPlayer) {
    const spacing = 0.8;
    const rows = Math.ceil(Math.sqrt(troops.length));
    troops.forEach((troop, index) => {
      const row = Math.floor(index / rows);
      const col = index % rows;
      const x = baseX + (col - row) * spacing * 0.5;
      const z = baseZ + row * spacing * 0.8 * (isPlayer ? 1 : -1);
      const terrainHeight = terrainManager.getTerrainHeightAt(x, z);
      troop.mesh.position.set(x, terrainHeight + 0.5, z);
      troop.position = { x: x, y: terrainHeight + 0.5, z: z };
      troop.mesh.rotation.y = isPlayer ? 0 : Math.PI;
    });
  }

  applyCircleFormation(troops, baseX, baseZ, isPlayer) {
    const radius = 2;
    troops.forEach((troop, index) => {
      const angle = (index / troops.length) * 2 * Math.PI;
      const x = baseX + Math.cos(angle) * radius;
      const z = baseZ + Math.sin(angle) * radius;
      const terrainHeight = terrainManager.getTerrainHeightAt(x, z);
      troop.mesh.position.set(x, terrainHeight + 0.5, z);
      troop.position = { x: x, y: terrainHeight + 0.5, z: z };
      troop.mesh.rotation.y = isPlayer ? 0 : Math.PI;
    });
  }

  applySquareFormation(troops, baseX, baseZ, isPlayer) {
    const side = Math.ceil(Math.sqrt(troops.length));
    troops.forEach((troop, index) => {
      const row = Math.floor(index / side);
      const col = index % side;
      const x = baseX + (col - side/2) * 0.8;
      const z = baseZ + (row - side/2) * 0.8;
      const terrainHeight = terrainManager.getTerrainHeightAt(x, z);
      troop.mesh.position.set(x, terrainHeight + 0.5, z);
      troop.position = { x: x, y: terrainHeight + 0.5, z: z };
      troop.mesh.rotation.y = isPlayer ? 0 : Math.PI;
    });
  }

  // Formation application methods for preview positioning
  applyLineFormationPreview(troops) {
    const rows = 1;
    troops.forEach((troop, index) => {
      const col = index;
      const x = (col - troops.length/2) * 0.8;
      const z = 0;
      troop.position.set(x, 0, z);
    });
  }

  applyWedgeFormationPreview(troops) {
    const rows = Math.ceil(Math.sqrt(troops.length));
    let placed = 0;
    for (let r = 0; r < rows; r++) {
      const cols = r + 1;
      for (let c = 0; c < cols && placed < troops.length; c++, placed++) {
        const x = (c - r/2) * 0.8;
        const z = r * 0.8;
        troops[placed].position.set(x, 0, z);
      }
    }
  }

  applyCircleFormationPreview(troops) {
    const radius = 2;
    troops.forEach((troop, index) => {
      const angle = (index / troops.length) * 2 * Math.PI;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      troop.position.set(x, 0, z);
    });
  }

  applySquareFormationPreview(troops) {
    const side = Math.ceil(Math.sqrt(troops.length));
    troops.forEach((troop, index) => {
      const row = Math.floor(index / side);
      const col = index % side;
      const x = (col - side/2) * 0.8;
      const z = (row - side/2) * 0.8;
      troop.position.set(x, 0, z);
    });
  }

  applySkirmishFormationPreview(troops) {
    troops.forEach((troop, index) => {
      const x = (Math.random() - 0.5) * troops.length * 0.7;
      const z = (Math.random() - 0.5) * 2;
      troop.position.set(x, 0, z);
    });
  }

  applyColumnFormationPreview(troops) {
    troops.forEach((troop, index) => {
      const x = 0;
      const z = index * 0.8;
      troop.position.set(x, 0, z);
    });
  }

  applyPincerFormationPreview(troops) {
    const half = Math.ceil(troops.length / 2);
    troops.forEach((troop, index) => {
      const group = index < half ? -1 : 1;
      const x = group * 2 * 0.8 + (Math.random() - 0.5) * 0.8;
      const z = (index % half - half/2) * 0.8;
      troop.position.set(x, 0, z);
    });
  }

  applyTurtleFormationPreview(troops) {
    const side = Math.ceil(Math.sqrt(troops.length));
    troops.forEach((troop, index) => {
      const row = Math.floor(index / side);
      const col = index % side;
      const x = (col - side/2) * 0.7;
      const z = (row - side/2) * 0.7;
      troop.position.set(x, 0, z);
    });
  }

  applyDefaultFormationPreview(troops) {
    troops.forEach((troop, index) => {
      const row = Math.floor(index / 5);
      const col = index % 5;
      const x = (col - 2) * 0.8;
      const z = (row - 1) * 0.8;
      troop.position.set(x, 0, z);
    });
  }

  // Generate random enemy formation
  generateRandomEnemyFormation() {
    const formations = getFormations();
  return formations[Math.floor(Math.random() * formations.length)];
  }

  // Get formation by name
  getFormationByName(name) {
    const formations = getFormations();
  return formations.find(f => f.name.toLowerCase() === name.toLowerCase());
  }

  // Get all available formations
  getAllFormations() {
    return getFormations();
  }
}

// Create singleton instance
const formationManager = new FormationManager();

// Export functions for backward compatibility
export function positionTroopsInFormation(troops, formation, isPlayer) {
  return formationManager.positionTroopsInFormation(troops, formation, isPlayer);
}

export function positionTroopsInFormationPreview(troops, formation) {
  return formationManager.positionTroopsInFormationPreview(troops, formation);
}

export function generateFormationFromPrompt(prompt) {
  return formationManager.generateFormationFromPrompt(prompt);
}

export function detectFormationType(formationName) {
  return formationManager.detectFormationType(formationName);
}

export function generateRandomEnemyFormation() {
  return formationManager.generateRandomEnemyFormation();
}

export function getFormationByName(name) {
  return formationManager.getFormationByName(name);
}

export function getAllFormations() {
  return formationManager.getAllFormations();
}

// Export the manager instance for advanced usage
export { formationManager }; 