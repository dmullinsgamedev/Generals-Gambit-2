/**
 * Battle Logic Manager
 * Handles battle mechanics, troop movement, combat, and battle state
 */

import { simpleLogger } from './logger.js';
import { configManager } from './configManager.js';
import { terrainManager } from './terrainManager.js';
import { effectManager } from './effectManager.js';

class BattleLogicManager {
  constructor() {
    this.isInitialized = false;
    this.battleActive = false;
    this.battleStartTime = 0;
    this.lastUpdateTime = 0;
  }

  initialize() {
    simpleLogger.addLog('INFO', ['Initializing Battle Logic Manager']);
    this.isInitialized = true;
    simpleLogger.addLog('INFO', ['Battle Logic Manager initialized']);
  }

  startBattle(playerTroops, enemyTroops, playerGeneral, enemyGeneral) {
    simpleLogger.addLog('INFO', ['Starting battle...']);
    
    this.battleActive = true;
    this.battleStartTime = Date.now();
    this.lastUpdateTime = Date.now();
    
    // Initialize battle state
    this.playerTroops = playerTroops;
    this.enemyTroops = enemyTroops;
    this.playerGeneral = playerGeneral;
    this.enemyGeneral = enemyGeneral;
    
    simpleLogger.addLog('INFO', ['Battle started with', playerTroops.length, 'player troops and', enemyTroops.length, 'enemy troops']);
  }

  updateBattle(deltaTime) {
    if (!this.battleActive) return;
    simpleLogger.addLog('DEBUG', [
      'updateBattle called',
      'playerTroops:', this.playerTroops ? this.playerTroops.length : 'none',
      'enemyTroops:', this.enemyTroops ? this.enemyTroops.length : 'none',
      'playerGeneral:', this.playerGeneral,
      'enemyGeneral:', this.enemyGeneral
    ]);
    // Update troop movement
    this.updateTroopMovement(this.playerTroops, this.enemyTroops, this.enemyGeneral);
    this.updateTroopMovement(this.enemyTroops, this.playerTroops, this.playerGeneral);
    
    // Update general combat
    this.updateGeneralCombat();
    
    // Check for battle end
    this.checkBattleEnd();
  }

  updateTroopMovement(troops, enemyTroops, enemyGeneral) {
    const speed = configManager.get('troops', 'baseSpeed', 0.02);
    for (let i = 0; i < troops.length; i++) {
      const troop = troops[i];
      if (troop.hp <= 0) continue;

      // Log troop stats for debugging
      if (i === 0) {
        simpleLogger.addLog('DEBUG', [`Troop ${troop.isPlayer ? 'P' : 'E'}[${i}] stats - range: ${troop.range}, atk: ${troop.atk}, cooldown: ${troop.cooldown}`]);
      }

      // Find nearest enemy
      const nearestEnemy = this.findNearestEnemy(troop, enemyTroops, enemyGeneral);
      if (!nearestEnemy) continue;

      // Calculate direction to enemy
      const direction = {
        x: nearestEnemy.position.x - troop.position.x,
        z: nearestEnemy.position.z - troop.position.z
      };
      // Normalize direction
      const distance = Math.sqrt(direction.x * direction.x + direction.z * direction.z);
      if (distance > 0) {
        direction.x /= distance;
        direction.z /= distance;
      }
      // Move at configured speed
      troop.position.x += direction.x * speed;
      troop.position.z += direction.z * speed;
      // Update mesh position
      if (troop.mesh) {
        troop.mesh.position.copy(troop.position);
        // Adjust Y position based on terrain
        const terrainHeight = terrainManager.getTerrainHeightAt(troop.position.x, troop.position.z);
        troop.mesh.position.y = terrainHeight + 0.5;
      }
      // Log position after movement
      if (i === 0) simpleLogger.addLog('DEBUG', [`Troop ${troop.isPlayer ? 'P' : 'E'}[${i}] pos after:`, JSON.stringify(troop.position)]);
      // Attack if in range
      if (distance <= troop.range) {
        simpleLogger.addLog('DEBUG', [`Troop ${troop.isPlayer ? 'P' : 'E'}[${i}] in range (${distance.toFixed(2)} <= ${troop.range}), attempting attack...`]);
        this.attack(troop, nearestEnemy);
      } else {
        // Log when not in range
        if (i === 0) simpleLogger.addLog('DEBUG', [`Troop ${troop.isPlayer ? 'P' : 'E'}[${i}] not in range (${distance.toFixed(2)} > ${troop.range}), moving closer...`]);
      }
    }
  }

  updateGeneralCombat() {
    if (!this.playerGeneral || !this.enemyGeneral) return;

    const alivePlayerTroops = this.playerTroops.filter(troop => troop.hp > 0);
    const aliveEnemyTroops = this.enemyTroops.filter(troop => troop.hp > 0);

    // Only engage if no troops are left
    if (alivePlayerTroops.length === 0 && aliveEnemyTroops.length === 0) {
      const distance = this.getDistance(this.playerGeneral, this.enemyGeneral);
      
      if (distance <= this.playerGeneral.range) {
        this.attack(this.playerGeneral, this.enemyGeneral);
      }
      
      if (distance <= this.enemyGeneral.range) {
        this.attack(this.enemyGeneral, this.playerGeneral);
      }
    }
  }

  findNearestEnemy(troop, enemies, general = null) {
    let nearestEnemy = null;
    let nearestDistance = Infinity;

    // Check enemy troops first - ALWAYS prioritize troops over generals
    const aliveEnemyTroops = enemies.filter(enemy => enemy.hp > 0);
    for (const enemy of aliveEnemyTroops) {
      const distance = this.getDistance(troop, enemy);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestEnemy = enemy;
      }
    }

    // Only target general if NO enemy troops are alive
    if (aliveEnemyTroops.length === 0 && general && general.hp > 0) {
      const distance = this.getDistance(troop, general);
      nearestEnemy = general;
      nearestDistance = distance;
      simpleLogger.addLog('DEBUG', [`Troop targeting general because no enemy troops remain. Distance: ${distance.toFixed(2)}`]);
    }

    return nearestEnemy;
  }

  getDistance(troop1, troop2) {
    const dx = troop1.position.x - troop2.position.x;
    const dz = troop1.position.z - troop2.position.z;
    return Math.sqrt(dx * dx + dz * dz);
  }

  attack(attacker, target) {
    // Check cooldown - reduce cooldown for faster combat
    if (attacker.cooldown > 0) {
      attacker.cooldown--;
      return;
    }
    // Calculate damage
    const damage = attacker.atk || 10;
    target.hp -= damage;
    // Reset cooldown - make it faster (1 frame instead of 3)
    attacker.cooldown = 1;
    // Log attack
    simpleLogger.addLog('DEBUG', [`${attacker.type || 'Troop'} (${attacker.isPlayer ? 'P' : 'E'}) attacked ${target.type || 'Troop'} (${target.isPlayer ? 'P' : 'E'}) for ${damage} damage. Target HP: ${target.hp}`]);
    
    // Create attack effect
    effectManager.createAttackEffect(attacker, target);
    
    // Check if target died
    if (target.hp <= 0) {
      target.hp = 0;
      simpleLogger.addLog('INFO', [`${target.type || 'Troop'} defeated!`]);
      
      // Create death effect
      effectManager.createDeathEffect(target);
      
      // Remove mesh from scene
      if (target.mesh && target.mesh.parent) {
        target.mesh.parent.remove(target.mesh);
      }
    }
  }

  checkBattleEnd() {
    const playerTroopsAlive = this.playerTroops.some(troop => troop.hp > 0);
    const enemyTroopsAlive = this.enemyTroops.some(troop => troop.hp > 0);
    const playerGeneralAlive = this.playerGeneral && this.playerGeneral.hp > 0;
    const enemyGeneralAlive = this.enemyGeneral && this.enemyGeneral.hp > 0;

    // Battle ends when one side has no troops and no general
    const playerDefeated = !playerTroopsAlive && !playerGeneralAlive;
    const enemyDefeated = !enemyTroopsAlive && !enemyGeneralAlive;

    if (playerDefeated || enemyDefeated) {
      this.endBattle(!playerDefeated); // Player won if enemy is defeated
    }
  }

  endBattle(playerWon) {
    this.battleActive = false;
    const battleDuration = (Date.now() - this.battleStartTime) / 1000;
    
    simpleLogger.addLog('INFO', [`Battle ended. Player ${playerWon ? 'won' : 'lost'} after ${battleDuration.toFixed(1)} seconds`]);
    
    // Trigger battle end callback
    if (this.onBattleEnd) {
      this.onBattleEnd(playerWon, battleDuration);
    }
  }

  getBattleStats() {
    if (!this.battleActive) {
      return { active: false };
    }

    const battleDuration = (Date.now() - this.battleStartTime) / 1000;
    const alivePlayerTroops = this.playerTroops.filter(troop => troop.hp > 0).length;
    const aliveEnemyTroops = this.enemyTroops.filter(troop => troop.hp > 0).length;
    const playerGeneralHP = this.playerGeneral ? this.playerGeneral.hp : 0;
    const enemyGeneralHP = this.enemyGeneral ? this.enemyGeneral.hp : 0;

    return {
      active: this.battleActive,
      duration: battleDuration,
      playerTroops: {
        total: this.playerTroops.length,
        alive: alivePlayerTroops,
        generalHP: playerGeneralHP
      },
      enemyTroops: {
        total: this.enemyTroops.length,
        alive: aliveEnemyTroops,
        generalHP: enemyGeneralHP
      }
    };
  }

  stopBattle() {
    this.battleActive = false;
    simpleLogger.addLog('INFO', ['Battle stopped']);
  }

  destroy() {
    this.stopBattle();
    this.isInitialized = false;
    simpleLogger.addLog('INFO', ['Battle Logic Manager destroyed']);
  }
}

// Create singleton instance
const battleLogicManager = new BattleLogicManager();

// Export functions for backward compatibility
export function startBattle(playerTroops, enemyTroops, playerGeneral, enemyGeneral) {
  return battleLogicManager.startBattle(playerTroops, enemyTroops, playerGeneral, enemyGeneral);
}

export function updateBattle(deltaTime) {
  return battleLogicManager.updateBattle(deltaTime);
}

export function getBattleStats() {
  return battleLogicManager.getBattleStats();
}

export function stopBattle() {
  return battleLogicManager.stopBattle();
}

// Export the manager instance for advanced usage
export { battleLogicManager }; 