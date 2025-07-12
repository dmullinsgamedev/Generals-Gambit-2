// ============================================================================
// BATTLE SYSTEM
// ============================================================================

import { gameState } from '../core/GameState.js';
import { gameRenderer } from '../rendering/Renderer.js';
import { gameLogger } from '../core/Logger.js';

export class BattleSystem {
  constructor() {
    this.battleActive = false;
    this.battleInterval = null;
  }
  
  startBattle() {
    if (this.battleActive) return;
    
    this.battleActive = true;
    gameState.startBattle();
    gameState.setPhase('battle');
    
    // Start battle loop
    this.battleInterval = setInterval(() => {
      this.battleLoop();
    }, 50); // 20 FPS
    
    gameLogger.addLog('INFO', ['Battle started']);
  }
  
  stopBattle() {
    if (!this.battleActive) return;
    
    this.battleActive = false;
    if (this.battleInterval) {
      clearInterval(this.battleInterval);
      this.battleInterval = null;
    }
    
    gameLogger.addLog('INFO', ['Battle stopped']);
  }
  
  battleLoop() {
    gameState.updateBattleTimer();
    
    // Update all troops
    this.updateTroops(gameState.playerTroops, gameState.enemyTroops, gameState.enemy);
    this.updateTroops(gameState.enemyTroops, gameState.playerTroops, gameState.player);
    
    // Update generals
    this.updateGeneralCombat();
    
    // Check for battle end
    this.checkBattleEnd();
  }
  
  updateTroops(troops, enemyTroops, enemyGeneral) {
    for (const troop of troops) {
      if (troop.hp <= 0) continue;
      
      // Find nearest enemy
      const nearestEnemy = this.findNearestEnemy(troop, enemyTroops, enemyGeneral);
      if (!nearestEnemy) continue;
      
      const distance = this.getDistance(troop, nearestEnemy);
      
      // Attack if in range
      if (distance <= troop.range) {
        if (troop.lastAttack === undefined || Date.now() - troop.lastAttack > troop.attackRate * 100) {
          this.attack(troop, nearestEnemy);
          troop.lastAttack = Date.now();
        }
      } else {
        // Move towards enemy
        this.updateTroopMovement(troop, nearestEnemy);
      }
    }
  }
  
  updateTroopMovement(troop, target) {
    const speed = 0.05;
    const direction = new THREE.Vector3()
      .subVectors(target.position, troop.position)
      .normalize();
    
    // Apply formation bonuses
    const formation = troop.isPlayer ? gameState.playerFormation : gameState.enemyFormation;
    if (formation) {
      direction.multiplyScalar(speed * formation.bonus.speed);
    } else {
      direction.multiplyScalar(speed);
    }
    
    troop.position.add(direction);
    
    // Update terrain height
    const terrainHeight = gameRenderer.getTerrainHeightAt(troop.position.x, troop.position.z);
    troop.position.y = terrainHeight + gameRenderer.FOOT_OFFSET;
  }
  
  updateGeneralCombat() {
    const playerGeneral = gameState.player;
    const enemyGeneral = gameState.enemy;
    
    if (!playerGeneral || !enemyGeneral) return;
    
    // Check if generals are close enough to fight
    const distance = this.getDistance(playerGeneral, enemyGeneral);
    if (distance <= 3) { // General melee range
      // Simple general combat - both take damage
      if (!playerGeneral.lastAttack || Date.now() - playerGeneral.lastAttack > 1000) {
        gameState.updateEnemyHP(-5);
        playerGeneral.lastAttack = Date.now();
      }
      
      if (!enemyGeneral.lastAttack || Date.now() - enemyGeneral.lastAttack > 1000) {
        gameState.updatePlayerHP(-5);
        enemyGeneral.lastAttack = Date.now();
      }
    }
  }
  
  findNearestEnemy(troop, enemies, general = null) {
    let nearest = null;
    let nearestDistance = Infinity;
    
    // Check enemy troops
    for (const enemy of enemies) {
      if (enemy.hp <= 0) continue;
      const distance = this.getDistance(troop, enemy);
      if (distance < nearestDistance) {
        nearest = enemy;
        nearestDistance = distance;
      }
    }
    
    // Check enemy general if no troops found or general is closer
    if (general) {
      const generalDistance = this.getDistance(troop, general);
      if (generalDistance < nearestDistance) {
        nearest = general;
        nearestDistance = generalDistance;
      }
    }
    
    return nearest;
  }
  
  getDistance(obj1, obj2) {
    return obj1.position.distanceTo(obj2.position);
  }
  
  attack(attacker, target) {
    // Calculate damage with formation bonuses
    let damage = attacker.attack;
    const formation = attacker.isPlayer ? gameState.playerFormation : gameState.enemyFormation;
    if (formation) {
      damage *= formation.bonus.atk;
    }
    
    // Apply damage
    target.hp -= damage;
    
    // Create attack effect
    this.createAttackEffect(attacker, target);
    
    // Check if target died
    if (target.hp <= 0) {
      target.hp = 0;
      this.createDeathEffect(target);
      
      // Remove from scene
      gameRenderer.removeFromScene(target);
    }
    
    gameLogger.addLog('INFO', [`${attacker.name || 'Troop'} attacked ${target.name || 'Enemy'} for ${damage.toFixed(1)} damage`]);
  }
  
  createAttackEffect(attacker, target) {
    // Create a simple attack effect (spark)
    const spark = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffff00 })
    );
    
    spark.position.copy(target.position);
    spark.position.y += 1;
    gameRenderer.addToScene(spark);
    
    // Remove after animation
    setTimeout(() => {
      gameRenderer.removeFromScene(spark);
    }, 200);
  }
  
  createDeathEffect(target) {
    // Create explosion effect
    const explosion = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    
    explosion.position.copy(target.position);
    explosion.position.y += 0.5;
    gameRenderer.addToScene(explosion);
    
    // Animate explosion
    let scale = 0.5;
    const animateExplosion = () => {
      scale += 0.1;
      explosion.scale.set(scale, scale, scale);
      explosion.material.opacity = 1 - (scale - 0.5) / 2;
      
      if (scale < 2.5) {
        requestAnimationFrame(animateExplosion);
      } else {
        gameRenderer.removeFromScene(explosion);
      }
    };
    animateExplosion();
  }
  
  checkBattleEnd() {
    const playerTroopsAlive = gameState.playerTroops.some(troop => troop.hp > 0);
    const enemyTroopsAlive = gameState.enemyTroops.some(troop => troop.hp > 0);
    const playerGeneralAlive = gameState.playerHP > 0;
    const enemyGeneralAlive = gameState.enemyHP > 0;
    
    // Check win conditions
    let playerWon = false;
    let enemyWon = false;
    
    if (!enemyTroopsAlive && !enemyGeneralAlive) {
      playerWon = true;
    } else if (!playerTroopsAlive && !playerGeneralAlive) {
      enemyWon = true;
    }
    
    // Check timeout (30 seconds)
    if (gameState.state.battleTimer > 30) {
      // Determine winner by remaining HP
      const playerTotalHP = gameState.playerHP + gameState.playerTroops.reduce((sum, troop) => sum + troop.hp, 0);
      const enemyTotalHP = gameState.enemyHP + gameState.enemyTroops.reduce((sum, troop) => sum + troop.hp, 0);
      
      if (playerTotalHP > enemyTotalHP) {
        playerWon = true;
      } else if (enemyTotalHP > playerTotalHP) {
        enemyWon = true;
      } else {
        // Tie - player wins by default
        playerWon = true;
      }
    }
    
    if (playerWon || enemyWon) {
      this.endBattle(playerWon);
    }
  }
  
  endBattle(playerWon) {
    this.stopBattle();
    gameState.setPhase('end');
    
    // Update scores
    if (playerWon) {
      gameState.state.playerScore++;
    } else {
      gameState.state.enemyScore++;
    }
    
    // Save score
    gameState.addScore({
      player: gameState.player.name,
      enemy: gameState.enemy.name,
      playerScore: gameState.state.playerScore,
      enemyScore: gameState.state.enemyScore,
      timestamp: new Date().toISOString()
    });
    
    gameLogger.addLog('INFO', [`Battle ended. Player ${playerWon ? 'won' : 'lost'}`]);
    
    // Trigger end battle event
    if (window.onBattleEnd) {
      window.onBattleEnd(playerWon);
    }
  }
  
  // Position troops in formation
  positionTroopsInFormation(troops, formation, isPlayer) {
    if (!formation) return;
    
    const formationData = formation;
    const baseX = isPlayer ? -15 : 15;
    const baseZ = 0;
    
    // Calculate formation positions based on formation type
    const positions = this.calculateFormationPositions(formationData.name, troops.length);
    
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
}

// Create and export singleton instance
export const battleSystem = new BattleSystem(); 