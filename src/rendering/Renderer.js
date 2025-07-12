// ============================================================================
// THREE.JS RENDERER MANAGEMENT
// ============================================================================

export class GameRenderer {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.projectiles = [];
    this.groundMesh = null;
    this.troopRaycaster = null;
    this.FOOT_OFFSET = 0.5;
  }
  
  initialize() {
    this.setupScene();
    this.setupCamera();
    this.setupRenderer();
    this.setupControls();
    this.setupLighting();
    this.createTerrain();
    this.setupRaycaster();
    
    // Start animation loop
    this.animate();
  }
  
  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
    this.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);
  }
  
  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    this.camera.position.set(0, 15, 20);
    this.camera.lookAt(0, 0, 0);
  }
  
  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ 
      canvas: document.getElementById('three-canvas'),
      antialias: true 
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }
  
  setupControls() {
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2.2;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 50;
  }
  
  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);
    
    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    this.scene.add(directionalLight);
  }
  
  createTerrain() {
    // Create terrain using THREE.Terrain
    const terrain = THREE.Terrain({
      easing: THREE.Terrain.Linear,
      frequency: 2.5,
      heightmap: THREE.Terrain.DiamondSquare,
      material: new THREE.MeshLambertMaterial({ 
        color: 0x3d5e3d,
        transparent: true,
        opacity: 0.8
      }),
      maxHeight: 3,
      minHeight: -3,
      steps: 1,
      stretch: true,
      turbulent: true,
      width: 100,
      height: 100
    });
    
    terrain.receiveShadow = true;
    terrain.position.set(-50, -3, -50);
    this.scene.add(terrain);
    this.groundMesh = terrain;
    
    // Add some decorative elements
    this.addTerrainDecorations();
  }
  
  addTerrainDecorations() {
    // Add trees
    for (let i = 0; i < 20; i++) {
      const tree = this.createTree();
      tree.position.set(
        (Math.random() - 0.5) * 80,
        0,
        (Math.random() - 0.5) * 80
      );
      this.scene.add(tree);
    }
    
    // Add rocks
    for (let i = 0; i < 15; i++) {
      const rock = this.createRock();
      rock.position.set(
        (Math.random() - 0.5) * 80,
        0,
        (Math.random() - 0.5) * 80
      );
      this.scene.add(rock);
    }
  }
  
  createTree() {
    const group = new THREE.Group();
    
    // Trunk
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.4, 2, 8),
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
  
  setupRaycaster() {
    this.troopRaycaster = new THREE.Raycaster();
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());
    
    this.controls.update();
    this.updateProjectiles();
    this.renderer.render(this.scene, this.camera);
  }
  
  updateProjectiles() {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      projectile.position.add(projectile.velocity);
      
      // Check if projectile hit target or went too far
      const distance = projectile.position.distanceTo(projectile.target.position);
      if (distance < 1 || projectile.position.length() > 100) {
        this.scene.remove(projectile);
        this.projectiles.splice(i, 1);
      }
    }
  }
  
  // Terrain height calculation
  getTerrainHeightAt(x, z) {
    if (!this.groundMesh) return 0;
    
    // Convert world coordinates to terrain coordinates
    const terrainX = Math.floor((x + 50) / 100 * this.groundMesh.geometry.parameters.width);
    const terrainZ = Math.floor((z + 50) / 100 * this.groundMesh.geometry.parameters.height);
    
    if (terrainX < 0 || terrainX >= this.groundMesh.geometry.parameters.width ||
        terrainZ < 0 || terrainZ >= this.groundMesh.geometry.parameters.height) {
      return 0;
    }
    
    const index = terrainZ * this.groundMesh.geometry.parameters.width + terrainX;
    const height = this.groundMesh.geometry.attributes.position.array[index * 3 + 1];
    return height - 3; // Adjust for terrain position offset
  }
  
  // Add projectile to scene
  addProjectile(projectile) {
    this.projectiles.push(projectile);
    this.scene.add(projectile);
  }
  
  // Add object to scene
  addToScene(object) {
    this.scene.add(object);
  }
  
  // Remove object from scene
  removeFromScene(object) {
    this.scene.remove(object);
  }
  
  // Handle window resize
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

// Create and export singleton instance
export const gameRenderer = new GameRenderer(); 