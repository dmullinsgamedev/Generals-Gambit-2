/**
 * Game Initialization Manager
 * Handles game initialization, THREE.js setup, and system initialization
 */

import { simpleLogger } from './logger.js';
import { configManager } from './configManager.js';
import { terrainManager } from './terrainManager.js';
import { battleLogicManager } from './battleLogicManager.js';

class GameInitManager {
  constructor() {
    this.isInitialized = false;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
  }

  initialize() {
    simpleLogger.addLog('INFO', ['Initializing Game Initialization Manager']);
    
    // Initialize all managers
    configManager.initialize();
    terrainManager.initialize();
    battleLogicManager.initialize();
    
    this.isInitialized = true;
    simpleLogger.addLog('INFO', ['Game Initialization Manager initialized']);
  }

  initializeThreeJS(canvas) {
    simpleLogger.addLog('INFO', ['Initializing THREE.js...']);
    
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB);
    
    // Camera setup
    const cameraFOV = configManager.get('graphics', 'cameraFOV', 75);
    const cameraNear = configManager.get('graphics', 'cameraNear', 0.1);
    const cameraFar = configManager.get('graphics', 'cameraFar', 1000);
    this.camera = new THREE.PerspectiveCamera(cameraFOV, window.innerWidth / window.innerHeight, cameraNear, cameraFar);
    this.camera.position.set(0, 8, 15); // Higher and further back to see the wider battlefield
    
    // Renderer setup
    const enableAntialiasing = configManager.get('graphics', 'enableAntialiasing', true);
    const enableShadows = configManager.get('graphics', 'enableShadows', true);
    this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: enableAntialiasing });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = enableShadows;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Controls
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    
    // Lighting
    this.setupLighting();
    
    // Create terrain
    terrainManager.createTerrain(this.scene);
    
    simpleLogger.addLog('INFO', ['THREE.js initialized successfully']);
    
    return {
      scene: this.scene,
      camera: this.camera,
      renderer: this.renderer,
      controls: this.controls
    };
  }

  setupLighting() {
    const enableDynamicLighting = configManager.get('graphics', 'enableDynamicLighting', true);
    const enableShadows = configManager.get('graphics', 'enableShadows', true);
    
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);
    
    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = enableShadows;
    if (enableShadows) {
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
    }
    this.scene.add(directionalLight);
    
    simpleLogger.addLog('DEBUG', ['Lighting setup complete']);
  }

  setupDebugControls() {
    simpleLogger.addLog('INFO', ['Setting up debug controls...']);
    
    const debugPanel = document.getElementById('debugPanel');
    const getLogsBtn = document.getElementById('getLogsBtn');
    
    if (!debugPanel || !getLogsBtn) {
      simpleLogger.addLog('WARN', ['Debug panel elements not found']);
      return;
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl+Shift+D to toggle debug panel
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        debugPanel.style.display = debugPanel.style.display === 'none' ? 'block' : 'none';
      }
      
      // Ctrl+Shift+L to get logs
      if (e.ctrlKey && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        this.getGameLogs();
      }
    });
    
    // Button click to get logs
    getLogsBtn.addEventListener('click', () => {
      this.getGameLogs();
    });
    
    simpleLogger.addLog('INFO', ['Debug controls setup complete']);
  }

  getGameLogs() {
    try {
      const logs = localStorage.getItem('gameLogs');
      if (logs) {
        const logData = JSON.parse(logs);
        localStorage.removeItem('gameLogs'); // Clear after reading
        console.log('=== GAME LOGS FOR ASSISTANT ===');
        console.log(JSON.stringify(logData, null, 2));
        console.log('=== END LOGS ===');
        return logData;
      } else {
        console.log('No logs available');
        return null;
      }
    } catch (e) {
      console.warn('Could not retrieve logs:', e);
      return null;
    }
  }

  setupWindowResize() {
    window.addEventListener('resize', () => {
      if (this.camera && this.renderer) {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
      }
    });
    
    simpleLogger.addLog('DEBUG', ['Window resize handler setup complete']);
  }

  startRenderLoop() {
    if (!this.scene || !this.camera || !this.renderer) {
      simpleLogger.addLog('ERROR', ['Cannot start render loop - THREE.js not initialized']);
      return;
    }
    
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (this.controls) {
        this.controls.update();
      }
      
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    };
    
    animate();
    simpleLogger.addLog('INFO', ['Render loop started']);
  }

  runSystemTests() {
    simpleLogger.addLog('INFO', ['Running system tests...']);
    
    // Test all managers
    setTimeout(() => {
      this.testLogger();
    }, 1000);
    
    setTimeout(() => {
      this.testStateManager();
    }, 1500);
    
    setTimeout(() => {
      this.testRenderer();
    }, 2000);
    
    setTimeout(() => {
      this.testBattleSystem();
    }, 2500);
    
    setTimeout(() => {
      this.testTroopManager();
    }, 3000);
    
    setTimeout(() => {
      this.testGameLoopManager();
    }, 4000);
    
    setTimeout(() => {
      this.testInputHandler();
    }, 5000);
    
    setTimeout(() => {
      this.testAudioManager();
    }, 6000);
    
    setTimeout(() => {
      this.testSceneManager();
    }, 7000);
    
    setTimeout(() => {
      this.testEffectManager();
    }, 7500);
    
    setTimeout(() => {
      this.testConfigManager();
    }, 8000);
  }

  testLogger() {
    console.log('Testing new logger - game starting');
    console.info('Incremental refactoring step 1: Logger imported successfully');
    
    setTimeout(() => {
      const logs = window.simpleLogger?.getLogs();
      console.log('Logger test - captured logs:', logs?.length || 0, 'entries');
      if (logs && logs.length > 0) {
        console.log('First log entry:', logs[0]);
      }
    }, 1000);
  }

  testStateManager() {
    setTimeout(() => {
      console.log('State manager test - initial state:', window.simpleStateManager?.getStateSummary());
      console.log('State manager test - current phase:', window.simpleStateManager?.currentPhase);
    }, 1500);
  }

  testRenderer() {
    setTimeout(() => {
      console.log('Renderer test - canvas:', window.gameRenderer?.canvas);
      console.log('Renderer test - context:', window.gameRenderer?.ctx);
      if (window.gameRenderer) {
        console.log('Renderer test - canvas dimensions:', window.gameRenderer.canvas?.width, 'x', window.gameRenderer.canvas?.height);
      }
    }, 2000);
  }

  testBattleSystem() {
    setTimeout(() => {
      console.log('Battle system test - stats:', window.battleSystem?.getBattleStats());
      console.log('Battle system test - is active:', window.battleSystem?.isActive);
      console.log('Battle system test - projectiles:', window.battleSystem?.projectiles?.length);
    }, 2500);
  }

  testTroopManager() {
    setTimeout(() => {
      console.log('Troop manager test - stats:', window.troopManager?.getTroopStats());
      console.log('Troop manager test - player troops:', window.troopManager?.playerTroops?.length);
      console.log('Troop manager test - enemy troops:', window.troopManager?.enemyTroops?.length);
    }, 3000);
  }

  testGameLoopManager() {
    setTimeout(() => {
      console.log('Game loop manager test - is running:', window.gameLoopManager?.isGameRunning());
      console.log('Game loop manager test - FPS:', window.gameLoopManager?.getFPS());
      console.log('Game loop manager test - update callbacks:', window.gameLoopManager?.updateCallbacks?.length);
      console.log('Game loop manager test - render callbacks:', window.gameLoopManager?.renderCallbacks?.length);
    }, 4000);
  }

  testInputHandler() {
    setTimeout(() => {
      console.log('Input handler test - is enabled:', window.inputHandler?.isEnabled);
      console.log('Input handler test - mouse position:', window.inputHandler?.getMousePosition());
      console.log('Input handler test - any key pressed:', window.inputHandler?.isAnyKeyPressed());
      console.log('Input handler test - keydown callbacks:', window.inputHandler?.callbacks?.keydown?.length);
      console.log('Input handler test - mousedown callbacks:', window.inputHandler?.callbacks?.mousedown?.length);
    }, 5000);
  }

  testAudioManager() {
    setTimeout(() => {
      console.log('Audio manager test - is enabled:', window.audioManager?.isEnabled);
      console.log('Audio manager test - audio context:', window.audioManager?.audioContext ? 'available' : 'not available');
      console.log('Audio manager test - sounds loaded:', window.audioManager?.sounds ? Object.keys(window.audioManager.sounds).length : 0);
      console.log('Audio manager test - master volume:', window.audioManager?.masterVolume);
      console.log('Audio manager test - sfx volume:', window.audioManager?.sfxVolume);
      console.log('Audio manager test - music volume:', window.audioManager?.musicVolume);
    }, 6000);
  }

  testSceneManager() {
    setTimeout(() => {
      console.log('Scene manager test - current scene:', window.sceneManager?.getCurrentScene());
      console.log('Scene manager test - available scenes:', window.sceneManager?.getAllScenes());
      console.log('Scene manager test - scene stats:', window.sceneManager?.getSceneStats());
    }, 7000);
  }

  testEffectManager() {
    setTimeout(() => {
      console.log('Effect manager test - is initialized:', window.effectManager?.isInitialized);
      console.log('Effect manager test - effect stats:', window.effectManager?.getEffectStats());
      console.log('Effect manager test - effect types:', Object.keys(window.effectManager?.effectTypes || {}));
    }, 7500);
  }

  testConfigManager() {
    setTimeout(() => {
      console.log('Configuration manager test - is initialized:', configManager.isInitialized);
      console.log('Configuration manager test - config stats:', configManager.getConfigStats());
      console.log('Configuration manager test - validation:', configManager.validateConfig());
      console.log('Configuration manager test - troop count:', configManager.get('troops', 'playerTroopCount'));
      console.log('Configuration manager test - terrain size:', configManager.get('terrain', 'terrainSize'));
      console.log('Configuration manager test - camera FOV:', configManager.get('graphics', 'cameraFOV'));
    }, 8000);
  }

  getInitStats() {
    return {
      isInitialized: this.isInitialized,
      hasScene: !!this.scene,
      hasCamera: !!this.camera,
      hasRenderer: !!this.renderer,
      hasControls: !!this.controls,
      managers: {
        configManager: configManager.isInitialized,
        terrainManager: terrainManager.isInitialized,
        battleLogicManager: battleLogicManager.isInitialized
      }
    };
  }

  destroy() {
    // Clean up THREE.js resources
    if (this.scene) {
      this.scene.clear();
      this.scene = null;
    }
    
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }
    
    this.camera = null;
    this.controls = null;
    this.isInitialized = false;
    
    simpleLogger.addLog('INFO', ['Game Initialization Manager destroyed']);
  }
}

// Create singleton instance
const gameInitManager = new GameInitManager();

// Export functions for backward compatibility
export function initializeThreeJS(canvas) {
  return gameInitManager.initializeThreeJS(canvas);
}

export function setupDebugControls() {
  return gameInitManager.setupDebugControls();
}

export function getGameLogs() {
  return gameInitManager.getGameLogs();
}

export function runSystemTests() {
  return gameInitManager.runSystemTests();
}

// Export the manager instance for advanced usage
export { gameInitManager }; 