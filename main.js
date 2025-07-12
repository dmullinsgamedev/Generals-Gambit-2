// ============================================================================
// GENERAL'S GAMBIT - MAIN GAME LOGIC
// ============================================================================

// Import game data and troop generation
import { GENERALS, FORMATIONS, ROUND_LIMIT, TROOP_TYPES, TROOP_VARIANTS } from './gameData.js';
import { generateCustomTroopMesh, determineTroopVariantFromPrompt, generateCustomGeneralMesh } from './troopGenerator.js';
import './uiComponents.js';
// import { showTroopDescriptionUI } from './uiComponents.js'; // Removed, no longer exists

// Test import of new logger (incremental refactoring step 1)
import { simpleLogger } from './logger.js';

// Test import of new state manager (incremental refactoring step 2)
import { simpleStateManager } from './stateManager.js';

// Test import of new renderer (incremental refactoring step 3)
import './renderer.js';

// Test import of new battle system (incremental refactoring step 4)
import './battleSystem.js';

// Test import of new troop manager (incremental refactoring step 5)
import './troopManager.js';

// Test import of new game loop manager (incremental refactoring step 6)
import './gameLoopManager.js';

// Test import of new input handler (incremental refactoring step 7)
import './inputHandler.js';

// Test import of new audio manager (incremental refactoring step 8)
import './audioManager.js';

// Test import of new formation manager (incremental refactoring step 9)
import { formationManager, positionTroopsInFormation, positionTroopsInFormationPreview, generateFormationFromPrompt, generateRandomEnemyFormation } from './formationManager.js';



// ============================================================================
// LOGGING SYSTEM
// ============================================================================

// Capture console logs and send them to the assistant
class GameLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 100; // Keep last 100 logs
    this.originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info
    };
    
    this.interceptConsole();
    this.setupPeriodicLogging();
  }
  
  interceptConsole() {
    const self = this;
    
    console.log = function(...args) {
      self.originalConsole.log(...args);
      self.addLog('LOG', args);
    };
    
    console.error = function(...args) {
      self.originalConsole.error(...args);
      self.addLog('ERROR', args);
    };
    
    console.warn = function(...args) {
      self.originalConsole.warn(...args);
      self.addLog('WARN', args);
    };
    
    console.info = function(...args) {
      self.originalConsole.info(...args);
      self.addLog('INFO', args);
    };
  }
  
  addLog(level, args) {
    const timestamp = new Date().toISOString();
    const message = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');
    
    this.logs.push({
      timestamp,
      level,
      message,
      gameState: this.getGameState()
    });
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }
  
  getGameState() {
    return {
      phase: window.state?.phase || 'unknown',
      player: window.state?.player?.name || 'none',
      enemy: window.state?.enemy?.name || 'none',
      playerFormation: window.state?.playerFormation?.name || 'none',
      enemyFormation: window.state?.enemyFormation?.name || 'none',
      playerTroops: window.playerTroops?.length || 0,
      enemyTroops: window.enemyTroops?.length || 0
    };
  }
  
  setupPeriodicLogging() {
    // Send logs to assistant every 30 seconds or when there are important events
    setInterval(() => {
      if (this.logs.length > 0) {
        this.sendLogsToAssistant();
      }
    }, 30000);
  }
  
  sendLogsToAssistant() {
    const logData = {
      timestamp: new Date().toISOString(),
      logs: [...this.logs],
      gameState: this.getGameState(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    // Store logs in localStorage for the assistant to access
    try {
      localStorage.setItem('gameLogs', JSON.stringify(logData));
      // Clear logs after storing
      this.logs = [];
    } catch (e) {
      // If localStorage fails, keep logs in memory
      console.warn('Could not store logs:', e);
    }
  }
  
  // Method to manually send logs (called on important events)
  sendLogsNow() {
    this.sendLogsToAssistant();
  }
}

// Initialize the logger
const gameLogger = new GameLogger();
window.gameLogger = gameLogger; // Make it globally accessible

// Function to get logs for the assistant
window.getGameLogs = function() {
  try {
    const logs = localStorage.getItem('gameLogs');
    if (logs) {
      const logData = JSON.parse(logs);
      localStorage.removeItem('gameLogs'); // Clear after reading
      return logData;
    }
    return null;
  } catch (e) {
    console.warn('Could not retrieve logs:', e);
    return null;
  }
};

// --- Global Variables ---
let projectiles = [];
let scene, camera, renderer, controls;
let playerTroops = [], enemyTroops = [];
let playerGeneral, enemyGeneral;

// --- Game State ---
let state = {
  round: 1,
  phase: 'setup', // setup, formation, battle, end
  player: {},
  enemy: {},
  playerFormation: null,
  enemyFormation: null,
  playerHP: 0,
  enemyHP: 0,
  playerTroops: [],
  enemyTroops: [],
  playerScore: 0,
  enemyScore: 0,
  battleTimer: 0,
  battleStart: 0,
  audioOn: true,
  scores: JSON.parse(localStorage.getItem('bf_scores')||'[]'),
  playerOrder: 'advance', // 'advance', 'wait', 'retreat'
  enemyOrder: 'advance',
  roundInitializing: false,
  roundEnded: false
};
window.state = state;

// Add at the top-level (after imports or globals)
const FOOT_OFFSET = 0.5;
let groundMesh = null;
let troopRaycaster = null;

// --- UI Elements ---
const promptContainer = document.getElementById('promptContainer');
const scoreboard = document.getElementById('scoreboard');
const canvas = document.getElementById('three-canvas');

// ============================================================================
// INITIALIZATION
// ============================================================================

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', function() {
  // Test the new logger (incremental refactoring step 1)
  console.log('Testing new logger - game starting');
  console.info('Incremental refactoring step 1: Logger imported successfully');
  
  // Test logger functionality
  setTimeout(() => {
    const logs = window.simpleLogger.getLogs();
    console.log('Logger test - captured logs:', logs.length, 'entries');
    if (logs.length > 0) {
      console.log('First log entry:', logs[0]);
    }
  }, 1000);
  
  // Test state manager functionality
  setTimeout(() => {
    console.log('State manager test - initial state:', window.simpleStateManager.getStateSummary());
    console.log('State manager test - current phase:', window.simpleStateManager.currentPhase);
  }, 1500);
  
  // Test renderer functionality
  setTimeout(() => {
    console.log('Renderer test - canvas:', window.gameRenderer?.canvas);
    console.log('Renderer test - context:', window.gameRenderer?.ctx);
    if (window.gameRenderer) {
      console.log('Renderer test - canvas dimensions:', window.gameRenderer.canvas?.width, 'x', window.gameRenderer.canvas?.height);
    }
  }, 2000);
  
  // Test battle system functionality
  setTimeout(() => {
    console.log('Battle system test - stats:', window.battleSystem?.getBattleStats());
    console.log('Battle system test - is active:', window.battleSystem?.isActive);
    console.log('Battle system test - projectiles:', window.battleSystem?.projectiles?.length);
  }, 2500);
  
  // Test troop manager functionality
  setTimeout(() => {
    console.log('Troop manager test - stats:', window.troopManager?.getTroopStats());
    console.log('Troop manager test - player troops:', window.troopManager?.playerTroops?.length);
    console.log('Troop manager test - enemy troops:', window.troopManager?.enemyTroops?.length);
  }, 3000);
  
  // Test game loop manager functionality
  setTimeout(() => {
    console.log('Game loop manager test - is running:', window.gameLoopManager?.isGameRunning());
    console.log('Game loop manager test - FPS:', window.gameLoopManager?.getFPS());
    console.log('Game loop manager test - update callbacks:', window.gameLoopManager?.updateCallbacks?.length);
    console.log('Game loop manager test - render callbacks:', window.gameLoopManager?.renderCallbacks?.length);
  }, 4000);
  
  // Test input handler functionality
  setTimeout(() => {
    console.log('Input handler test - is enabled:', window.inputHandler?.isEnabled);
    console.log('Input handler test - mouse position:', window.inputHandler?.getMousePosition());
    console.log('Input handler test - any key pressed:', window.inputHandler?.isAnyKeyPressed());
    console.log('Input handler test - keydown callbacks:', window.inputHandler?.callbacks?.keydown?.length);
    console.log('Input handler test - mousedown callbacks:', window.inputHandler?.callbacks?.mousedown?.length);
    
    // Add a test keydown callback to demonstrate input handling
    if (window.inputHandler) {
      window.inputHandler.onKeyDown((keyCode, event) => {
        console.log('Input handler test - Key pressed:', keyCode);
        // Test specific keys
        if (keyCode === 'Space') {
          console.log('Input handler test - Spacebar pressed!');
          // Test audio integration
          if (window.audioManager) {
            window.audioManager.playSound('sword_clash');
          }
        }
        if (keyCode === 'KeyR') {
          console.log('Input handler test - R key pressed!');
          // Test audio integration
          if (window.audioManager) {
            window.audioManager.playSound('magic_cast');
          }
        }
        if (keyCode === 'KeyV') {
          console.log('Input handler test - V key pressed!');
          // Test audio integration
          if (window.audioManager) {
            window.audioManager.playSound('victory');
          }
        }
        if (keyCode === 'KeyD') {
          console.log('Input handler test - D key pressed!');
          // Test audio integration
          if (window.audioManager) {
            window.audioManager.playSound('defeat');
          }
        }
      });
      
      window.inputHandler.onMouseDown((button, event) => {
        console.log('Input handler test - Mouse button pressed:', button);
      });
    }
  }, 5000);
  
  // Test audio manager functionality
  setTimeout(() => {
    console.log('Audio manager test - is enabled:', window.audioManager?.isEnabled);
    console.log('Audio manager test - audio context:', window.audioManager?.audioContext ? 'available' : 'not available');
    console.log('Audio manager test - sounds loaded:', window.audioManager?.sounds ? Object.keys(window.audioManager.sounds).length : 0);
    console.log('Audio manager test - master volume:', window.audioManager?.masterVolume);
    console.log('Audio manager test - sfx volume:', window.audioManager?.sfxVolume);
    console.log('Audio manager test - music volume:', window.audioManager?.musicVolume);
    
    // Test playing a sound
    if (window.audioManager && window.audioManager.isEnabled) {
      console.log('Audio manager test - Playing test sound...');
      window.audioManager.playSound('button_click');
      
      // Test volume controls
      setTimeout(() => {
        console.log('Audio manager test - Testing volume controls...');
        window.audioManager.setSFXVolume(0.5);
        window.audioManager.playSound('formation_select');
      }, 1000);
    }
  }, 6000);
  
  initializeUI();
  initializeThreeJS();
  startGame();
  setupDebugControls();
});

// Setup debug controls for assistant access
function setupDebugControls() {
  const debugPanel = document.getElementById('debugPanel');
  const getLogsBtn = document.getElementById('getLogsBtn');
  
  // Keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    // Ctrl+Shift+D to toggle debug panel
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      e.preventDefault();
      debugPanel.style.display = debugPanel.style.display === 'none' ? 'block' : 'none';
    }
    
    // Ctrl+Shift+L to get logs
    if (e.ctrlKey && e.shiftKey && e.key === 'L') {
      e.preventDefault();
      const logs = window.getGameLogs();
      if (logs) {
        console.log('=== GAME LOGS FOR ASSISTANT ===');
        console.log(JSON.stringify(logs, null, 2));
        console.log('=== END LOGS ===');
      } else {
        console.log('No logs available');
      }
    }
  });
  
  // Button click to get logs
  getLogsBtn.addEventListener('click', function() {
    const logs = window.getGameLogs();
    if (logs) {
      console.log('=== GAME LOGS FOR ASSISTANT ===');
      console.log(JSON.stringify(logs, null, 2));
      console.log('=== END LOGS ===');
    } else {
      console.log('No logs available');
    }
  });
}

// ============================================================================
// UI MANAGEMENT
// ============================================================================

function initializeUI() {
  // UI is now handled by the prompt-based system
  // No additional initialization needed
}

function showRoundMessage(playerWon) {
  const message = playerWon ? 'VICTORY!' : 'DEFEAT!';
  const overlay = document.createElement('div');
  overlay.id = 'roundMessageOverlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    font-family: 'Luckiest Guy', cursive;
    font-size: 4em;
    color: ${playerWon ? '#22ff22' : '#ff5e62'};
    text-shadow: 0 0 20px ${playerWon ? '#22ff22' : '#ff5e62'};
  `;
  overlay.textContent = message;
  document.body.appendChild(overlay);
  
  setTimeout(() => {
    if (overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
    state.round++;
    nextRound();
  }, 2000);
}

// Make showRoundMessage globally accessible
window.showRoundMessage = showRoundMessage;

// ============================================================================
// THREE.JS SETUP
// ============================================================================

function initializeThreeJS() {
  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB);
  
  // Camera setup
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 8, 15); // Higher and further back to see the wider battlefield
  
  // Renderer setup
  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  
  // Controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  
  // Lighting
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 10, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);
  
  // Create terrain with trees and rocks
  createTerrain();
  
  // Start render loop
  animate();
}

function createTerrain() {
  // Ground with terrain
  const groundGeometry = new THREE.PlaneBufferGeometry(50, 50, 20, 20);
  const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x90EE90 });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  groundMesh = ground; // Save reference for raycasting
  
  // Add terrain height variation
  if (groundGeometry.attributes && groundGeometry.attributes.position) {
    const vertices = groundGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
      vertices[i + 2] = Math.random() * 0.5; // Add height variation
    }
    groundGeometry.attributes.position.needsUpdate = true;
    groundGeometry.computeVertexNormals();
  } else {
    console.warn('Terrain height variation skipped - geometry attributes not available');
  }
  
  // Add trees
  for (let i = 0; i < 30; i++) {
    const tree = createTree();
    tree.position.set(
      (Math.random() - 0.5) * 40,
      0,
      (Math.random() - 0.5) * 40
    );
    scene.add(tree);
  }
  
  // Add rocks
  for (let i = 0; i < 20; i++) {
    const rock = createRock();
    rock.position.set(
      (Math.random() - 0.5) * 40,
      0,
      (Math.random() - 0.5) * 40
    );
    scene.add(rock);
  }
}

function createTree() {
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

function createRock() {
  const rock = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.5 + Math.random() * 0.5),
    new THREE.MeshLambertMaterial({ color: 0x696969 })
  );
  rock.castShadow = true;
  rock.receiveShadow = true;
  return rock;
}

function animate() {
  // For now, use original animation to ensure it works
  // We can integrate with game loop manager later
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

// ============================================================================
// GAME LOGIC
// ============================================================================

function startGame() {
  state.phase = 'setup';
  
  // Test formation manager
  console.log('Testing formation manager...');
  const testFormation = formationManager.getFormationByName('line');
  console.log('Test formation:', testFormation);
  console.log('All formations:', formationManager.getAllFormations().length);
  console.log('Formation manager test complete');
  

  
  window.showPromptInput('general');
  gameLogger.addLog('INFO', ['Game started']);
}



function showFormationSelection() {
  // Use the new prompt-based interface for formation selection
  window.showPromptInput('formation');
}

function selectFormation(formation) {
  state.playerFormation = formation;
  
  // Hide the prompt container if it's visible
  const promptContainer = document.getElementById('promptContainer');
  if (promptContainer) {
    promptContainer.style.display = 'none';
  }
  
  generateEnemy();
  startBattle();
}

function generateEnemy() {
  // Random enemy general
  const enemyGeneral = GENERALS[Math.floor(Math.random() * GENERALS.length)];
  state.enemy = enemyGeneral;
  
  // Random enemy formation
  const enemyFormation = generateRandomEnemyFormation();
  state.enemyFormation = enemyFormation;
  
  // Ensure player data exists (fallback if not set by UI)
  if (!state.player || !state.player.troops) {
    const playerGeneral = GENERALS[Math.floor(Math.random() * GENERALS.length)];
    state.player = playerGeneral;
    gameLogger.addLog('INFO', ['Generated fallback player data:', state.player]);
  }
}

function startBattle() {
  gameLogger.addLog('INFO', ['Starting battle...']);
  gameLogger.addLog('INFO', ['Current state:', state]);
  
  state.phase = 'battle';
  state.battleStart = Date.now();
  
  // Initialize troops
  initializeTroops();
  
  // Start battle loop
  battleLoop();
  
  gameLogger.addLog('INFO', ['Battle started successfully']);
  gameLogger.sendLogsNow(); // Send logs when battle starts
}

function initializeTroops() {
  gameLogger.addLog('INFO', ['Initializing troops...']);
  gameLogger.addLog('INFO', ['Player state:', state.player]);
  gameLogger.addLog('INFO', ['Enemy state:', state.enemy]);
  
  // Clear existing troops and generals
  clearTroops();
  clearGenerals();
  
  // Create generals
  createGenerals();
  
  // Create player troops
  const playerTroopCount = 20;
  for (let i = 0; i < playerTroopCount; i++) {
    // Always use latest troop type, color, bodyType, and subtype
    const troop = createTroop(true, state.player.troops, state.player.color);
    playerTroops.push(troop);
    scene.add(troop.mesh);
  }
  
  // Create enemy troops
  const enemyTroopCount = 20;
  for (let i = 0; i < enemyTroopCount; i++) {
    const troop = createTroop(false, state.enemy.troops, state.enemy.color);
    enemyTroops.push(troop);
    scene.add(troop.mesh);
  }
  
  // Position troops in the selected formation
  console.log('Positioning player troops with formation:', state.playerFormation);
  console.log('Positioning enemy troops with formation:', state.enemyFormation);
  positionTroopsInFormation(playerTroops, state.playerFormation, true);
  positionTroopsInFormation(enemyTroops, state.enemyFormation, false);
  
  // Sync troop manager with the created troops
  if (window.troopManager) {
    window.troopManager.playerTroops = [...playerTroops];
    window.troopManager.enemyTroops = [...enemyTroops];
    window.troopManager.playerGeneral = playerGeneral;
    window.troopManager.enemyGeneral = enemyGeneral;
    console.log('Troop manager synced with main troop arrays');
  }
  
  gameLogger.addLog('INFO', ['Troops positioned in formations']);
}

function clearTroops() {
  // Remove troop meshes from scene
  playerTroops.forEach(troop => {
    if (troop.mesh && troop.mesh.parent) {
      troop.mesh.parent.remove(troop.mesh);
    }
  });
  enemyTroops.forEach(troop => {
    if (troop.mesh && troop.mesh.parent) {
      troop.mesh.parent.remove(troop.mesh);
    }
  });
  
  // Clear arrays
  playerTroops = [];
  enemyTroops = [];
  
  // Clear projectiles
  projectiles.forEach(projectile => {
    if (projectile.mesh && projectile.mesh.parent) {
      projectile.mesh.parent.remove(projectile.mesh);
    }
  });
  projectiles = [];
}

function clearGenerals() {
  // Remove general meshes from scene
  if (playerGeneral && playerGeneral.mesh && playerGeneral.mesh.parent) {
    playerGeneral.mesh.parent.remove(playerGeneral.mesh);
  }
  if (enemyGeneral && enemyGeneral.mesh && enemyGeneral.mesh.parent) {
    enemyGeneral.mesh.parent.remove(enemyGeneral.mesh);
  }
  
  playerGeneral = null;
  enemyGeneral = null;
}

function createGenerals() {
  gameLogger.addLog('DEBUG', ['Creating generals with state:', { player: state.player, enemy: state.enemy }]);
  
  // Create player general
  if (!state.player) {
    gameLogger.addLog('ERROR', ['Player state is missing!']);
    return;
  }
  playerGeneral = createGeneral(true, state.player);
  scene.add(playerGeneral.mesh);
  
  // Create enemy general
  if (!state.enemy) {
    gameLogger.addLog('ERROR', ['Enemy state is missing!']);
    return;
  }
  enemyGeneral = createGeneral(false, state.enemy);
  scene.add(enemyGeneral.mesh);
  
  gameLogger.addLog('INFO', ['Generals created and added to scene']);
}

function createGeneral(isPlayer, generalData) {
  const color = generalData.color || (isPlayer ? 0x1da1f2 : 0xff5e62);
  
  // Validate and ensure troop type is valid
  let troopType = generalData.troops;
  if (!troopType || !TROOP_VARIANTS[troopType]) {
    gameLogger.addLog('WARN', ['Invalid troop type for general, using default:', troopType]);
    troopType = 'melee'; // Default fallback
  }
  
  // Generate a procedural description for this general to trigger variant selection
  const variant = TROOP_VARIANTS[troopType][Math.floor(Math.random() * TROOP_VARIANTS[troopType].length)];
  const generalDescription = generateGeneralDescription(variant, { ...generalData, troops: troopType });
  
  gameLogger.addLog('DEBUG', ['Creating general:', { isPlayer, generalData, troopType, variant, description: generalDescription }]);
  
  // Use advanced general generation with the procedural description
  const mesh = generateCustomGeneralMesh(generalDescription, isPlayer, color);
  
  // Place general behind their army
  let troopsArray = isPlayer ? playerTroops : enemyTroops;
  let z = isPlayer ? -8 : 8; // Fallback if no troops
  const offset = 1.2;
  if (troopsArray && troopsArray.length > 0) {
    const troopZs = troopsArray.map(t => t.mesh.position.z);
    if (isPlayer) {
      z = Math.min(...troopZs) - offset;
    } else {
      z = Math.max(...troopZs) + offset;
    }
  }
  mesh.position.set(0, 0, z);
  mesh.rotation.y = isPlayer ? Math.PI : 0;
  
  const general = {
    hp: generalData.hp || 100,
    maxHp: generalData.hp || 100,
    atk: 5, // Generals are stronger
    range: 2,
    rate: 3,
    cooldown: 0,
    isPlayer: isPlayer,
    mesh: mesh,
    position: { x: 0, y: 0, z: z },
    type: 'general',
    variant: variant,
    description: generalDescription,
    troopType: troopType
  };
  
  gameLogger.addLog('DEBUG', ['Created general:', general]);
  return general;
}

// Generate procedural general descriptions to trigger variant selection
function generateGeneralDescription(variant, generalData) {
  const descriptors = [
    'legendary', 'heroic', 'mighty', 'powerful', 'fearsome', 'renowned',
    'elite', 'royal', 'noble', 'commanding', 'distinguished', 'honored',
    'veteran', 'seasoned', 'experienced', 'battle-hardened', 'proven',
    'tactical', 'strategic', 'brilliant', 'masterful', 'skilled',
    'heavy', 'armored', 'protected', 'defensive', 'fortified',
    'aggressive', 'fierce', 'ruthless', 'merciless', 'deadly',
    'stealthy', 'shadowy', 'mysterious', 'enigmatic', 'elusive'
  ];
  
  const titles = [
    'Commander', 'General', 'Warlord', 'Champion', 'Hero', 'Legend',
    'Lord', 'Captain', 'Leader', 'Master', 'Veteran', 'Elite',
    'Royal', 'Noble', 'Knight', 'Paladin', 'Guardian', 'Protector'
  ];
  
  const randomDescriptor = descriptors[Math.floor(Math.random() * descriptors.length)];
  const randomTitle = titles[Math.floor(Math.random() * titles.length)];
  
  // Create variations in description patterns
  const patterns = [
    `${randomDescriptor} ${randomTitle} ${variant.name.toLowerCase()}`,
    `${randomTitle} ${variant.name.toLowerCase()} ${randomDescriptor}`,
    `${randomDescriptor} ${variant.name.toLowerCase()} commander`,
    `${randomTitle} ${randomDescriptor} ${generalData.troops} warrior`,
    `${randomDescriptor} ${variant.name.toLowerCase()} general`,
    `${randomTitle} ${variant.name.toLowerCase()} ${randomDescriptor}`,
    `${randomDescriptor} ${generalData.troops} ${variant.name.toLowerCase()} leader`,
    `${randomTitle} ${randomDescriptor} ${variant.name.toLowerCase()}`
  ];
  
  return patterns[Math.floor(Math.random() * patterns.length)];
}

function createTroop(isPlayer, troopType, color) {
  gameLogger.addLog('DEBUG', ['Creating troop:', { isPlayer, troopType, color }]);
  
  // Ensure troopType is valid
  if (!troopType || !TROOP_TYPES[troopType]) {
    gameLogger.addLog('WARN', ['Invalid troop type, using default:', troopType]);
    troopType = 'melee'; // Default fallback
  }
  
  // Ensure color is a valid hex number
  if (typeof color === 'string') {
    color = parseInt(color, 16);
  }
  if (!color || isNaN(color)) {
    color = isPlayer ? 0x1da1f2 : 0xff5e62; // Default blue for player, red for enemy
    gameLogger.addLog('WARN', ['Invalid color, using default:', color]);
  }
  
  gameLogger.addLog('DEBUG', ['Final troop color:', color, 'Type:', typeof color]);
  
  const troopData = TROOP_TYPES[troopType];
  
  // Use saved bodyType/subtype for player
  let troopGen;
  if (isPlayer && window.state && window.state.player && window.state.player.bodyType && window.state.player.subtype) {
    troopGen = generateCustomTroopMesh('', true, color, window.state.player.bodyType, window.state.player.subtype);
  } else {
    // For enemy or fallback, use prompt-based randomization
    const variant = TROOP_VARIANTS[troopType][Math.floor(Math.random() * TROOP_VARIANTS[troopType].length)];
    const troopDescription = generateTroopDescription(variant, troopType);
    troopGen = generateCustomTroopMesh(troopDescription, isPlayer, color);
  }
  const mesh = troopGen.mesh;
  
  // Compute and store the lowest y (foot offset)
  const footOffset = computeMeshLowestY(mesh);
  const troop = {
    hp: troopData.hp,
    maxHp: troopData.hp,
    atk: troopData.atk,
    range: troopData.range,
    rate: troopData.rate,
    cooldown: 0,
    type: troopType,
    variant: troopGen.variant || null,
    description: troopGen.description || '',
    isPlayer: isPlayer,
    mesh: mesh,
    position: { x: 0, y: 0, z: 0 },
    footOffset: footOffset
  };
  
  gameLogger.addLog('DEBUG', ['Created troop:', troop]);
  return troop;
}

// Generate procedural troop descriptions to trigger variant selection
function generateTroopDescription(variant, troopType) {
  const descriptors = [
    'elite', 'veteran', 'seasoned', 'battle-hardened', 'experienced',
    'young', 'fresh', 'new', 'recruit', 'trainee',
    'heavy', 'light', 'armored', 'unarmored', 'protected',
    'stealthy', 'aggressive', 'defensive', 'tactical', 'strategic',
    'fierce', 'calm', 'disciplined', 'wild', 'controlled',
    'royal', 'common', 'noble', 'peasant', 'mercenary'
  ];
  
  const weapons = {
    melee: ['sword', 'axe', 'spear', 'mace', 'hammer', 'dagger', 'rapier', 'broadsword', 'katana', 'trident'],
    ranged: ['bow', 'crossbow', 'rifle', 'pistol', 'longbow', 'composite_bow', 'sniper_rifle', 'machine_gun'],
    magic: ['staff', 'wand', 'orb', 'grimoire', 'nature_staff', 'fire_staff', 'ice_staff', 'lightning_staff']
  };
  
  const randomDescriptor = descriptors[Math.floor(Math.random() * descriptors.length)];
  const randomWeapon = weapons[troopType][Math.floor(Math.random() * weapons[troopType].length)];
  
  // Create variations in description patterns
  const patterns = [
    `${randomDescriptor} ${variant.name.toLowerCase()} with ${randomWeapon}`,
    `${variant.name.toLowerCase()} ${randomDescriptor} warrior`,
    `${randomDescriptor} ${troopType} ${variant.name.toLowerCase()}`,
    `${variant.name.toLowerCase()} armed with ${randomWeapon}`,
    `${randomDescriptor} ${variant.name.toLowerCase()} soldier`,
    `${variant.name.toLowerCase()} ${randomDescriptor} fighter`,
    `${randomDescriptor} ${variant.name.toLowerCase()} ${troopType} unit`,
    `${variant.name.toLowerCase()} with ${randomWeapon} and ${randomDescriptor} armor`
  ];
  
  return patterns[Math.floor(Math.random() * patterns.length)];
}

// Make formation positioning globally accessible for troop manager
window.positionTroopsInFormation = positionTroopsInFormation;

function battleLoop() {
  gameLogger.addLog('DEBUG', ['Battle loop called, phase:', state.phase]);
  
  if (state.phase !== 'battle') {
    gameLogger.addLog('INFO', ['Battle loop stopped - phase is:', state.phase]);
    return;
  }
  
  // For now, use the original battle loop to ensure it works
  // We can integrate with game loop manager later
  battleLoopFallback();
}

function battleUpdate(deltaTime) {
  // Only log battle loop every 50 frames (5 seconds) to avoid spam
  if (!battleUpdate.frameCount) battleUpdate.frameCount = 0;
  battleUpdate.frameCount++;
  
  if (battleUpdate.frameCount % 50 === 0) {
    gameLogger.addLog('DEBUG', [`Battle update running - troops alive: ${playerTroops.filter(t => t.hp > 0).length} player, ${enemyTroops.filter(t => t.hp > 0).length} enemy`]);
  }
  
  // Check if battle should still be running
  if (state.phase !== 'battle') {
    gameLogger.addLog('INFO', ['Battle update stopped - phase is:', state.phase]);
    return;
  }
  
  // Update troop cooldowns and attacks
  updateTroops();
  
  // Update projectiles
  updateProjectiles();
  
  // Check for battle end
  checkBattleEnd();
}

function battleLoopFallback() {
  // Check if battle should still be running
  if (state.phase !== 'battle') {
    gameLogger.addLog('INFO', ['Battle loop stopped - phase is:', state.phase]);
    return;
  }
  
  // Only log battle loop every 50 frames (5 seconds) to avoid spam
  if (!battleLoopFallback.frameCount) battleLoopFallback.frameCount = 0;
  battleLoopFallback.frameCount++;
  
  if (battleLoopFallback.frameCount % 50 === 0) {
    gameLogger.addLog('DEBUG', [`Battle loop running - troops alive: ${playerTroops.filter(t => t.hp > 0).length} player, ${enemyTroops.filter(t => t.hp > 0).length} enemy`]);
  }
  
  // Update troop cooldowns and attacks
  updateTroops();
  
  // Update projectiles
  updateProjectiles();
  
  // Check for battle end
  checkBattleEnd();
  
  // Continue loop only if still in battle phase
  if (state.phase === 'battle') {
    setTimeout(battleLoopFallback, 100);
  }
}

function updateTroops() {
  let attacksThisFrame = 0;
  let targetsFound = 0;
  let noTargetsFound = 0;
  
  // Filter out dead troops to avoid processing them
  const alivePlayerTroops = playerTroops.filter(troop => troop.hp > 0);
  const aliveEnemyTroops = enemyTroops.filter(troop => troop.hp > 0);
  
  gameLogger.addLog('DEBUG', [`Alive troops - Player: ${alivePlayerTroops.length}, Enemy: ${aliveEnemyTroops.length}`]);
  
  // Update troop movement (only alive troops)
  updateTroopMovement(alivePlayerTroops, aliveEnemyTroops, enemyGeneral);
  updateTroopMovement(aliveEnemyTroops, alivePlayerTroops, playerGeneral);
  
  // Update player troops
  alivePlayerTroops.forEach(troop => {
    troop.cooldown--;
    if (troop.cooldown <= 0) {
      // Find target (troops or general)
      const target = findNearestEnemy(troop, aliveEnemyTroops, enemyGeneral);
      if (target) {
        const distance = getDistance(troop, target);
        gameLogger.addLog('DEBUG', [`Player troop (${troop.type}) found enemy target at distance ${distance.toFixed(2)}, range is ${troop.range}`]);
        if (distance <= troop.range) {
          attack(troop, target);
          troop.cooldown = troop.rate;
          attacksThisFrame++;
        } else {
          targetsFound++;
        }
      } else {
        noTargetsFound++;
        gameLogger.addLog('DEBUG', [`Player troop found no targets`]);
      }
    }
  });
  
  // Update enemy troops
  aliveEnemyTroops.forEach(troop => {
    troop.cooldown--;
    if (troop.cooldown <= 0) {
      // Find target (troops or general)
      const target = findNearestEnemy(troop, alivePlayerTroops, playerGeneral);
      if (target) {
        const distance = getDistance(troop, target);
        gameLogger.addLog('DEBUG', [`Enemy troop (${troop.type}) found player target at distance ${distance.toFixed(2)}, range is ${troop.range}`]);
        if (distance <= troop.range) {
          attack(troop, target);
          troop.cooldown = troop.rate;
          attacksThisFrame++;
        } else {
          targetsFound++;
        }
      } else {
        noTargetsFound++;
        gameLogger.addLog('DEBUG', [`Enemy troop found no targets`]);
      }
    }
  });
  
  // Update general combat
  updateGeneralCombat();
  
  if (attacksThisFrame > 0) {
    gameLogger.addLog('DEBUG', [`Combat happening: ${attacksThisFrame} attacks this frame`]);
  }
  
  // Log if troops are finding targets but not in range
  if (targetsFound > 0 && attacksThisFrame === 0) {
    gameLogger.addLog('DEBUG', [`${targetsFound} troops found targets but not in range`]);
  }
  
  // Log if no targets are being found
  if (noTargetsFound > 0) {
    gameLogger.addLog('DEBUG', [`${noTargetsFound} troops found no targets at all`]);
  }
}

// Utility: Get world positions of footprint sample points for a mesh
function getFootprintSamplePoints(mesh) {
  // Sample points: center, front, back, left, right (relative to mesh origin)
  const bbox = new THREE.Box3().setFromObject(mesh);
  const center = new THREE.Vector3();
  bbox.getCenter(center);
  const size = new THREE.Vector3();
  bbox.getSize(size);
  // Points in local space
  const points = [
    new THREE.Vector3(0, bbox.min.y - mesh.position.y, 0), // center bottom
    new THREE.Vector3(size.x/2, bbox.min.y - mesh.position.y, 0), // right bottom
    new THREE.Vector3(-size.x/2, bbox.min.y - mesh.position.y, 0), // left bottom
    new THREE.Vector3(0, bbox.min.y - mesh.position.y, size.z/2), // front bottom
    new THREE.Vector3(0, bbox.min.y - mesh.position.y, -size.z/2) // back bottom
  ];
  // Convert to world space
  return points.map(p => mesh.localToWorld(p.clone()));
}

// In updateTroopMovement, use footprint sampling for robust ground placement
function updateTroopMovement(troops, enemyTroops, enemyGeneral) {
  if (!troopRaycaster) troopRaycaster = new THREE.Raycaster();
  troops.forEach(troop => {
    if (troop.hp <= 0) return;
    
    // Find nearest enemy (troop or general)
    let nearestEnemy = null;
    let nearestDistance = Infinity;
    
    // Check if there are any alive enemy troops
    const aliveEnemyTroops = enemyTroops.filter(enemy => enemy.hp > 0);
    
    // If there are alive enemy troops, target them first
    if (aliveEnemyTroops.length > 0) {
      aliveEnemyTroops.forEach(enemy => {
        const distance = getDistance(troop, enemy);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestEnemy = enemy;
        }
      });
    } else {
      // If no enemy troops alive, target the enemy general
      if (enemyGeneral && enemyGeneral.hp > 0) {
        const distance = getDistance(troop, enemyGeneral);
        nearestDistance = distance;
        nearestEnemy = enemyGeneral;
      }
    }
    
    if (nearestEnemy) {
      // Move towards nearest enemy
      const direction = {
        x: nearestEnemy.position.x - troop.position.x,
        z: nearestEnemy.position.z - troop.position.z
      };
      
      const length = Math.sqrt(direction.x * direction.x + direction.z * direction.z);
      if (length > 0) {
        direction.x /= length;
        direction.z /= length;
        
        // Move at speed 0.02 per frame
        const speed = 0.02;
        troop.position.x += direction.x * speed;
        troop.position.z += direction.z * speed;
        
        // Update mesh position
        troop.mesh.position.x = troop.position.x;
        troop.mesh.position.z = troop.position.z;
        
        // Animate movement (bob up and down)
        troop.mesh.position.y = Math.sin(Date.now() * 0.01 + troop.position.x) * 0.1;
      }
    } else {
      // No enemies to move towards - stop moving
      troop.mesh.position.y = 0;
    }
    // Footprint sampling: sample multiple points under the mesh
    if (groundMesh) {
      const samplePoints = getFootprintSamplePoints(troop.mesh);
      let maxY = -Infinity;
      for (const pt of samplePoints) {
        troopRaycaster.set(new THREE.Vector3(pt.x, 10, pt.z), new THREE.Vector3(0, -1, 0));
        const intersects = troopRaycaster.intersectObject(groundMesh, false);
        if (intersects.length > 0) {
          const localPt = troop.mesh.worldToLocal(intersects[0].point.clone());
          const yOffset = pt.y - troop.mesh.position.y;
          const candidateY = intersects[0].point.y - yOffset;
          if (candidateY > maxY) maxY = candidateY;
        }
      }
      if (maxY > -Infinity) {
        troop.mesh.position.y = maxY;
      } else {
        troop.mesh.position.y = 0;
      }
    } else {
      troop.mesh.position.y = 0;
    }

    // Make troop face its nearest target
    let nearestTarget = null;
    let nearestTargetDistance = Infinity;
    const aliveEnemies = enemyTroops.filter(e => e.hp > 0);
    if (aliveEnemies.length > 0) {
      aliveEnemies.forEach(enemy => {
        const dx = enemy.mesh.position.x - troop.mesh.position.x;
        const dz = enemy.mesh.position.z - troop.mesh.position.z;
        const dist = Math.sqrt(dx*dx + dz*dz);
        if (dist < nearestTargetDistance) {
          nearestTargetDistance = dist;
          nearestTarget = enemy;
        }
      });
    } else if (enemyGeneral && enemyGeneral.hp > 0) {
      nearestTarget = enemyGeneral;
    }
    if (nearestTarget) {
      const dx = nearestTarget.mesh.position.x - troop.mesh.position.x;
      const dz = nearestTarget.mesh.position.z - troop.mesh.position.z;
      troop.mesh.rotation.y = Math.atan2(dx, dz); // Face the target
    }
  });

  // === Per-frame facing for generals ===
  // Find the generals for both sides
  let myGeneral = null, theirGeneral = null;
  if (troops.length > 0 && troops[0].isPlayer !== undefined) {
    myGeneral = troops[0].isPlayer ? playerGeneral : enemyGeneral;
    theirGeneral = troops[0].isPlayer ? enemyGeneral : playerGeneral;
  }
  if (myGeneral && myGeneral.mesh) {
    // If the enemy general is alive, face them
    if (theirGeneral && theirGeneral.mesh && theirGeneral.hp > 0) {
      const dx = theirGeneral.mesh.position.x - myGeneral.mesh.position.x;
      const dz = theirGeneral.mesh.position.z - myGeneral.mesh.position.z;
      myGeneral.mesh.rotation.y = Math.atan2(dx, dz);
    } else {
      // Otherwise, face the center of the enemy army
      const aliveEnemies = enemyTroops.filter(e => e.hp > 0);
      if (aliveEnemies.length > 0) {
        let avgX = 0, avgZ = 0;
        aliveEnemies.forEach(e => { avgX += e.mesh.position.x; avgZ += e.mesh.position.z; });
        avgX /= aliveEnemies.length;
        avgZ /= aliveEnemies.length;
        const dx = avgX - myGeneral.mesh.position.x;
        const dz = avgZ - myGeneral.mesh.position.z;
        myGeneral.mesh.rotation.y = Math.atan2(dx, dz);
      }
    }
  }
}

function updateGeneralCombat() {
  // Get alive troops for targeting
  const alivePlayerTroops = playerTroops.filter(troop => troop.hp > 0);
  const aliveEnemyTroops = enemyTroops.filter(troop => troop.hp > 0);
  
  // Player general attacks enemy troops
  if (playerGeneral && playerGeneral.hp > 0) {
    const nearestEnemy = findNearestEnemy(playerGeneral, aliveEnemyTroops);
    if (nearestEnemy && getDistance(playerGeneral, nearestEnemy) <= playerGeneral.range) {
      if (playerGeneral.cooldown <= 0) {
        attack(playerGeneral, nearestEnemy);
        playerGeneral.cooldown = playerGeneral.rate;
      }
    }
    if (playerGeneral.cooldown > 0) playerGeneral.cooldown--;
  }
  
  // Enemy general attacks player troops
  if (enemyGeneral && enemyGeneral.hp > 0) {
    const nearestEnemy = findNearestEnemy(enemyGeneral, alivePlayerTroops);
    if (nearestEnemy && getDistance(enemyGeneral, nearestEnemy) <= enemyGeneral.range) {
      if (enemyGeneral.cooldown <= 0) {
        attack(enemyGeneral, nearestEnemy);
        enemyGeneral.cooldown = enemyGeneral.rate;
      }
    }
    if (enemyGeneral.cooldown > 0) enemyGeneral.cooldown--;
  }
}

function findNearestEnemy(troop, enemies, general = null) {
  let nearest = null;
  let minDistance = Infinity;
  
  // Check if there are any alive enemy troops
  const aliveEnemyTroops = enemies.filter(enemy => enemy.hp > 0);
  
  gameLogger.addLog('DEBUG', [`Finding enemy for ${troop.isPlayer ? 'player' : 'enemy'} troop. Alive enemies: ${aliveEnemyTroops.length}, General alive: ${general && general.hp > 0}`]);
  
  // If there are alive enemy troops, target them first
  if (aliveEnemyTroops.length > 0) {
    aliveEnemyTroops.forEach(enemy => {
      const distance = getDistance(troop, enemy);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = enemy;
      }
    });
    gameLogger.addLog('DEBUG', [`Found enemy troop at distance ${minDistance.toFixed(2)}`]);
  } else {
    // If no enemy troops alive, target the enemy general
    if (general && general.hp > 0) {
      const distance = getDistance(troop, general);
      minDistance = distance;
      nearest = general;
      gameLogger.addLog('DEBUG', [`Found enemy general at distance ${minDistance.toFixed(2)}`]);
    } else {
      gameLogger.addLog('DEBUG', [`No alive enemies or general found for ${troop.isPlayer ? 'player' : 'enemy'} troop`]);
    }
  }
  
  return nearest;
}

function getDistance(troop1, troop2) {
  const dx = troop1.position.x - troop2.position.x;
  const dz = troop1.position.z - troop2.position.z;
  return Math.sqrt(dx * dx + dz * dz);
}

function attack(attacker, target) {
  const attackerName = attacker.type === 'general' ? 'General' : `${attacker.type} troop`;
  const targetName = target.type === 'general' ? 'General' : `${target.type} troop`;
  
  gameLogger.addLog('DEBUG', [`Attack: ${attacker.isPlayer ? 'Player' : 'Enemy'} ${attackerName} (ATK: ${attacker.atk}) attacking ${target.isPlayer ? 'Player' : 'Enemy'} ${targetName} (HP: ${target.hp})`]);
  
  // Deal damage
  target.hp -= attacker.atk;
  
  gameLogger.addLog('DEBUG', [`Target HP reduced to: ${target.hp}`]);
  
  // Visual attack effect
  createAttackEffect(attacker, target);
  
  // Create projectile for ranged attacks
  if (attacker.type === 'ranged' || attacker.type === 'magic') {
    createProjectile(attacker, target);
  }
  
  // Update target mesh if dead
  if (target.hp <= 0) {
    createDeathEffect(target);
    target.mesh.visible = false;
    gameLogger.addLog('DEBUG', [`${targetName} killed!`]);
  }
}

function createAttackEffect(attacker, target) {
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
  scene.add(flash);
  
  // Animate and remove flash
  setTimeout(() => {
    scene.remove(flash);
  }, 200);
}

function createDeathEffect(target) {
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
  scene.add(explosion);
  
  // Animate explosion
  let scale = 0.5;
  const animateExplosion = () => {
    scale += 0.1;
    explosion.scale.set(scale, scale, scale);
    explosion.material.opacity -= 0.02;
    
    if (explosion.material.opacity > 0) {
      requestAnimationFrame(animateExplosion);
    } else {
      scene.remove(explosion);
    }
  };
  
  animateExplosion();
}

function createProjectile(attacker, target) {
  const projectile = {
    mesh: new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 8, 8),
      new THREE.MeshLambertMaterial({ color: attacker.type === 'magic' ? 0x8e54e9 : 0xffd700 })
    ),
    startPos: { x: attacker.position.x, y: 0.5, z: attacker.position.z },
    endPos: { x: target.position.x, y: 0.5, z: target.position.z },
    progress: 0,
    speed: 0.1
  };
  
  projectile.mesh.position.copy(projectile.startPos);
  scene.add(projectile.mesh);
  projectiles.push(projectile);
}

function updateProjectiles() {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const projectile = projectiles[i];
    projectile.progress += projectile.speed;
    
    if (projectile.progress >= 1) {
      // Remove projectile
      scene.remove(projectile.mesh);
      projectiles.splice(i, 1);
    } else {
      // Update position
      projectile.mesh.position.x = projectile.startPos.x + (projectile.endPos.x - projectile.startPos.x) * projectile.progress;
      projectile.mesh.position.z = projectile.startPos.z + (projectile.endPos.z - projectile.startPos.z) * projectile.progress;
    }
  }
}

function checkBattleEnd() {
  // Prevent multiple calls when battle is already ending
  if (state.phase !== 'battle') {
    return;
  }
  
  const playerTroopsAlive = playerTroops.some(troop => troop.hp > 0);
  const enemyTroopsAlive = enemyTroops.some(troop => troop.hp > 0);
  const playerGeneralAlive = playerGeneral && playerGeneral.hp > 0;
  const enemyGeneralAlive = enemyGeneral && enemyGeneral.hp > 0;
  
  // Battle ends only when:
  // 1. All troops AND general are dead for one side, OR
  // 2. A general is killed (regardless of troops)
  const playerAlive = playerTroopsAlive || playerGeneralAlive;
  const enemyAlive = enemyTroopsAlive || enemyGeneralAlive;
  
  // Check if a general was killed
  if (!playerGeneralAlive || !enemyGeneralAlive) {
    const playerWon = !enemyGeneralAlive;
    endBattle(playerWon);
    return;
  }
  
  // Check if all troops are dead for both sides
  if (!playerTroopsAlive && !enemyTroopsAlive) {
    // Both sides have no troops, but generals are still alive
    // This shouldn't happen in normal gameplay, but handle it
    const playerWon = false; // Draw, but count as loss
    endBattle(playerWon);
    return;
  }
  
  // Battle continues if troops are still alive or generals are still alive
  gameLogger.addLog('DEBUG', [`Battle continues - Player troops: ${playerTroopsAlive ? 'alive' : 'dead'}, Enemy troops: ${enemyTroopsAlive ? 'alive' : 'dead'}, Player general: ${playerGeneralAlive ? 'alive' : 'dead'}, Enemy general: ${enemyGeneralAlive ? 'alive' : 'dead'}`]);
}

function endBattle(playerWon) {
  // Prevent multiple calls
  if (state.phase !== 'battle') {
    gameLogger.addLog('WARN', ['endBattle called but battle already ended']);
    return;
  }
  
  state.phase = 'end';
  
  if (playerWon) {
    state.playerScore++;
    showRoundMessage(true);
  } else {
    state.enemyScore++;
    showRoundMessage(false);
  }
  
  gameLogger.addLog('INFO', [`Battle ended - Player ${playerWon ? 'won' : 'lost'}`]);
  gameLogger.sendLogsNow(); // Send logs when battle ends
}

function nextRound() {
  if (state.round > ROUND_LIMIT) {
    endGame();
  } else {
    state.phase = 'setup';
    window.showPromptInput('general');
  }
}

function endGame() {
  // Save scores
  state.scores.push({
    player: state.playerScore,
    enemy: state.enemyScore,
    date: new Date().toISOString()
  });
  localStorage.setItem('bf_scores', JSON.stringify(state.scores));
  
  // Show final results
  showFinalResults();
}

function showFinalResults() {
  // cardRow is no longer used in the new UI system
  promptContainer.style.display = 'none';
  scoreboard.style.display = 'block';
  
  const winner = state.playerScore > state.enemyScore ? 'Player' : 'Enemy';
  scoreboard.innerHTML = `
    <h2>Game Over!</h2>
    <p>Final Score: Player ${state.playerScore} - ${state.enemyScore} Enemy</p>
    <p>Winner: ${winner}</p>
    <button class="menu-btn" onclick="restartGame()">Play Again</button>
  `;
}

function restartGame() {
  gameLogger.addLog('INFO', ['Restarting game...']);
  
  // Hide the game over screen
  scoreboard.style.display = 'none';
  promptContainer.style.display = 'none';
  
  // Reset state
  state = {
    round: 1,
    phase: 'setup',
    player: {},
    enemy: {},
    playerFormation: null,
    enemyFormation: null,
    playerHP: 0,
    enemyHP: 0,
    playerTroops: [],
    enemyTroops: [],
    playerScore: 0,
    enemyScore: 0,
    battleTimer: 0,
    battleStart: 0,
    audioOn: true,
    scores: JSON.parse(localStorage.getItem('bf_scores')||'[]'),
    playerOrder: 'advance',
    enemyOrder: 'advance',
    roundInitializing: false,
    roundEnded: false
  };
  
  // Clear scene
  clearTroops();
  clearGenerals();
  
  // Reset camera position
  camera.position.set(0, 8, 15);
  camera.lookAt(0, 0, 0);
  
  // Restart game
  startGame();
}

// Make functions globally accessible
window.restartGame = restartGame;
window.selectFormation = selectFormation;
window.showFormationSelection = showFormationSelection;
window.startBattle = startBattle;
window.generateGeneralFromPrompt = generateGeneralFromPrompt;
window.generateFormationFromPrompt = generateFormationFromPrompt;
window.createFormationPreview = positionTroopsInFormationPreview;


window.generateEnemy = generateEnemy;

// ============================================================================
// TROOP PREVIEW SYSTEM
// ============================================================================

// In troop preview and initial troop generation (where player chooses their troop)
// Save chosen bodyType and subtype to state.player
window.createTroopPreview = function(container, result, prompt) {
  console.log('=== RENDER TROOP 3D PREVIEW CALLED ===');
  // Clear container
  container.innerHTML = '';

  // Create a small Three.js scene for preview
  const previewScene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 300 / 200, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ alpha: true });

  renderer.setSize(300, 200);
  container.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
  previewScene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 5);
  previewScene.add(directionalLight);

  // Create troop mesh and save bodyType/subtype
  const troopGen = generateCustomTroopMesh(prompt, true, result.color);
  const troopMesh = troopGen.mesh;
  previewScene.add(troopMesh);
  // Save to state.player if this is the initial troop selection
  if (window.state && window.state.player) {
    window.state.player.bodyType = troopGen.bodyType;
    window.state.player.subtype = troopGen.subtype;
  }

  // --- Robust centering with debug logging ---
  const box = new THREE.Box3().setFromObject(troopMesh);
  const min = box.min;
  const max = box.max;
  const center = new THREE.Vector3();
  box.getCenter(center);
  const size = new THREE.Vector3();
  box.getSize(size);
  console.log('Troop Preview Bounding Box:', { min, max, center, size });

  // Move mesh so its center is at (0,0,0)
  troopMesh.position.sub(center);

  // Remove the ground plane for a clean preview
  // Camera setup: fit to model size, but with more padding
  const fov = camera.fov * (Math.PI / 180);
  const fitDist = (Math.max(size.x, size.y, size.z) / 2) / Math.tan(fov / 2) * 1.2;
  camera.position.set(0, 0, fitDist * 1.365); // 1.365x for a bit more padding
  camera.lookAt(0, 0, 0);
  camera.near = 0.1;
  camera.far = 1000;
  camera.updateProjectionMatrix();

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    troopMesh.rotation.y += 0.01;
    renderer.render(previewScene, camera);
  }
  animate();
};

// In formation preview, always use saved bodyType/subtype
window.createFormationPreview = function(container, result, prompt) {
  // Clear container
  container.innerHTML = '';
  
  // Create a small Three.js scene for preview
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 300 / 200, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ alpha: true });
  
  renderer.setSize(300, 200);
  container.appendChild(renderer.domElement);
  
  // Lighting
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);
  
  // Create formation with identical troop meshes
  const troopCount = 20;
  const troops = [];

  // Use saved bodyType/subtype if available
  const troopPrompt = (state.player && state.player.customData && state.player.customData.prompt) || state.player.troops || 'warrior';
  const troopColor = state.player && state.player.color ? state.player.color : 0x1da1f2;
  const bodyType = state.player && state.player.bodyType;
  const subtype = state.player && state.player.subtype;
  const templateGen = generateCustomTroopMesh(troopPrompt, true, troopColor, bodyType, subtype);
  const templateMesh = templateGen.mesh;

  for (let i = 0; i < troopCount; i++) {
    const troopMesh = templateMesh.clone(true); // Deep clone
    troops.push(troopMesh);
    scene.add(troopMesh);
  }
  
  // Position troops in formation
  positionTroopsInFormationPreview(troops, result);
  
  camera.position.set(0, 3, 5);
  camera.lookAt(0, 0, 0);
  
  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();
};



// ============================================================================
// ENEMY AI FUNCTIONS
// ============================================================================

window.enemyChooseFormation = function() {
  // Generate random enemy formation
  const enemyFormation = generateRandomEnemyFormation();
  state.enemyFormation = enemyFormation;
  
  // Show formation selection for player using the new prompt interface
  window.showPromptInput('formation');
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function generateGeneralFromPrompt(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  
  // Analyze prompt for keywords
  const keywords = {
    melee: ['sword', 'shield', 'warrior', 'knight', 'tank', 'heavy', 'close', 'melee', 'fighter', 'guard'],
    ranged: ['bow', 'arrow', 'gun', 'rifle', 'sniper', 'archer', 'ranged', 'distance', 'shoot', 'fire'],
    magic: ['magic', 'spell', 'wizard', 'mage', 'sorcerer', 'lightning', 'fire', 'ice', 'energy', 'magical']
  };
  
  // Determine troop type
  let troopType = 'melee';
  let maxMatches = 0;
  
  for (const [type, words] of Object.entries(keywords)) {
    const matches = words.filter(word => lowerPrompt.includes(word)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      troopType = type;
    }
  }
  
  // Generate stats based on prompt analysis
  let hp = 100;
  let color = 0x1da1f2;
  let special = 'Battle Cry';
  let desc = 'Custom general.';
  
  // HP adjustments based on keywords
  if (lowerPrompt.includes('tank') || lowerPrompt.includes('heavy') || lowerPrompt.includes('armor')) {
    hp = 140;
  } else if (lowerPrompt.includes('fast') || lowerPrompt.includes('quick') || lowerPrompt.includes('light')) {
    hp = 80;
  } else if (lowerPrompt.includes('elite') || lowerPrompt.includes('strong') || lowerPrompt.includes('powerful')) {
    hp = 120;
  }
  
  // Color based on themes
  if (lowerPrompt.includes('fire') || lowerPrompt.includes('red') || lowerPrompt.includes('flame')) {
    color = 0xff5e62;
  } else if (lowerPrompt.includes('ice') || lowerPrompt.includes('blue') || lowerPrompt.includes('cold')) {
    color = 0x1da1f2;
  } else if (lowerPrompt.includes('nature') || lowerPrompt.includes('green') || lowerPrompt.includes('forest')) {
    color = 0x22ff22;
  } else if (lowerPrompt.includes('magic') || lowerPrompt.includes('purple') || lowerPrompt.includes('mystic')) {
    color = 0x8e54e9;
  } else if (lowerPrompt.includes('gold') || lowerPrompt.includes('yellow') || lowerPrompt.includes('royal')) {
    color = 0xffd700;
  }
  
  // Special ability based on type and keywords
  if (troopType === 'melee') {
    if (lowerPrompt.includes('charge') || lowerPrompt.includes('rush')) {
      special = 'Charge Attack';
    } else if (lowerPrompt.includes('shield') || lowerPrompt.includes('defend')) {
      special = 'Shield Wall';
    } else {
      special = 'Battle Cry';
    }
  } else if (troopType === 'ranged') {
    if (lowerPrompt.includes('volley') || lowerPrompt.includes('multi')) {
      special = 'Volley Shot';
    } else if (lowerPrompt.includes('snipe') || lowerPrompt.includes('precision')) {
      special = 'Precision Shot';
    } else {
      special = 'Quick Draw';
    }
  } else if (troopType === 'magic') {
    if (lowerPrompt.includes('fire') || lowerPrompt.includes('flame')) {
      special = 'Fireball';
    } else if (lowerPrompt.includes('ice') || lowerPrompt.includes('frost')) {
      special = 'Ice Storm';
    } else if (lowerPrompt.includes('lightning') || lowerPrompt.includes('thunder')) {
      special = 'Lightning Bolt';
    } else {
      special = 'Arcane Blast';
    }
  }
  
  // Generate name from prompt
  let name = 'Custom General';
  const words = prompt.split(' ').filter(word => word.length > 2);
  if (words.length > 0) {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    name = randomWord.charAt(0).toUpperCase() + randomWord.slice(1).toLowerCase();
  }
  
  // Generate description
  if (lowerPrompt.includes('stealth') || lowerPrompt.includes('ninja')) {
    desc = 'Stealthy and agile fighter.';
  } else if (lowerPrompt.includes('berserker') || lowerPrompt.includes('rage')) {
    desc = 'Fierce and powerful warrior.';
  } else if (lowerPrompt.includes('tactical') || lowerPrompt.includes('strategic')) {
    desc = 'Tactical and disciplined commander.';
  } else {
    desc = `Custom ${troopType} general.`;
  }
  
  return {
    name,
    hp,
    troops: troopType,
    color,
    special,
    desc,
    prompt: lowerPrompt
  };
}



export { generateGeneralFromPrompt, generateFormationFromPrompt };

// ============================================================================
// WINDOW RESIZE HANDLING
// ============================================================================

window.addEventListener('resize', function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Utility: Get terrain height at (x, z)
function getTerrainHeightAt(x, z) {
  // Assume ground is a PlaneBufferGeometry centered at (0,0), rotated -Math.PI/2
  // and is the first mesh added to the scene
  const ground = scene.children.find(obj => obj.isMesh && obj.geometry && obj.geometry.type === 'PlaneBufferGeometry');
  if (!ground) return 0;
  const geometry = ground.geometry;
  const pos = geometry.attributes.position;
  const segments = Math.sqrt(pos.count) - 1;
  const size = 50;
  const half = size / 2;
  // Convert world (x, z) to grid (u, v)
  const u = ((x + half) / size) * segments;
  const v = ((z + half) / size) * segments;
  const i = Math.floor(u);
  const j = Math.floor(v);
  if (i < 0 || j < 0 || i >= segments || j >= segments) return 0;
  // Get the four vertices of the grid cell
  const idx = (j * (segments + 1) + i) * 3;
  const idxRight = idx + 3;
  const idxDown = idx + (segments + 1) * 3;
  const idxDiag = idxDown + 3;
  // Get positions
  const v00 = [pos.array[idx], pos.array[idx + 1], pos.array[idx + 2]];
  const v10 = [pos.array[idxRight], pos.array[idxRight + 1], pos.array[idxRight + 2]];
  const v01 = [pos.array[idxDown], pos.array[idxDown + 1], pos.array[idxDown + 2]];
  const v11 = [pos.array[idxDiag], pos.array[idxDiag + 1], pos.array[idxDiag + 2]];
  // Bilinear interpolation
  const fu = u - i;
  const fv = v - j;
  // Interpolate top and bottom edges
  function lerp(a, b, t) { return a + (b - a) * t; }
  const h0 = lerp(v00[2], v10[2], fu);
  const h1 = lerp(v01[2], v11[2], fu);
  const h = lerp(h0, h1, fv);
  return h;
}

// Utility: Compute the lowest y-value of a mesh or group (feet position) using bounding box
function computeMeshLowestY(mesh) {
  const box = new THREE.Box3().setFromObject(mesh);
  return box.min.y;
}
