// ============================================================================
// GENERAL'S GAMBIT - MAIN GAME LOGIC (SIMPLIFIED)
// ============================================================================

// Import all managers
import { gameDataManager } from './gameDataManager.js';
import { generateCustomTroopMesh, determineTroopVariantFromPrompt, generateCustomGeneralMesh } from './troopGenerator.js';
import { simpleLogger } from './logger.js';
import { simpleStateManager } from './stateManager.js';
import { formationManager, positionTroopsInFormation, generateFormationFromPrompt, generateRandomEnemyFormation } from './formationManager.js';
import { sceneManager, changeScene, getCurrentScene, showRoundMessage } from './sceneManager.js';
import { effectManager } from './effectManager.js';
import { configManager } from './configManager.js';
import { terrainManager, getTerrainHeightAt } from './terrainManager.js';
import { battleLogicManager } from './battleLogicManager.js';
import { gameInitManager, setupDebugControls, getGameLogs, runSystemTests } from './gameInitManager.js';
import { gameState } from './src/core/GameState.js';

// Import UI components
import './uiComponents.js';

// ============================================================================
// GLOBAL VARIABLES
// ============================================================================

let scene, camera, renderer, controls;
let playerTroops = [];
let enemyTroops = [];
let playerGeneral = null;
let enemyGeneral = null;

// ============================================================================
// INITIALIZATION
// ============================================================================

// Initialize all managers
gameDataManager.initialize();
gameInitManager.initialize();
sceneManager.initialize();
battleLogicManager.initialize();

// Make logs accessible to assistant
window.getGameLogs = getGameLogs;

// Make formationManager globally accessible for UI components
window.formationManager = formationManager;

// ============================================================================
// GAME SETUP
// ============================================================================

function initializeUI() {
  simpleLogger.addLog('INFO', ['Initializing UI...']);
  
  // Setup debug controls
  setupDebugControls();
  
  // Setup window resize
  gameInitManager.setupWindowResize();
  
  simpleLogger.addLog('INFO', ['UI initialized']);
}

function initializeThreeJS() {
  simpleLogger.addLog('INFO', ['Initializing THREE.js...']);
  
  const canvas = document.getElementById('gameCanvas');
  const threeJS = gameInitManager.initializeThreeJS(canvas);
  
  scene = threeJS.scene;
  camera = threeJS.camera;
  renderer = threeJS.renderer;
  controls = threeJS.controls;
  
  // Initialize effect manager with scene
  effectManager.initialize(scene);
  
  // Update gameRenderer for system tests
  window.gameRenderer = { 
    canvas: canvas, 
    ctx: canvas.getContext('webgl') || canvas.getContext('2d') 
  };
  
  // Start render loop
  gameInitManager.startRenderLoop();
  
  simpleLogger.addLog('INFO', ['THREE.js initialized']);
}

// ============================================================================
// GAME FLOW
// ============================================================================

function startGame() {
  simpleLogger.addLog('INFO', ['Starting game...']);
  // Initialize UI and THREE.js
  initializeUI();
  initializeThreeJS();
  // Show troop/general selection first
  showTroopSelection();
  // Run system tests after a delay to ensure modules are initialized
  setTimeout(() => {
    runSystemTests();
  }, 1000);
  simpleLogger.addLog('INFO', ['Game started successfully']);
}

function showTroopSelection() {
  simpleLogger.addLog('INFO', ['Showing troop/general selection...']);
  // Remove the scene change to avoid purple loading screen
  // changeScene('troop-selection');
  if (window.showPromptInput) {
    window.showPromptInput('general');
  }
}

// After troop/general selection, call this to transition to formation selection
function onTroopSelectionComplete() {
  // Use sceneManager to transition to formation selection
  changeScene('formation');
}

// After formation selection, call this to start the battle
function onFormationSelectionComplete() {
  // Use sceneManager to transition to battle
  changeScene('battle');
}

function showFormationSelection() {
  simpleLogger.addLog('INFO', ['Showing formation selection...']);
  changeScene('formation');
  simpleLogger.addLog('INFO', ['Formation scene change requested']);
}

function selectFormation(formation) {
  simpleLogger.addLog('INFO', ['Formation selected:', formation.name]);
  
  // Set player formation
  simpleStateManager.setPlayerFormation(formation);
  
  // Generate enemy
  generateEnemy();
  
  // Start battle
  startBattle();
}

function generateEnemy() {
  simpleLogger.addLog('INFO', ['Generating enemy...']);
  
  // Generate random enemy formation
  const enemyFormation = generateRandomEnemyFormation();
  simpleStateManager.setEnemyFormation(enemyFormation);
  
  // Generate random enemy general
  const enemyGeneralData = gameDataManager.getRandomGeneral();
  simpleStateManager.setEnemy(enemyGeneralData);
  
  simpleLogger.addLog('INFO', ['Enemy generated:', enemyGeneralData.name]);
}

function startBattle() {
  simpleLogger.addLog('INFO', ['Starting battle...']);
  // Ensure formations are set
  if (!simpleStateManager.getPlayerFormation()) {
    simpleLogger.addLog('ERROR', ['Player formation is not set! Cannot start battle.']);
    alert('Please select a formation before starting the battle.');
    return;
  }
  if (!simpleStateManager.getEnemyFormation()) {
    simpleLogger.addLog('ERROR', ['Enemy formation is not set! Cannot start battle.']);
    alert('Enemy formation is not set.');
    return;
  }
  simpleLogger.addLog('INFO', ['Player formation:', simpleStateManager.getPlayerFormation()]);
  simpleLogger.addLog('INFO', ['Enemy formation:', simpleStateManager.getEnemyFormation()]);
  // Initialize troops
  initializeTroops();
  // Log troop array references before starting battle
  simpleLogger.addLog('DEBUG', ['playerTroops ref before battle:', playerTroops]);
  simpleLogger.addLog('DEBUG', ['enemyTroops ref before battle:', enemyTroops]);
  // Start battle logic
  simpleLogger.addLog('DEBUG', ['Calling battleLogicManager.startBattle...']);
  battleLogicManager.startBattle(playerTroops, enemyTroops, playerGeneral, enemyGeneral);
  simpleLogger.addLog('DEBUG', ['battleLogicManager.startBattle called. battleActive:', battleLogicManager.battleActive]);
  // Log troop array references after starting battle
  simpleLogger.addLog('DEBUG', ['playerTroops ref after battle:', playerTroops]);
  simpleLogger.addLog('DEBUG', ['enemyTroops ref after battle:', enemyTroops]);
  // Set battle end callback
  battleLogicManager.onBattleEnd = (playerWon) => {
    endBattle(playerWon);
  };
  // Change to battle scene
  changeScene('battle');
  simpleLogger.addLog('INFO', [`Battle started with ${playerTroops.length} player troops and ${enemyTroops.length} enemy troops`]);
  simpleLogger.addLog('INFO', ['Battle logic manager active:', battleLogicManager.battleActive]);
  // IMPORTANT: Do not reassign playerTroops or enemyTroops after this point, only modify in place.
}

// ============================================================================
// TROOP MANAGEMENT
// ============================================================================

function initializeTroops() {
  if (!scene) {
    console.error('Scene is not initialized!');
    simpleLogger.addLog('ERROR', ['Scene is not initialized!']);
    return;
  }
  simpleLogger.addLog('INFO', ['Initializing troops...']);
  
  // Clear existing troops
  clearTroops();
  
  // Create player troops
  const playerTroopCount = configManager.get('troops', 'playerTroopCount', 20);
  for (let i = 0; i < playerTroopCount; i++) {
    const troop = createTroop(true, simpleStateManager.getPlayerTroopType(), simpleStateManager.getPlayerColor());
    playerTroops.push(troop);
    scene.add(troop.mesh);
  }
  
  // Create enemy troops
  const enemyTroopCount = configManager.get('troops', 'enemyTroopCount', 20);
  for (let i = 0; i < enemyTroopCount; i++) {
    const troop = createTroop(false, simpleStateManager.getEnemyTroopType(), simpleStateManager.getEnemyColor());
    enemyTroops.push(troop);
    scene.add(troop.mesh);
  }
  
  // Create generals
  createGenerals();
  
  // Position troops in formations
  positionTroopsInFormation(playerTroops, simpleStateManager.getPlayerFormation(), true);
  positionTroopsInFormation(enemyTroops, simpleStateManager.getEnemyFormation(), false);
  
  simpleLogger.addLog('INFO', [`Initialized ${playerTroopCount} player troops and ${enemyTroopCount} enemy troops`]);
}

function clearTroops() {
  // Remove troop meshes from scene
  [...playerTroops, ...enemyTroops].forEach(troop => {
    if (troop.mesh && troop.mesh.parent) {
      troop.mesh.parent.remove(troop.mesh);
    }
  });
  
  // Clear arrays IN PLACE to preserve references
  playerTroops.length = 0;
  enemyTroops.length = 0;
  
  // Clear generals
  clearGenerals();
  
  simpleLogger.addLog('DEBUG', ['Troops cleared']);
}

function clearGenerals() {
  if (playerGeneral && playerGeneral.mesh && playerGeneral.mesh.parent) {
    playerGeneral.mesh.parent.remove(playerGeneral.mesh);
  }
  if (enemyGeneral && enemyGeneral.mesh && enemyGeneral.mesh.parent) {
    enemyGeneral.mesh.parent.remove(enemyGeneral.mesh);
  }
  
  playerGeneral = null;
  enemyGeneral = null;
  
  simpleLogger.addLog('DEBUG', ['Generals cleared']);
}

function createGenerals() {
  simpleLogger.addLog('INFO', ['Creating generals...']);
  // Create player general
  const playerGeneralData = simpleStateManager.getPlayerGeneral();
  playerGeneral = createGeneral(true, playerGeneralData);
  scene.add(playerGeneral.mesh);
  simpleLogger.addLog('DEBUG', ['Player general created:', playerGeneral]);
  // Create enemy general
  const enemyGeneralData = simpleStateManager.getEnemyGeneral();
  enemyGeneral = createGeneral(false, enemyGeneralData);
  scene.add(enemyGeneral.mesh);
  simpleLogger.addLog('DEBUG', ['Enemy general created:', enemyGeneral]);
  simpleLogger.addLog('INFO', ['Generals created']);
}

function createGeneral(isPlayer, generalData) {
  simpleLogger.addLog('DEBUG', ['createGeneral called', isPlayer, generalData]);
  // Handle null generalData
  if (!generalData) {
    simpleLogger.addLog('ERROR', ['generalData is null! Creating default general']);
    generalData = {
      name: isPlayer ? 'Player General' : 'Enemy General',
      description: 'Default general',
      troopType: 'melee',
      variant: 'default',
      hp: 150
    };
  }
  const variant = generalData.variant || 'default';
  const troopType = generalData.troopType || 'infantry';
  const z = isPlayer ? -15 : 15;
  // Use advanced mesh generator
  const prompt = generalData.name || generalData.description || 'general';
  const { mesh } = generateCustomGeneralMesh(prompt, isPlayer, isPlayer ? 0x1da1f2 : 0xff5e62);
  // Position on terrain from the start
  const terrainHeight = getTerrainHeightAt(0, z);
  mesh.position.set(0, terrainHeight + 0.5, z);
  mesh.castShadow = true;
  // Get general stats from config
  const generalHealth = configManager.get('troops', 'generalHealth', 150);
  const generalAttack = configManager.get('troops', 'generalAttack', 15);
  const generalRange = configManager.get('troops', 'generalRange', 3.0);
  const general = {
    hp: generalData.hp || generalHealth,
    maxHp: generalData.hp || generalHealth,
    atk: generalAttack,
    range: generalRange,
    rate: 3,
    cooldown: 0,
    isPlayer: isPlayer,
    mesh: mesh,
    position: { x: 0, y: terrainHeight + 0.5, z: z },
    type: 'general',
    variant: variant,
    description: generalData.description,
    troopType: troopType
  };
  simpleLogger.addLog('DEBUG', ['General object created:', general]);
  return general;
}

function createTroop(isPlayer, troopType, color) {
  const variant = determineTroopVariantFromPrompt(`${troopType} troops`, troopType);
  const z = isPlayer ? -10 : 10;
  // Use advanced mesh generator
  const troopData = generateCustomTroopMesh(`${troopType} troops`, isPlayer, color);
  const mesh = troopData.mesh;
  // Position on terrain from the start
  const terrainHeight = getTerrainHeightAt(0, z);
  mesh.position.set(0, terrainHeight + 0.5, z);
  mesh.castShadow = true;
  const troop = {
    hp: 100,
    maxHp: 100,
    atk: 10,
    range: 1.5,
    rate: 2,
    cooldown: 0,
    isPlayer: isPlayer,
    mesh: mesh,
    position: { x: 0, y: terrainHeight + 0.5, z: z },
    type: troopType,
    variant: variant
  };
  return troop;
}

// ============================================================================
// BATTLE MANAGEMENT
// ============================================================================

function endBattle(playerWon) {
  simpleLogger.addLog('INFO', [`Battle ended. Player ${playerWon ? 'won' : 'lost'}`]);
  
  // Show round message
  showRoundMessage(playerWon);
  
  // Move to next round after delay
  setTimeout(() => {
    nextRound();
  }, 2000);
}

function nextRound() {
  simpleLogger.addLog('INFO', ['Starting next round...']);
  
  // Clear current battle
  clearTroops();
  
  // Reset player and enemy choices for new round
  simpleStateManager.setPlayer(null);
  simpleStateManager.setPlayerFormation(null);
  simpleStateManager.setEnemy(null);
  simpleStateManager.setEnemyFormation(null);
  
  // Show troop selection for new round
  showTroopSelection();
}

// ============================================================================
// GAME LOOP
// ============================================================================

function gameLoop() {
  // Update battle logic
  if (battleLogicManager.battleActive) {
    simpleLogger.addLog('DEBUG', ['Battle logic manager active, updating...']);
    battleLogicManager.updateBattle(0.016); // ~60 FPS
  } else {
    // Debug: log when battle is not active
    simpleLogger.addLog('DEBUG', ['Battle logic manager not active. battleActive:', battleLogicManager.battleActive]);
  }
  
  // Update effects
  effectManager.update(0.016);
  
  // Continue loop
  requestAnimationFrame(gameLoop);
}

// ============================================================================
// STARTUP
// ============================================================================

// Start the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  simpleLogger.addLog('INFO', ['DOM loaded, starting game...']);
  // Initialize all managers only after DOM is ready
  gameDataManager.initialize();
  gameInitManager.initialize();
  initializeThreeJS();
  sceneManager.initialize();
  battleLogicManager.initialize();
  // Start game loop
  gameLoop();
});

// ============================================================================
// GLOBAL EXPORTS
// ============================================================================

// Define the generateGeneralFromPrompt function
function generateGeneralFromPrompt(prompt) {
  return generateCustomGeneralMesh(gameDataManager.generateGeneralFromPrompt(prompt));
}

// Make functions globally accessible for UI
window.selectFormation = selectFormation;
window.generateGeneralFromPrompt = generateGeneralFromPrompt;
window.generateFormationFromPrompt = generateFormationFromPrompt;
window.startBattle = startBattle;

// Make managers globally accessible for system tests
window.effectManager = effectManager;
window.sceneManager = sceneManager;
window.gameRenderer = { canvas: null, ctx: null }; // Placeholder for renderer tests
window.battleSystem = battleLogicManager; // Alias for backward compatibility

// Export functions for module imports
export { selectFormation, generateFormationFromPrompt, generateGeneralFromPrompt };

