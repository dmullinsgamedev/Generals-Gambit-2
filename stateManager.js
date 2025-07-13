// ============================================================================
// SIMPLE STATE MANAGER - INCREMENTAL REFACTORING STEP 2
// ============================================================================

// Simple state manager that wraps existing state without breaking functionality
class SimpleStateManager {
  constructor() {
    // Don't create new state - use existing state
    this.state = window.state || {
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
    
    // Ensure global state is available
    window.state = this.state;
  }
  
  // Getter methods
  get currentPhase() { return this.state.phase; }
  get currentRound() { return this.state.round; }
  get player() { return this.state.player; }
  get enemy() { return this.state.enemy; }
  get playerFormation() { return this.state.playerFormation; }
  get enemyFormation() { return this.state.enemyFormation; }
  get playerHP() { return this.state.playerHP; }
  get enemyHP() { return this.state.enemyHP; }
  get playerTroops() { return this.state.playerTroops; }
  get enemyTroops() { return this.state.enemyTroops; }
  get playerScore() { return this.state.playerScore; }
  get enemyScore() { return this.state.enemyScore; }
  
  // Setter methods
  setPhase(phase) { 
    this.state.phase = phase; 
    console.log(`State change: phase -> ${phase}`);
  }
  
  setPlayer(player) { 
    this.state.player = player; 
    this.state.playerHP = player?.hp || 0;
    console.log(`State change: player -> ${player?.name || 'none'}`);
  }
  
  setEnemy(enemy) { 
    this.state.enemy = enemy; 
    this.state.enemyHP = enemy?.hp || 0;
    console.log(`State change: enemy -> ${enemy?.name || 'none'}`);
  }
  
  setPlayerFormation(formation) { 
    this.state.playerFormation = formation; 
    console.log(`State change: playerFormation -> ${formation?.name || 'none'}`);
  }
  
  setEnemyFormation(formation) { 
    this.state.enemyFormation = formation; 
    console.log(`State change: enemyFormation -> ${formation?.name || 'none'}`);
  }
  
  setPlayerTroops(troops) { 
    this.state.playerTroops = troops; 
    console.log(`State change: playerTroops -> ${troops?.length || 0} troops`);
  }
  
  setEnemyTroops(troops) { 
    this.state.enemyTroops = troops; 
    console.log(`State change: enemyTroops -> ${troops?.length || 0} troops`);
  }
  
  updatePlayerHP(delta) { 
    this.state.playerHP = Math.max(0, this.state.playerHP + delta); 
    console.log(`State change: playerHP -> ${this.state.playerHP}`);
  }
  
  updateEnemyHP(delta) { 
    this.state.enemyHP = Math.max(0, this.state.enemyHP + delta); 
    console.log(`State change: enemyHP -> ${this.state.enemyHP}`);
  }
  
  nextRound() {
    this.state.round++;
    this.state.roundInitializing = false;
    this.state.roundEnded = false;
    console.log(`State change: round -> ${this.state.round}`);
  }
  
  resetRound() {
    this.state.roundInitializing = false;
    this.state.roundEnded = false;
    this.state.battleTimer = 0;
    this.state.battleStart = 0;
    console.log('State change: round reset');
  }
  
  startBattle() {
    this.state.battleStart = Date.now();
    this.state.battleTimer = 0;
    console.log('State change: battle started');
  }
  
  updateBattleTimer() {
    if (this.state.battleStart) {
      this.state.battleTimer = (Date.now() - this.state.battleStart) / 1000;
    }
  }
  
  // Get current state for debugging
  getState() {
    return { ...this.state };
  }
  
  // Get state summary for logging
  getStateSummary() {
    return {
      phase: this.state.phase,
      round: this.state.round,
      player: this.state.player?.name || 'none',
      enemy: this.state.enemy?.name || 'none',
      playerFormation: this.state.playerFormation?.name || 'none',
      enemyFormation: this.state.enemyFormation?.name || 'none',
      playerTroops: this.state.playerTroops?.length || 0,
      enemyTroops: this.state.enemyTroops?.length || 0,
      playerHP: this.state.playerHP,
      enemyHP: this.state.enemyHP
    };
  }
  
  // Methods needed by main.js
  getPlayerTroopType() {
    return this.state.player?.troopType || 'melee';
  }
  
  getEnemyTroopType() {
    return this.state.enemy?.troopType || 'melee';
  }
  
  getPlayerColor() {
    return this.state.player?.color || '#00ff00';
  }
  
  getEnemyColor() {
    return this.state.enemy?.color || '#ff0000';
  }
  
  getPlayerFormation() {
    return this.state.playerFormation;
  }
  
  getEnemyFormation() {
    return this.state.enemyFormation;
  }
  
  getPlayerGeneral() {
    return this.state.player;
  }
  
  getEnemyGeneral() {
    return this.state.enemy;
  }
}

// Create and export singleton instance
export const simpleStateManager = new SimpleStateManager();

// Make it globally accessible for backward compatibility
window.simpleStateManager = simpleStateManager; 