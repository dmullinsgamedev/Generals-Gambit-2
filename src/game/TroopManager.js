// ============================================================================
// TROOP MANAGEMENT SYSTEM
// ============================================================================

import { gameState } from '../core/GameState.js';
import { gameRenderer } from '../rendering/Renderer.js';
import { generateCustomTroopMesh, generateCustomGeneralMesh } from '../generation/TroopGenerator.js';
import { TROOP_TYPES } from '../data/GameData.js';

export class TroopManager {
  constructor() {
    this.playerTroops = [];
    this.enemyTroops = [];
    this.playerGeneral = null;
    this.enemyGeneral = null;
  }
  
  // Clear all troops and generals
  clearAll() {
    this.clearTroops();
    this.clearGenerals();
  }
  
  clearTroops() {
    // Remove from scene
    [...this.playerTroops, ...this.enemyTroops].forEach(troop => {
      if (troop && troop.mesh) {
        gameRenderer.removeFromScene(troop.mesh);
      }
    });
    
    this.playerTroops = [];
    this.enemyTroops = [];
    gameState.setPlayerTroops([]);
    gameState.setEnemyTroops([]);
  }
  
  clearGenerals() {
    if (this.playerGeneral && this.playerGeneral.mesh) {
      gameRenderer.removeFromScene(this.playerGeneral.mesh);
    }
    if (this.enemyGeneral && this.enemyGeneral.mesh) {
      gameRenderer.removeFromScene(this.enemyGeneral.mesh);
    }
    
    this.playerGeneral = null;
    this.enemyGeneral = null;
  }
  
  // Create generals
  createGenerals() {
    if (gameState.player && gameState.enemy) {
      this.playerGeneral = this.createGeneral(true, gameState.player);
      this.enemyGeneral = this.createGeneral(false, gameState.enemy);
    }
  }
  
  createGeneral(isPlayer, generalData) {
    const prompt = generalData.prompt || `${generalData.name} general`;
    const color = generalData.color || (isPlayer ? 0x1da1f2 : 0xff5e62);
    
    const { mesh } = generateCustomGeneralMesh(prompt, isPlayer, color);
    
    // Position general
    const x = isPlayer ? -20 : 20;
    const z = 0;
    mesh.position.set(x, 0, z);
    
    // Update terrain height
    const terrainHeight = gameRenderer.getTerrainHeightAt(x, z);
    mesh.position.y = terrainHeight + gameRenderer.FOOT_OFFSET;
    
    // Add to scene
    gameRenderer.addToScene(mesh);
    
    // Create general object with game properties
    const general = {
      name: generalData.name,
      hp: generalData.hp,
      position: mesh.position,
      mesh: mesh,
      isPlayer: isPlayer,
      prompt: prompt,
      troops: generalData.troops
    };
    
    return general;
  }
  
  // Initialize troops for battle
  initializeTroops() {
    this.clearTroops();
    
    if (!gameState.player || !gameState.enemy) {
      console.error('Cannot initialize troops: missing player or enemy data');
      return;
    }
    
    // Create player troops
    const playerTroopType = gameState.player.troops || 'melee';
    const playerColor = gameState.player.color || 0x1da1f2;
    this.playerTroops = this.createTroopGroup(true, playerTroopType, playerColor, 10);
    
    // Create enemy troops
    const enemyTroopType = gameState.enemy.troops || 'melee';
    const enemyColor = gameState.enemy.color || 0xff5e62;
    this.enemyTroops = this.createTroopGroup(false, enemyTroopType, enemyColor, 10);
    
    // Update game state
    gameState.setPlayerTroops(this.playerTroops);
    gameState.setEnemyTroops(this.enemyTroops);
  }
  
  createTroopGroup(isPlayer, troopType, color, count) {
    const troops = [];
    const baseX = isPlayer ? -15 : 15;
    const baseZ = 0;
    
    for (let i = 0; i < count; i++) {
      const troop = this.createTroop(isPlayer, troopType, color);
      
      // Position troop in a rough formation
      const row = Math.floor(i / 5);
      const col = i % 5;
      troop.position.set(
        baseX + (col - 2) * 1.5,
        0,
        baseZ + (row - 1) * 1.5
      );
      
      // Update terrain height
      const terrainHeight = gameRenderer.getTerrainHeightAt(troop.position.x, troop.position.z);
      troop.position.y = terrainHeight + gameRenderer.FOOT_OFFSET;
      
      troops.push(troop);
    }
    
    return troops;
  }
  
  createTroop(isPlayer, troopType, color) {
    // Generate troop mesh
    const prompt = `${troopType} warrior`;
    const { mesh } = generateCustomTroopMesh(prompt, isPlayer, color);
    
    // Add to scene
    gameRenderer.addToScene(mesh);
    
    // Get troop stats
    const stats = TROOP_TYPES[troopType] || TROOP_TYPES.melee;
    
    // Create troop object with game properties
    const troop = {
      name: `${troopType} warrior`,
      hp: stats.hp,
      attack: stats.atk,
      range: stats.range,
      attackRate: stats.rate,
      position: mesh.position,
      mesh: mesh,
      isPlayer: isPlayer,
      troopType: troopType,
      lastAttack: undefined
    };
    
    return troop;
  }
  
  // Position troops in formation
  positionTroopsInFormation(troops, formation, isPlayer) {
    if (!formation) return;
    
    const baseX = isPlayer ? -15 : 15;
    const baseZ = 0;
    
    // Calculate formation positions
    const positions = this.calculateFormationPositions(formation.name, troops.length);
    
    for (let i = 0; i < troops.length; i++) {
      const troop = troops[i];
      const pos = positions[i] || { x: 0, z: 0 };
      
      troop.position.set(
        baseX + pos.x,
        0,
        baseZ + pos.z
      );
      
      // Update terrain height
      const terrainHeight = gameRenderer.getTerrainHeightAt(troop.position.x, troop.position.z);
      troop.position.y = terrainHeight + gameRenderer.FOOT_OFFSET;
    }
  }
  
  calculateFormationPositions(formationName, troopCount) {
    const positions = [];
    
    switch (formationName.toLowerCase()) {
      case 'phalanx':
        // Dense rectangular formation
        const rows = Math.ceil(Math.sqrt(troopCount));
        const cols = Math.ceil(troopCount / rows);
        for (let i = 0; i < troopCount; i++) {
          const row = Math.floor(i / cols);
          const col = i % cols;
          positions.push({ x: (col - cols/2) * 1.2, z: (row - rows/2) * 1.2 });
        }
        break;
        
      case 'wedge':
        // Triangular formation
        let row = 0;
        let col = 0;
        let troopsInRow = 1;
        for (let i = 0; i < troopCount; i++) {
          positions.push({ x: (col - troopsInRow/2) * 1.5, z: row * 1.5 });
          col++;
          if (col >= troopsInRow) {
            row++;
            col = 0;
            troopsInRow++;
          }
        }
        break;
        
      case 'line':
        // Simple line formation
        for (let i = 0; i < troopCount; i++) {
          positions.push({ x: (i - troopCount/2) * 1.5, z: 0 });
        }
        break;
        
      default:
        // Default circular formation
        for (let i = 0; i < troopCount; i++) {
          const angle = (i / troopCount) * Math.PI * 2;
          const radius = 3;
          positions.push({ 
            x: Math.cos(angle) * radius, 
            z: Math.sin(angle) * radius 
          });
        }
    }
    
    return positions;
  }
  
  // Get troop statistics
  getTroopStats() {
    const playerAlive = this.playerTroops.filter(troop => troop.hp > 0).length;
    const enemyAlive = this.enemyTroops.filter(troop => troop.hp > 0).length;
    
    return {
      player: {
        total: this.playerTroops.length,
        alive: playerAlive,
        dead: this.playerTroops.length - playerAlive
      },
      enemy: {
        total: this.enemyTroops.length,
        alive: enemyAlive,
        dead: this.enemyTroops.length - enemyAlive
      }
    };
  }
}

// Create and export singleton instance
export const troopManager = new TroopManager(); 