// Battle System Module - Handles combat logic and troop interactions
class BattleSystem {
    constructor() {
        this.projectiles = [];
        this.battleTimer = 0;
        this.battleStart = 0;
        this.isActive = false;
        console.log('Battle system initialized');
    }

    // Start a new battle
    startBattle() {
        this.isActive = true;
        this.battleStart = Date.now();
        this.battleTimer = 0;
        this.projectiles = [];
        console.log('Battle started');
    }

    // End the current battle
    endBattle() {
        this.isActive = false;
        this.projectiles = [];
        console.log('Battle ended');
    }

    // Update battle state (called each frame)
    update(deltaTime) {
        if (!this.isActive) return;

        this.battleTimer += deltaTime;
        this.updateProjectiles();
    }

    // Update projectile positions and effects
    updateProjectiles() {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            
            // Update position
            projectile.x += projectile.vx;
            projectile.y += projectile.vy;
            projectile.z += projectile.vz;
            
            // Check if projectile hit target
            if (this.checkProjectileHit(projectile)) {
                this.projectiles.splice(i, 1);
            }
            // Remove projectiles that are too far
            else if (this.isProjectileOutOfBounds(projectile)) {
                this.projectiles.splice(i, 1);
            }
        }
    }

    // Check if projectile hit its target
    checkProjectileHit(projectile) {
        if (!projectile.target) return false;
        
        const distance = this.getDistance(projectile, projectile.target);
        return distance < 2; // Hit radius
    }

    // Check if projectile is out of bounds
    isProjectileOutOfBounds(projectile) {
        return Math.abs(projectile.x) > 50 || 
               Math.abs(projectile.y) > 50 || 
               Math.abs(projectile.z) > 50;
    }

    // Calculate distance between two objects
    getDistance(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        const dz = obj1.z - obj2.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    // Create a projectile
    createProjectile(attacker, target) {
        const projectile = {
            x: attacker.x,
            y: attacker.y + 1,
            z: attacker.z,
            vx: (target.x - attacker.x) * 0.1,
            vy: (target.y - attacker.y) * 0.1,
            vz: (target.z - attacker.z) * 0.1,
            target: target,
            damage: attacker.damage || 10
        };
        
        this.projectiles.push(projectile);
        console.log('Projectile created:', projectile);
        return projectile;
    }

    // Handle attack between two units
    attack(attacker, target) {
        if (!attacker || !target) return false;
        
        // Calculate damage
        const damage = attacker.damage || 10;
        const accuracy = attacker.accuracy || 0.8;
        
        // Check if attack hits
        if (Math.random() > accuracy) {
            console.log(`${attacker.name || 'Unit'} missed ${target.name || 'target'}`);
            return false;
        }
        
        // Apply damage
        if (target.health !== undefined) {
            target.health -= damage;
            target.health = Math.max(0, target.health);
            console.log(`${attacker.name || 'Unit'} hit ${target.name || 'target'} for ${damage} damage`);
            
            // Create attack effect
            this.createAttackEffect(attacker, target);
            
            // Check if target is defeated
            if (target.health <= 0) {
                this.handleUnitDeath(target);
            }
            
            return true;
        }
        
        return false;
    }

    // Create visual attack effect
    createAttackEffect(attacker, target) {
        // This would create visual effects like particles or animations
        console.log(`Attack effect created between ${attacker.name || 'attacker'} and ${target.name || 'target'}`);
    }

    // Handle unit death
    handleUnitDeath(unit) {
        console.log(`${unit.name || 'Unit'} has been defeated`);
        // This would trigger death animations, sound effects, etc.
        this.createDeathEffect(unit);
    }

    // Create death effect
    createDeathEffect(unit) {
        console.log(`Death effect created for ${unit.name || 'unit'}`);
        // This would create explosion effects, particles, etc.
    }

    // Find nearest enemy for a unit
    findNearestEnemy(unit, enemies, general = null) {
        let nearest = null;
        let minDistance = Infinity;
        
        // Check regular enemies first
        for (const enemy of enemies) {
            if (enemy.health > 0) {
                const distance = this.getDistance(unit, enemy);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearest = enemy;
                }
            }
        }
        
        // If no enemies found and general is provided, target the general
        if (!nearest && general && general.health > 0) {
            nearest = general;
        }
        
        return nearest;
    }

    // Get battle statistics
    getBattleStats() {
        return {
            isActive: this.isActive,
            battleTimer: this.battleTimer,
            projectilesCount: this.projectiles.length,
            battleDuration: this.isActive ? Date.now() - this.battleStart : 0
        };
    }

    // Reset battle system
    reset() {
        this.endBattle();
        this.projectiles = [];
        this.battleTimer = 0;
        this.battleStart = 0;
        console.log('Battle system reset');
    }
}

// Create global battle system instance
window.battleSystem = new BattleSystem();

// Test the battle system
console.log('Battle system module loaded');
console.log('Battle stats:', window.battleSystem.getBattleStats()); 