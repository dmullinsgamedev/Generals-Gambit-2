// Scene Manager Module
// Centralizes scene transitions, UI management, and game state flow

import { simpleLogger } from './logger.js';

class SceneManager {
  constructor() {
    console.log('[SCENEMANAGER] Constructor called');
    simpleLogger.addLog('INFO', ['SceneManager constructor called']);
    this.currentScene = 'setup';
    this.scenes = {};
    this.transitions = {};
    this.uiElements = {};
    this.isInitialized = false;
    this.transitionInProgress = false;
  }

  // Initialize the scene manager
  initialize() {
    console.log('[SCENEMANAGER] initialize() called');
    simpleLogger.addLog('INFO', ['SceneManager initialize() called']);
    if (this.isInitialized) return;
    
    simpleLogger.addLog('INFO', ['Initializing Scene Manager']);
    
    // Register all scenes
    this.registerScenes();
    
    // Register UI elements
    this.registerUIElements();
    
    // Register transitions
    this.registerTransitions();
    
    this.isInitialized = true;
    simpleLogger.addLog('INFO', ['Scene Manager initialized successfully']);
    // Immediately start the setup scene
    this.changeScene('setup');
  }

  // Register all available scenes
  registerScenes() {
    this.scenes = {
      setup: {
        name: 'Setup',
        uiElements: ['promptContainer'],
        onEnter: () => this.onSetupEnter(),
        onExit: () => this.onSetupExit(),
        onUpdate: () => this.onSetupUpdate()
      },
      formation: {
        name: 'Formation Selection',
        uiElements: ['promptContainer'],
        onEnter: () => this.onFormationEnter(),
        onExit: () => this.onFormationExit(),
        onUpdate: () => this.onFormationUpdate()
      },
      battle: {
        name: 'Battle',
        uiElements: ['battleUI'],
        onEnter: () => this.onBattleEnter(),
        onExit: () => this.onBattleExit(),
        onUpdate: () => this.onBattleUpdate()
      },
      roundEnd: {
        name: 'Round End',
        uiElements: ['roundMessage'],
        onEnter: () => this.onRoundEndEnter(),
        onExit: () => this.onRoundEndExit(),
        onUpdate: () => this.onRoundEndUpdate()
      },
      gameOver: {
        name: 'Game Over',
        uiElements: ['scoreboard'],
        onEnter: () => this.onGameOverEnter(),
        onExit: () => this.onGameOverExit(),
        onUpdate: () => this.onGameOverUpdate()
      },
      pause: {
        name: 'Pause Menu',
        uiElements: ['pauseMenu'],
        onEnter: () => this.onPauseEnter(),
        onExit: () => this.onPauseExit(),
        onUpdate: () => this.onPauseUpdate()
      }
    };
  }

  // Register UI elements
  registerUIElements() {
    this.uiElements = {
      // mainMenu: document.getElementById('mainMenu') || this.createMainMenu(), // Removed as per edit
      promptContainer: document.getElementById('promptContainer'),
      battleUI: document.getElementById('battleUI') || this.createBattleUI(),
      roundMessage: null, // Created dynamically
      scoreboard: document.getElementById('scoreboard'),
      pauseMenu: document.getElementById('pauseMenu') || this.createPauseMenu(),
      debugPanel: document.getElementById('debugPanel')
    };
  }

  // Register scene transitions
  registerTransitions() {
    this.transitions = {
      fadeIn: (element, duration = 500) => this.fadeIn(element, duration),
      fadeOut: (element, duration = 500) => this.fadeOut(element, duration),
      slideIn: (element, direction = 'left', duration = 500) => this.slideIn(element, direction, duration),
      slideOut: (element, direction = 'right', duration = 500) => this.slideOut(element, direction, duration),
      instant: (element, show) => this.instantShow(element, show)
    };
  }

  // Create missing UI elements
  createBattleUI() {
    const battleUI = document.createElement('div');
    battleUI.id = 'battleUI';
    battleUI.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      z-index: 100;
      display: none;
    `;
    battleUI.innerHTML = `
      <div style="background: rgba(0,0,0,0.7); color: white; padding: 10px; border-radius: 5px;">
        <div>Round: <span id="roundDisplay">1</span></div>
        <div>Player HP: <span id="playerHPDisplay">100</span></div>
        <div>Enemy HP: <span id="enemyHPDisplay">100</span></div>
      </div>
    `;
    document.body.appendChild(battleUI);
    return battleUI;
  }

  createPauseMenu() {
    const pauseMenu = document.createElement('div');
    pauseMenu.id = 'pauseMenu';
    pauseMenu.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.8);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      font-family: 'Luckiest Guy', cursive;
      color: white;
    `;
    pauseMenu.innerHTML = `
      <div style="text-align: center;">
        <h1 style="font-size: 3em; margin-bottom: 40px;">Paused</h1>
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <button class="menu-btn" onclick="sceneManager.resumeGame()">Resume</button>
          <button class="menu-btn" onclick="sceneManager.changeScene('mainMenu')">Main Menu</button>
          <button class="menu-btn" onclick="sceneManager.showSettings()">Settings</button>
        </div>
      </div>
    `;
    document.body.appendChild(pauseMenu);
    return pauseMenu;
  }

  // Change to a new scene
  changeScene(newScene, transitionType = 'fade') {
    console.log('[SCENEMANAGER] changeScene called with:', newScene);
    simpleLogger.addLog('INFO', ['SceneManager changeScene called with:', newScene]);
    if (this.transitionInProgress) {
      simpleLogger.addLog('WARN', ['Scene transition already in progress, ignoring request']);
      return;
    }

    if (!this.scenes[newScene]) {
      simpleLogger.addLog('ERROR', ['Scene not found:', newScene]);
      console.log('Available scenes:', Object.keys(this.scenes));
      return;
    }

    simpleLogger.addLog('INFO', [`Changing scene from ${this.currentScene} to ${newScene}`]);

    this.transitionInProgress = true;

    // Exit current scene
    if (this.scenes[this.currentScene] && this.scenes[this.currentScene].onExit) {
      this.scenes[this.currentScene].onExit();
    }

    // Hide current scene UI
    this.hideSceneUI(this.currentScene);

    // Update current scene
    const oldScene = this.currentScene;
    this.currentScene = newScene;

    // Show new scene UI
    this.showSceneUI(newScene);

    // Enter new scene
    if (this.scenes[newScene] && this.scenes[newScene].onEnter) {
      console.log('Calling onEnter for scene:', newScene);
      this.scenes[newScene].onEnter();
    }

    // Update game state
    if (window.state) {
      window.state.phase = newScene;
    }

    this.transitionInProgress = false;
    simpleLogger.addLog('INFO', [`Scene transition complete: ${oldScene} -> ${newScene}`]);
  }

  // Show UI elements for a scene
  showSceneUI(sceneName) {
    const scene = this.scenes[sceneName];
    if (!scene) return;

    scene.uiElements.forEach(elementId => {
      const element = this.uiElements[elementId];
      if (element) {
        element.style.display = 'block';
        simpleLogger.addLog('DEBUG', [`Showing UI element: ${elementId}`]);
      }
    });
  }

  // Hide UI elements for a scene
  hideSceneUI(sceneName) {
    const scene = this.scenes[sceneName];
    if (!scene) return;

    scene.uiElements.forEach(elementId => {
      const element = this.uiElements[elementId];
      if (element) {
        element.style.display = 'none';
        simpleLogger.addLog('DEBUG', [`Hiding UI element: ${elementId}`]);
      }
    });
  }

  // Get current scene
  getCurrentScene() {
    return this.currentScene;
  }

  // Get scene info
  getSceneInfo(sceneName) {
    return this.scenes[sceneName] || null;
  }

  // Check if scene exists
  hasScene(sceneName) {
    return !!this.scenes[sceneName];
  }

  // Get all available scenes
  getAllScenes() {
    return Object.keys(this.scenes);
  }

  // Scene-specific enter handlers
  onSetupEnter() {
    simpleLogger.addLog('INFO', ['Entering setup scene']);
    if (window.showPromptInput) {
      window.showPromptInput('general');
    }
  }

  onSetupExit() {
    simpleLogger.addLog('INFO', ['Exiting setup scene']);
  }

  onSetupUpdate() {
    // Setup scene updates
  }

  onFormationEnter() {
    simpleLogger.addLog('INFO', ['Entering formation scene']);
    // Show formation selection prompt
    if (window.showPromptInput) {
      simpleLogger.addLog('INFO', ['Calling showPromptInput for formation']);
      window.showPromptInput('formation');
    } else {
      simpleLogger.addLog('ERROR', ['showPromptInput function not available']);
    }
  }

  onFormationExit() {
    simpleLogger.addLog('INFO', ['Exiting formation scene']);
  }

  onFormationUpdate() {
    // Formation scene updates
  }

  onBattleEnter() {
    simpleLogger.addLog('INFO', ['Entering battle scene']);
    // Start battle
    if (window.startBattle) {
      window.startBattle();
    }
  }

  onBattleExit() {
    simpleLogger.addLog('INFO', ['Exiting battle scene']);
    // Stop battle
  }

  onBattleUpdate() {
    // Battle scene updates
  }

  onRoundEndEnter() {
    simpleLogger.addLog('INFO', ['Entering round end scene']);
    // Show round result
  }

  onRoundEndExit() {
    simpleLogger.addLog('INFO', ['Exiting round end scene']);
  }

  onRoundEndUpdate() {
    // Round end scene updates
  }

  onGameOverEnter() {
    simpleLogger.addLog('INFO', ['Entering game over scene']);
    // Game over scene is no longer used - automatically restart
    this.changeScene('setup');
  }

  onGameOverExit() {
    simpleLogger.addLog('INFO', ['Exiting game over scene']);
  }

  onGameOverUpdate() {
    // Game over scene updates
  }

  onPauseEnter() {
    simpleLogger.addLog('INFO', ['Entering pause scene']);
    // Pause game logic
  }

  onPauseExit() {
    simpleLogger.addLog('INFO', ['Exiting pause scene']);
    // Resume game logic
  }

  onPauseUpdate() {
    // Pause scene updates
  }

  // Transition effects
  fadeIn(element, duration = 500) {
    if (!element) return;
    element.style.opacity = '0';
    element.style.display = 'block';
    element.style.transition = `opacity ${duration}ms ease-in-out`;
    setTimeout(() => {
      element.style.opacity = '1';
    }, 10);
  }

  fadeOut(element, duration = 500) {
    if (!element) return;
    element.style.transition = `opacity ${duration}ms ease-in-out`;
    element.style.opacity = '0';
    setTimeout(() => {
      element.style.display = 'none';
    }, duration);
  }

  slideIn(element, direction = 'left', duration = 500) {
    if (!element) return;
    const startPosition = direction === 'left' ? '-100%' : '100%';
    element.style.transform = `translateX(${startPosition})`;
    element.style.display = 'block';
    element.style.transition = `transform ${duration}ms ease-in-out`;
    setTimeout(() => {
      element.style.transform = 'translateX(0)';
    }, 10);
  }

  slideOut(element, direction = 'right', duration = 500) {
    if (!element) return;
    const endPosition = direction === 'right' ? '100%' : '-100%';
    element.style.transition = `transform ${duration}ms ease-in-out`;
    element.style.transform = `translateX(${endPosition})`;
    setTimeout(() => {
      element.style.display = 'none';
    }, duration);
  }

  instantShow(element, show) {
    if (!element) return;
    element.style.display = show ? 'block' : 'none';
  }

  // Utility methods
  showRoundMessage(playerWon) {
    const message = playerWon ? 'VICTORY!' : 'DEFEAT!';
    const overlay = document.createElement('div');
    overlay.id = 'roundMessageOverlay';
    overlay.textContent = message;
    
    // Set color based on win/loss
    if (playerWon) {
      overlay.style.color = '#22ff22';
      overlay.style.textShadow = '0 0 20px #22ff22';
    } else {
      overlay.style.color = '#ff5e62';
      overlay.style.textShadow = '0 0 20px #ff5e62';
    }
    
    document.body.appendChild(overlay);
    
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      // Always move to next round, never show game over screen
      if (window.state) {
        window.state.round++;
      }
      this.changeScene('setup');
    }, 2000);
  }

  pauseGame() {
    this.changeScene('pause');
  }

  resumeGame() {
    this.changeScene('battle');
  }

  showSettings() {
    // TODO: Implement settings menu
    simpleLogger.addLog('INFO', ['Settings menu requested']);
  }

  showCredits() {
    // TODO: Implement credits screen
    simpleLogger.addLog('INFO', ['Credits screen requested']);
  }

  // Update method for continuous scene updates
  update(deltaTime) {
    if (this.scenes[this.currentScene] && this.scenes[this.currentScene].onUpdate) {
      this.scenes[this.currentScene].onUpdate(deltaTime);
    }
  }

  // Add new scene
  addScene(sceneName, sceneConfig) {
    this.scenes[sceneName] = sceneConfig;
    simpleLogger.addLog('INFO', ['Added new scene:', sceneName]);
  }

  // Remove scene
  removeScene(sceneName) {
    if (this.scenes[sceneName]) {
      delete this.scenes[sceneName];
      simpleLogger.addLog('INFO', ['Removed scene:', sceneName]);
    }
  }

  // Get scene statistics
  getSceneStats() {
    return {
      currentScene: this.currentScene,
      totalScenes: Object.keys(this.scenes).length,
      availableScenes: Object.keys(this.scenes),
      isTransitioning: this.transitionInProgress
    };
  }

  // Destroy the scene manager
  destroy() {
    this.scenes = {};
    this.transitions = {};
    this.uiElements = {};
    this.isInitialized = false;
    simpleLogger.addLog('INFO', ['Scene Manager destroyed']);
  }
}

// Create singleton instance
const sceneManager = new SceneManager();

// Export functions for backward compatibility
export function changeScene(sceneName, transitionType) {
  return sceneManager.changeScene(sceneName, transitionType);
}

export function getCurrentScene() {
  return sceneManager.getCurrentScene();
}

export function showRoundMessage(playerWon) {
  return sceneManager.showRoundMessage(playerWon);
}

export function pauseGame() {
  return sceneManager.pauseGame();
}

export function resumeGame() {
  return sceneManager.resumeGame();
}

// Export the manager instance for advanced usage
export { sceneManager }; 