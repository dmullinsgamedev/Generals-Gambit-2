// ============================================================================
// GAME STATE MANAGEMENT
// ============================================================================

export class GameState {
  constructor() {
    this.state = {
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
    
    // Make state globally accessible for backward compatibility
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
    console.log(`Game phase changed to: ${phase}`);
  }
  
  setPlayer(player) { 
    this.state.player = player; 
    this.state.playerHP = player.hp || 0;
  }
  
  setEnemy(enemy) { 
    this.state.enemy = enemy; 
    this.state.enemyHP = enemy.hp || 0;
  }
  
  setPlayerFormation(formation) { this.state.playerFormation = formation; }
  setEnemyFormation(formation) { this.state.enemyFormation = formation; }
  
  setPlayerTroops(troops) { this.state.playerTroops = troops; }
  setEnemyTroops(troops) { this.state.enemyTroops = troops; }
  
  updatePlayerHP(delta) { 
    this.state.playerHP = Math.max(0, this.state.playerHP + delta); 
  }
  
  updateEnemyHP(delta) { 
    this.state.enemyHP = Math.max(0, this.state.enemyHP + delta); 
  }
  
  nextRound() {
    this.state.round++;
    this.state.roundInitializing = false;
    this.state.roundEnded = false;
  }
  
  resetRound() {
    this.state.roundInitializing = false;
    this.state.roundEnded = false;
    this.state.battleTimer = 0;
    this.state.battleStart = 0;
  }
  
  startBattle() {
    this.state.battleStart = Date.now();
    this.state.battleTimer = 0;
  }
  
  updateBattleTimer() {
    if (this.state.battleStart) {
      this.state.battleTimer = (Date.now() - this.state.battleStart) / 1000;
    }
  }
  
  // Save/load scores
  saveScores() {
    localStorage.setItem('bf_scores', JSON.stringify(this.state.scores));
  }
  
  addScore(score) {
    this.state.scores.push(score);
    this.saveScores();
  }
  
  // Get game state for logging
  getGameStateForLogging() {
    return {
      phase: this.state.phase,
      player: this.state.player?.name || 'none',
      enemy: this.state.enemy?.name || 'none',
      playerFormation: this.state.playerFormation?.name || 'none',
      enemyFormation: this.state.enemyFormation?.name || 'none',
      playerTroops: this.state.playerTroops?.length || 0,
      enemyTroops: this.state.enemyTroops?.length || 0
    };
  }
}

// Create and export singleton instance
export const gameState = new GameState(); 