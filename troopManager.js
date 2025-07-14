// Troop Manager Module - Handles troop creation, positioning, and management
class TroopManager {
    constructor() {
        this.playerTroops = [];
        this.enemyTroops = [];
        this.playerGeneral = null;
        this.enemyGeneral = null;
        console.log('Troop manager initialized');
    }

    // Create a troop
    createTroop(isPlayer, troopType, color, scene) {
        // Import the existing createTroop function logic
        const troop = this._createTroopMesh(isPlayer, troopType, color);
        
        if (scene) {
            scene.add(troop.mesh);
        }
        
        if (isPlayer) {
            this.playerTroops.push(troop);
        } else {
            this.enemyTroops.push(troop);
        }
        
        console.log(`Created ${isPlayer ? 'player' : 'enemy'} troop:`, troop);
        return troop;
    }

    // Create a general
    createGeneral(isPlayer, generalData, scene) {
        const general = this._createGeneralMesh(isPlayer, generalData);
        
        if (scene) {
            scene.add(general.mesh);
        }
        
        if (isPlayer) {
            this.playerGeneral = general;
        } else {
            this.enemyGeneral = general;
        }
        
        console.log(`Created ${isPlayer ? 'player' : 'enemy'} general:`, general);
        return general;
    }

    // Position troops in formation
    positionTroopsInFormation(troops, formation, isPlayer) {
        if (!formation || !troops || troops.length === 0) {
            console.warn('Cannot position troops: missing formation or troops');
            return;
        }

        console.log(`Troop manager deferring to main formation positioning for ${troops.length} troops in ${formation.name} formation`);
        
        // For now, let the main.js handle all positioning to avoid conflicts
        // The troop manager will just track the troops without interfering with positioning
        return;
    }

    // Fallback positioning if main function is not available
    _fallbackPositioning(troops, formation, isPlayer) {
        const baseZ = isPlayer ? -4 : 4;
        const baseX = 0;
        const spacing = 0.8;
        
        troops.forEach((troop, index) => {
            const x = baseX + (index - troops.length / 2) * spacing;
            const z = baseZ;
            troop.mesh.position.set(x, 10, z);
            troop.position = { x: x, y: 10, z: z };
            troop.mesh.rotation.y = isPlayer ? 0 : Math.PI;
        });
    }

    // Clear all troops
    clearTroops(scene) {
        // Remove player troops
        this.playerTroops.forEach(troop => {
            if (troop.mesh && troop.mesh.parent && scene) {
                scene.remove(troop.mesh);
            }
        });
        
        // Remove enemy troops
        this.enemyTroops.forEach(troop => {
            if (troop.mesh && troop.mesh.parent && scene) {
                scene.remove(troop.mesh);
            }
        });
        
        this.playerTroops = [];
        this.enemyTroops = [];
        
        console.log('All troops cleared');
    }

    // Clear generals
    clearGenerals(scene) {
        if (this.playerGeneral && this.playerGeneral.mesh && scene) {
            scene.remove(this.playerGeneral.mesh);
        }
        if (this.enemyGeneral && this.enemyGeneral.mesh && scene) {
            scene.remove(this.enemyGeneral.mesh);
        }
        
        this.playerGeneral = null;
        this.enemyGeneral = null;
        
        console.log('Generals cleared');
    }

    // Get troop statistics
    getTroopStats() {
        return {
            playerTroops: this.playerTroops.length,
            enemyTroops: this.enemyTroops.length,
            playerGeneral: this.playerGeneral ? 'alive' : 'none',
            enemyGeneral: this.enemyGeneral ? 'alive' : 'none',
            totalTroops: this.playerTroops.length + this.enemyTroops.length
        };
    }

    // Get alive troops
    getAliveTroops(isPlayer) {
        const troops = isPlayer ? this.playerTroops : this.enemyTroops;
        return troops.filter(troop => troop.hp > 0);
    }

    // Get alive general
    getAliveGeneral(isPlayer) {
        const general = isPlayer ? this.playerGeneral : this.enemyGeneral;
        return general && general.hp > 0 ? general : null;
    }

    // Private method to create troop mesh (placeholder for existing logic)
    _createTroopMesh(isPlayer, troopType, color) {
        // Use the advanced troop mesh generator
        const prompt = `${troopType} warrior`;
        const { mesh } = generateCustomTroopMesh(prompt, isPlayer, color);
        return {
            hp: 100,
            maxHp: 100,
            atk: 10,
            range: 1,
            rate: 1,
            cooldown: 0,
            type: troopType,
            isPlayer: isPlayer,
            mesh: mesh,
            position: { x: 0, y: 0, z: 0 }
        };
    }

    // Private method to create general mesh (placeholder for existing logic)
    _createGeneralMesh(isPlayer, generalData) {
        // Use the advanced general mesh generator
        const prompt = generalData.prompt || generalData.name || 'general';
        const color = generalData.color || (isPlayer ? 0x1da1f2 : 0xff5e62);
        const { mesh } = generateCustomGeneralMesh(prompt, isPlayer, color);
        return {
            hp: generalData.hp || 100,
            maxHp: generalData.hp || 100,
            atk: 15,
            range: 2,
            rate: 2,
            cooldown: 0,
            isPlayer: isPlayer,
            mesh: mesh,
            position: { x: 0, y: 0, z: 0 },
            type: 'general'
        };
    }

    // Reset troop manager
    reset(scene) {
        this.clearTroops(scene);
        this.clearGenerals(scene);
        console.log('Troop manager reset');
    }
}

// Create global troop manager instance
window.troopManager = new TroopManager();

// Test the troop manager
console.log('Troop manager module loaded');
console.log('Troop stats:', window.troopManager.getTroopStats()); 