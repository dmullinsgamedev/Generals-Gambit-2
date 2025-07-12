// Effect Manager Module
// Centralizes all visual effects, projectiles, and animations

import { simpleLogger } from './logger.js';

class EffectManager {
  constructor() {
    this.projectiles = [];
    this.effects = [];
    this.scene = null;
    this.isInitialized = false;
    this.effectTypes = {
      ATTACK_FLASH: 'attack_flash',
      DEATH_EXPLOSION: 'death_explosion',
      PROJECTILE: 'projectile',
      MAGIC_SPARKLE: 'magic_sparkle',
      HEAL_GLOW: 'heal_glow',
      SHIELD_BREAK: 'shield_break'
    };
  }

  // Initialize the effect manager
  initialize(scene) {
    if (this.isInitialized) return;
    
    this.scene = scene;
    simpleLogger.addLog('INFO', ['Initializing Effect Manager']);
    
    this.isInitialized = true;
    simpleLogger.addLog('INFO', ['Effect Manager initialized successfully']);
  }

  // Create attack effect (flash)
  createAttackEffect(attacker, target) {
    if (!this.scene) {
      simpleLogger.addLog('WARN', ['Effect Manager not initialized with scene']);
      return;
    }

    simpleLogger.addLog('DEBUG', ['Creating attack effect']);
    
    // Create a flash effect at the target
    const flash = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 8, 8),
      new THREE.MeshBasicMaterial({ 
        color: 0xffff00, 
        transparent: true, 
        opacity: 0.8 
      })
    );
    
    flash.position.copy(target.mesh.position);
    flash.position.y += 0.5;
    this.scene.add(flash);
    
    // Store effect for cleanup
    const effect = {
      type: this.effectTypes.ATTACK_FLASH,
      mesh: flash,
      startTime: Date.now(),
      duration: 200
    };
    this.effects.push(effect);
    
    // Animate and remove flash
    setTimeout(() => {
      this.removeEffect(effect);
    }, 200);
  }

  // Create death effect (explosion)
  createDeathEffect(target) {
    if (!this.scene) {
      simpleLogger.addLog('WARN', ['Effect Manager not initialized with scene']);
      return;
    }

    simpleLogger.addLog('DEBUG', ['Creating death effect']);
    
    // Create explosion effect
    const explosion = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 8, 8),
      new THREE.MeshBasicMaterial({ 
        color: 0xff0000, 
        transparent: true, 
        opacity: 0.6 
      })
    );
    
    explosion.position.copy(target.mesh.position);
    explosion.position.y += 0.5;
    this.scene.add(explosion);
    
    // Store effect for cleanup
    const effect = {
      type: this.effectTypes.DEATH_EXPLOSION,
      mesh: explosion,
      startTime: Date.now(),
      scale: 0.5,
      opacity: 0.6
    };
    this.effects.push(effect);
    
    // Animate explosion
    this.animateExplosion(effect);
  }

  // Animate explosion effect
  animateExplosion(effect) {
    if (!effect.mesh || !effect.mesh.parent) return;
    
    effect.scale += 0.1;
    effect.mesh.scale.set(effect.scale, effect.scale, effect.scale);
    effect.opacity -= 0.02;
    effect.mesh.material.opacity = effect.opacity;
    
    if (effect.opacity > 0) {
      requestAnimationFrame(() => this.animateExplosion(effect));
    } else {
      this.removeEffect(effect);
    }
  }

  // Create projectile
  createProjectile(attacker, target) {
    if (!this.scene) {
      simpleLogger.addLog('WARN', ['Effect Manager not initialized with scene']);
      return;
    }

    simpleLogger.addLog('DEBUG', ['Creating projectile']);
    
    const projectile = {
      mesh: new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 8, 8),
        new THREE.MeshLambertMaterial({ 
          color: attacker.type === 'magic' ? 0x8e54e9 : 0xffd700 
        })
      ),
      startPos: { x: attacker.position.x, y: 0.5, z: attacker.position.z },
      endPos: { x: target.position.x, y: 0.5, z: target.position.z },
      progress: 0,
      speed: 0.1,
      type: this.effectTypes.PROJECTILE
    };
    
    projectile.mesh.position.copy(projectile.startPos);
    this.scene.add(projectile.mesh);
    this.projectiles.push(projectile);
  }

  // Update all projectiles
  updateProjectiles() {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      projectile.progress += projectile.speed;
      
      if (projectile.progress >= 1) {
        // Remove projectile
        this.removeProjectile(projectile, i);
      } else {
        // Update position
        projectile.mesh.position.x = projectile.startPos.x + (projectile.endPos.x - projectile.startPos.x) * projectile.progress;
        projectile.mesh.position.z = projectile.startPos.z + (projectile.endPos.z - projectile.startPos.z) * projectile.progress;
      }
    }
  }

  // Remove a projectile
  removeProjectile(projectile, index) {
    if (projectile.mesh && projectile.mesh.parent) {
      projectile.mesh.parent.remove(projectile.mesh);
    }
    this.projectiles.splice(index, 1);
  }

  // Remove an effect
  removeEffect(effect) {
    if (effect.mesh && effect.mesh.parent) {
      effect.mesh.parent.remove(effect.mesh);
    }
    const index = this.effects.indexOf(effect);
    if (index > -1) {
      this.effects.splice(index, 1);
    }
  }

  // Create magic sparkle effect
  createMagicSparkle(position) {
    if (!this.scene) return;

    const sparkle = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.1),
      new THREE.MeshBasicMaterial({ 
        color: 0x8e54e9, 
        transparent: true, 
        opacity: 0.8 
      })
    );
    
    sparkle.position.copy(position);
    sparkle.position.y += 0.5;
    this.scene.add(sparkle);
    
    const effect = {
      type: this.effectTypes.MAGIC_SPARKLE,
      mesh: sparkle,
      startTime: Date.now(),
      duration: 500
    };
    this.effects.push(effect);
    
    // Animate sparkle
    this.animateSparkle(effect);
  }

  // Animate sparkle effect
  animateSparkle(effect) {
    if (!effect.mesh || !effect.mesh.parent) return;
    
    const elapsed = Date.now() - effect.startTime;
    const progress = elapsed / effect.duration;
    
    if (progress < 1) {
      effect.mesh.rotation.y += 0.2;
      effect.mesh.rotation.z += 0.1;
      effect.mesh.material.opacity = 0.8 * (1 - progress);
      requestAnimationFrame(() => this.animateSparkle(effect));
    } else {
      this.removeEffect(effect);
    }
  }

  // Create heal glow effect
  createHealGlow(target) {
    if (!this.scene) return;

    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.8, 8, 8),
      new THREE.MeshBasicMaterial({ 
        color: 0x00ff00, 
        transparent: true, 
        opacity: 0.4 
      })
    );
    
    glow.position.copy(target.mesh.position);
    glow.position.y += 0.5;
    this.scene.add(glow);
    
    const effect = {
      type: this.effectTypes.HEAL_GLOW,
      mesh: glow,
      startTime: Date.now(),
      duration: 1000
    };
    this.effects.push(effect);
    
    // Animate heal glow
    this.animateHealGlow(effect);
  }

  // Animate heal glow effect
  animateHealGlow(effect) {
    if (!effect.mesh || !effect.mesh.parent) return;
    
    const elapsed = Date.now() - effect.startTime;
    const progress = elapsed / effect.duration;
    
    if (progress < 1) {
      effect.mesh.position.y += 0.01;
      effect.mesh.material.opacity = 0.4 * (1 - progress);
      requestAnimationFrame(() => this.animateHealGlow(effect));
    } else {
      this.removeEffect(effect);
    }
  }

  // Create shield break effect
  createShieldBreak(target) {
    if (!this.scene) return;

    const shield = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 8, 8),
      new THREE.MeshBasicMaterial({ 
        color: 0x0088ff, 
        transparent: true, 
        opacity: 0.6,
        wireframe: true
      })
    );
    
    shield.position.copy(target.mesh.position);
    shield.position.y += 0.5;
    this.scene.add(shield);
    
    const effect = {
      type: this.effectTypes.SHIELD_BREAK,
      mesh: shield,
      startTime: Date.now(),
      duration: 800
    };
    this.effects.push(effect);
    
    // Animate shield break
    this.animateShieldBreak(effect);
  }

  // Animate shield break effect
  animateShieldBreak(effect) {
    if (!effect.mesh || !effect.mesh.parent) return;
    
    const elapsed = Date.now() - effect.startTime;
    const progress = elapsed / effect.duration;
    
    if (progress < 1) {
      effect.mesh.scale.setScalar(1 + progress * 0.5);
      effect.mesh.material.opacity = 0.6 * (1 - progress);
      requestAnimationFrame(() => this.animateShieldBreak(effect));
    } else {
      this.removeEffect(effect);
    }
  }

  // Clear all effects and projectiles
  clearAll() {
    simpleLogger.addLog('INFO', ['Clearing all effects and projectiles']);
    
    // Clear projectiles
    this.projectiles.forEach(projectile => {
      if (projectile.mesh && projectile.mesh.parent) {
        projectile.mesh.parent.remove(projectile.mesh);
      }
    });
    this.projectiles = [];
    
    // Clear effects
    this.effects.forEach(effect => {
      if (effect.mesh && effect.mesh.parent) {
        effect.mesh.parent.remove(effect.mesh);
      }
    });
    this.effects = [];
  }

  // Update all effects (called each frame)
  update(deltaTime) {
    this.updateProjectiles();
    
    // Clean up expired effects
    const now = Date.now();
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const effect = this.effects[i];
      if (effect.duration && (now - effect.startTime) > effect.duration) {
        this.removeEffect(effect);
      }
    }
  }

  // Get effect statistics
  getEffectStats() {
    return {
      activeProjectiles: this.projectiles.length,
      activeEffects: this.effects.length,
      effectTypes: Object.keys(this.effectTypes),
      isInitialized: this.isInitialized
    };
  }

  // Set scene reference (for late initialization)
  setScene(scene) {
    this.scene = scene;
    if (!this.isInitialized) {
      this.initialize(scene);
    }
  }

  // Get current projectiles (for backward compatibility)
  getProjectiles() {
    return this.projectiles;
  }

  // Destroy the effect manager
  destroy() {
    this.clearAll();
    this.scene = null;
    this.isInitialized = false;
    simpleLogger.addLog('INFO', ['Effect Manager destroyed']);
  }
}

// Create singleton instance
const effectManager = new EffectManager();

// Export functions for backward compatibility
export function createAttackEffect(attacker, target) {
  return effectManager.createAttackEffect(attacker, target);
}

export function createDeathEffect(target) {
  return effectManager.createDeathEffect(target);
}

export function createProjectile(attacker, target) {
  return effectManager.createProjectile(attacker, target);
}

export function updateProjectiles() {
  return effectManager.updateProjectiles();
}

export function clearAllEffects() {
  return effectManager.clearAll();
}

// Export the manager instance for advanced usage
export { effectManager }; 