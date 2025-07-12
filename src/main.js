// ============================================================================
// GENERAL'S GAMBIT - MAIN GAME LOGIC
// ============================================================================

// Import core modules
import { gameState } from './core/GameState.js';
import { gameLogger } from './core/Logger.js';
import { gameRenderer } from './rendering/Renderer.js';
import { battleSystem } from './game/BattleSystem.js';
import { troopManager } from './game/TroopManager.js';

// Import data and generation
import { GENERALS, FORMATIONS, TROOP_TYPES, TROOP_VARIANTS } from './data/GameData.js';
import { generateCustomTroopMesh, determineTroopVariantFromPrompt, generateCustomGeneralMesh } from './generation/TroopGenerator.js';

// Import UI components
import './ui/uiComponents.js';

// ============================================================================
// GAME INITIALIZATION
// ============================================================================

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', function() {
  initializeGame();
  setupDebugControls();
  setupEventListeners();
});

function initializeGame() {
  // Initialize renderer
  gameRenderer.initialize();
  
  // Setup window resize handler
  window.addEventListener('resize', () => gameRenderer.onWindowResize());
  
  // Start the game
  startGame();
}

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
      const logs = gameLogger.getGameLogs();
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
    const logs = gameLogger.getGameLogs();
    if (logs) {
      console.log('=== GAME LOGS FOR ASSISTANT ===');
      console.log(JSON.stringify(logs, null, 2));
      console.log('=== END LOGS ===');
    } else {
      console.log('No logs available');
    }
  });
}

function setupEventListeners() {
  // Battle end event
  window.onBattleEnd = function(playerWon) {
    showRoundMessage(playerWon);
    setTimeout(() => {
      if (gameState.currentRound < 1) { // ROUND_LIMIT
        nextRound();
      } else {
        endGame();
      }
    }, 3000);
  };
}

// ============================================================================
// GAME FLOW
// ============================================================================

function startGame() {
  gameState.setPhase('setup');
  showFormationSelection();
}

function showFormationSelection() {
  // Show prompt for troop selection
  if (window.showPromptInput) {
    window.showPromptInput('general');
  }
}

function selectFormation(formation) {
  gameState.setPlayerFormation(formation);
  gameState.setPhase('battle');
  startBattle();
}

function generateEnemy() {
  const enemyGeneral = GENERALS[Math.floor(Math.random() * GENERALS.length)];
  gameState.setEnemy(enemyGeneral);
  return enemyGeneral;
}

function startBattle() {
  // Generate enemy if not already generated
  if (!gameState.enemy) {
    generateEnemy();
  }
  
  // Initialize troops and generals
  troopManager.createGenerals();
  troopManager.initializeTroops();
  
  // Position troops in formation
  if (gameState.playerFormation) {
    troopManager.positionTroopsInFormation(gameState.playerTroops, gameState.playerFormation, true);
    troopManager.positionTroopsInFormation(gameState.enemyTroops, gameState.enemyFormation, false);
  }
  
  // Start battle
  battleSystem.startBattle();
}

function nextRound() {
  gameState.nextRound();
  gameState.resetRound();
  
  // Clear previous battle
  troopManager.clearAll();
  battleSystem.stopBattle();
  
  // Start new round
  showFormationSelection();
}

function endGame() {
  gameState.setPhase('end');
  showFinalResults();
}

// ============================================================================
// UI HELPERS
// ============================================================================

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
  }, 2000);
}

function showFinalResults() {
  const promptContainer = document.getElementById('promptContainer');
  promptContainer.style.display = 'block';
  promptContainer.innerHTML = `
    <div class="prompt-content">
      <div class="prompt-header">
        <h2>Game Over</h2>
      </div>
      <div class="prompt-body">
        <h3>Final Score</h3>
        <p>Player: ${gameState.playerScore}</p>
        <p>Enemy: ${gameState.enemyScore}</p>
        <div class="prompt-buttons">
          <button class="menu-btn" onclick="restartGame()">Play Again</button>
        </div>
      </div>
    </div>
  `;
}

function restartGame() {
  // Reset game state
  gameState.state.round = 1;
  gameState.state.playerScore = 0;
  gameState.state.enemyScore = 0;
  gameState.state.player = {};
  gameState.state.enemy = {};
  gameState.state.playerFormation = null;
  gameState.state.enemyFormation = null;
  
  // Clear troops and restart
  troopManager.clearAll();
  battleSystem.stopBattle();
  
  // Hide UI and restart
  const promptContainer = document.getElementById('promptContainer');
  promptContainer.style.display = 'none';
  
  startGame();
}

// ============================================================================
// PROMPT-BASED GENERATION
// ============================================================================

// Generate general from prompt
window.generateGeneralFromPrompt = function(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  
  // Determine troop type from prompt
  let troopType = 'melee';
  if (lowerPrompt.match(/(bow|archer|crossbow|gun|ranged|sniper|shooter)/)) troopType = 'ranged';
  else if (lowerPrompt.match(/(magic|mage|wizard|sorcerer|spell|shaman|witch|warlock)/)) troopType = 'magic';
  
  // Get base stats
  const baseStats = TROOP_TYPES[troopType];
  
  // Generate name from prompt
  const words = prompt.split(' ');
  const name = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  
  // Create general object
  const general = {
    name: name,
    hp: 100 + Math.floor(Math.random() * 50),
    troops: troopType,
    color: troopType === 'melee' ? 0xff5e62 : troopType === 'ranged' ? 0x1da1f2 : 0x8e54e9,
    special: 'Battle Command',
    desc: `${name} leads ${troopType} troops.`,
    prompt: prompt
  };
  
  return general;
};

// Generate formation from prompt
window.generateFormationFromPrompt = function(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  
  // Find matching formation by name
  for (const formation of FORMATIONS) {
    if (lowerPrompt.includes(formation.name.toLowerCase())) {
      return formation;
    }
  }
  
  // Generate random formation if no match
  const randomFormation = FORMATIONS[Math.floor(Math.random() * FORMATIONS.length)];
  return {
    ...randomFormation,
    prompt: prompt
  };
};

// ============================================================================
// GLOBAL EXPORTS FOR UI COMPONENTS
// ============================================================================

// Make functions globally accessible for UI components
window.selectFormation = selectFormation;
window.generateEnemy = generateEnemy;
window.startBattle = startBattle;
window.nextRound = nextRound;
window.endGame = endGame;
window.restartGame = restartGame;
window.showRoundMessage = showRoundMessage;
window.showFinalResults = showFinalResults;

// Export for testing
export { gameState, gameRenderer, battleSystem, troopManager }; 