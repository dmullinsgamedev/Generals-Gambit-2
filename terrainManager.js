/**
 * Terrain Manager
 * Handles terrain generation, trees, rocks, and terrain-related utilities
 */

import { simpleLogger } from './logger.js';
import { configManager } from './configManager.js';

class TerrainManager {
  constructor() {
    this.isInitialized = false;
    this.groundMesh = null;
    this.terrainObjects = [];
  }

  initialize() {
    simpleLogger.addLog('INFO', ['Initializing Terrain Manager']);
    this.isInitialized = true;
    simpleLogger.addLog('INFO', ['Terrain Manager initialized']);
  }

  createTerrain(scene) {
    simpleLogger.addLog('INFO', ['Creating terrain...']);
    
    // Restore original terrain size and segments
    const terrainSize = configManager.get('terrain', 'terrainSize', 50);
    const terrainSegments = configManager.get('terrain', 'terrainSegments', 20);
    const groundColor = configManager.get('terrain', 'groundColor', 0x90EE90);
    
    // Create ground geometry
    const groundGeometry = new THREE.PlaneBufferGeometry(terrainSize, terrainSize, terrainSegments, terrainSegments);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: groundColor });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.position.set(0, 0, 0);
    scene.add(ground);
    this.groundMesh = ground;
    
    // Restore original height variation
    this.addTerrainHeightVariation(groundGeometry);
    
    // Add terrain features
    this.addTerrainFeatures(scene, terrainSize);
    
    simpleLogger.addLog('INFO', ['Terrain created successfully']);
    return ground;
  }

  addTerrainHeightVariation(groundGeometry) {
    if (groundGeometry.attributes && groundGeometry.attributes.position) {
      const vertices = groundGeometry.attributes.position.array;
      const heightVariation = configManager.get('terrain', 'terrainHeightVariation', 0.5);
      for (let i = 0; i < vertices.length; i += 3) {
        vertices[i + 2] = Math.random() * heightVariation;
      }
      groundGeometry.attributes.position.needsUpdate = true;
      groundGeometry.computeVertexNormals();
      simpleLogger.addLog('DEBUG', ['Terrain height variation added']);
    } else {
      simpleLogger.addLog('WARN', ['Terrain height variation skipped - geometry attributes not available']);
    }
  }

  lerp(a, b, t) {
    return a + (b - a) * t;
  }

  addTerrainFeatures(scene, terrainSize) {
    // Add trees
    const treeCount = configManager.get('terrain', 'treeCount', 30);
    const enableTrees = configManager.get('terrain', 'enableTrees', true);
    
    if (enableTrees) {
      for (let i = 0; i < treeCount; i++) {
        const tree = this.createTree();
        tree.position.set(
          (Math.random() - 0.5) * (terrainSize - 10),
          0,
          (Math.random() - 0.5) * (terrainSize - 10)
        );
        scene.add(tree);
        this.terrainObjects.push(tree);
      }
    }
    
    // Add rocks
    const rockCount = configManager.get('terrain', 'rockCount', 20);
    const enableRocks = configManager.get('terrain', 'enableRocks', true);
    
    if (enableRocks) {
      for (let i = 0; i < rockCount; i++) {
        const rock = this.createRock();
        rock.position.set(
          (Math.random() - 0.5) * (terrainSize - 10),
          0,
          (Math.random() - 0.5) * (terrainSize - 10)
        );
        scene.add(rock);
        this.terrainObjects.push(rock);
      }
    }
  }

  createTree() {
    const group = new THREE.Group();
    // Trunk
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.3, 2, 8),
      new THREE.MeshLambertMaterial({ color: 0x8B4513 })
    );
    trunk.position.y = 1;
    trunk.castShadow = true;
    group.add(trunk);
    // Leaves
    const leaves = new THREE.Mesh(
      new THREE.SphereGeometry(1.5, 8, 8),
      new THREE.MeshLambertMaterial({ color: 0x228B22 })
    );
    leaves.position.y = 2.5;
    leaves.castShadow = true;
    group.add(leaves);
    return group;
  }

  createRock() {
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.5 + Math.random() * 0.5),
      new THREE.MeshLambertMaterial({ color: 0x696969 })
    );
    rock.castShadow = true;
    rock.receiveShadow = true;
    return rock;
  }

  clearTerrain(scene) {
    // Remove terrain objects from scene
    this.terrainObjects.forEach(obj => {
      if (obj.parent) {
        obj.parent.remove(obj);
      }
    });
    
    // Remove ground mesh
    if (this.groundMesh && this.groundMesh.parent) {
      this.groundMesh.parent.remove(this.groundMesh);
    }
    
    this.terrainObjects = [];
    this.groundMesh = null;
    
    simpleLogger.addLog('INFO', ['Terrain cleared']);
  }

  getTerrainStats() {
    return {
      isInitialized: this.isInitialized,
      hasGroundMesh: !!this.groundMesh,
      terrainObjectCount: this.terrainObjects.length,
      groundMeshSize: this.groundMesh ? this.groundMesh.geometry.parameters : null
    };
  }

  getTerrainHeightAt(x, z) {
    // Flat terrain (rollback state)
    return 0;
  }

  destroy() {
    this.clearTerrain();
    this.isInitialized = false;
    simpleLogger.addLog('INFO', ['Terrain Manager destroyed']);
  }
}

// Create singleton instance
const terrainManager = new TerrainManager();

// Export functions for backward compatibility
export function createTerrain(scene) {
  return terrainManager.createTerrain(scene);
}

export function getTerrainHeightAt(x, z) {
  return terrainManager.getTerrainHeightAt(x, z);
}

export function clearTerrain(scene) {
  return terrainManager.clearTerrain(scene);
}

// Export the manager instance for advanced usage
export { terrainManager }; 