// ============================================================================
// GENERAL'S GAMBIT - MAIN GAME LOGIC
// ============================================================================

// Import game data and troop generation
import { GENERALS, FORMATIONS, ROUND_LIMIT, TROOP_TYPES, TROOP_VARIANTS } from './gameData.js';
import { generateCustomTroopMesh, determineTroopVariantFromPrompt } from './troopGenerator.js';
import { showTroopDescriptionUI, showFormationPreview } from './uiComponents.js';

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

// --- UI Elements ---
const cardRow = document.getElementById('cardRow');
const promptContainer = document.getElementById('promptContainer');
const scoreboard = document.getElementById('scoreboard');
const canvas = document.getElementById('three-canvas');

// ============================================================================
// INITIALIZATION
// ============================================================================

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', function() {
  initializeUI();
  initializeThreeJS();
  startGame();
});

// ============================================================================
// UI MANAGEMENT
// ============================================================================

function initializeUI() {
  // Create victory/defeat overlay
  if (!document.getElementById('roundMessageOverlay')) {
    const overlay = document.createElement('div');
    overlay.id = 'roundMessageOverlay';
    overlay.style.display = 'none';
    document.body.appendChild(overlay);
  }
}

function showRoundMessage(win) {
  const overlay = document.getElementById('roundMessageOverlay');
  overlay.textContent = win ? 'Victory! 🎉' : 'Defeat! 😢';
  overlay.style.display = 'flex';
  setTimeout(() => {
    overlay.style.display = 'none';
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
  camera.position.set(0, 5, 10);
  
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
  const groundGeometry = new THREE.PlaneGeometry(50, 50, 20, 20);
  const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x90EE90 });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  
  // Add terrain height variation
  const vertices = groundGeometry.attributes.position.array;
  for (let i = 0; i < vertices.length; i += 3) {
    vertices[i + 2] = Math.random() * 0.5; // Add height variation
  }
  groundGeometry.attributes.position.needsUpdate = true;
  groundGeometry.computeVertexNormals();
  
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
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

// ============================================================================
// GAME LOGIC
// ============================================================================

function startGame() {
  state.phase = 'setup';
  showGeneralSelection();
}

function showGeneralSelection() {
  cardRow.innerHTML = '';
  promptContainer.style.display = 'none';
  scoreboard.style.display = 'none';
  
  // Add custom troop description option
  const customCard = document.createElement('div');
  customCard.className = 'card custom-card';
  customCard.innerHTML = `
    <h3>Custom Troops</h3>
    <p>Describe your own troops</p>
  `;
  customCard.onclick = () => showTroopDescriptionUI();
  cardRow.appendChild(customCard);
  
  // Add preset generals
  GENERALS.forEach(general => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${general.name}</h3>
      <p>${general.desc}</p>
    `;
    card.onclick = () => selectGeneral(general);
    cardRow.appendChild(card);
  });
}

function selectGeneral(general) {
  state.player = general;
  state.phase = 'formation';
  showFormationSelection();
}

function showFormationSelection() {
  cardRow.innerHTML = '';
  
  FORMATIONS.forEach(formation => {
    const card = document.createElement('div');
    card.className = 'card formation-card';
    card.innerHTML = `
      <h3>${formation.name}</h3>
      <p>ATK: ${formation.bonus.atk.toFixed(1)}x | DEF: ${formation.bonus.def.toFixed(1)}x | SPD: ${formation.bonus.speed.toFixed(1)}x</p>
      <p>${formation.desc}</p>
    `;
    card.onclick = () => showFormationPreview(formation);
    cardRow.appendChild(card);
  });
}

function selectFormation(formation) {
  state.playerFormation = formation;
  generateEnemy();
  startBattle();
}

function generateEnemy() {
  // Random enemy general
  const enemyGeneral = GENERALS[Math.floor(Math.random() * GENERALS.length)];
  state.enemy = enemyGeneral;
  
  // Random enemy formation
  const enemyFormation = FORMATIONS[Math.floor(Math.random() * FORMATIONS.length)];
  state.enemyFormation = enemyFormation;
}

function startBattle() {
  state.phase = 'battle';
  state.battleStart = Date.now();
  
  // Initialize troops
  initializeTroops();
  
  // Start battle loop
  battleLoop();
}

function initializeTroops() {
  // Clear existing troops
  clearTroops();
  
  // Create player troops
  const playerTroopCount = 20;
  for (let i = 0; i < playerTroopCount; i++) {
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
  
  // Position troops in formations
  positionTroopsInFormation(playerTroops, state.playerFormation, true);
  positionTroopsInFormation(enemyTroops, state.enemyFormation, false);
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

function createTroop(isPlayer, troopType, color) {
  const troopData = TROOP_TYPES[troopType];
  const variant = TROOP_VARIANTS[troopType][Math.floor(Math.random() * TROOP_VARIANTS[troopType].length)];
  
  // Use advanced troop generation for more detailed troops
  const mesh = generateCustomTroopMesh(variant.name, isPlayer, color);
  
  const troop = {
    hp: troopData.hp,
    maxHp: troopData.hp,
    atk: troopData.atk,
    range: troopData.range,
    rate: troopData.rate,
    cooldown: 0,
    type: troopType,
    variant: variant,
    isPlayer: isPlayer,
    mesh: mesh,
    position: { x: 0, y: 0, z: 0 }
  };
  
  return troop;
}

function positionTroopsInFormation(troops, formation, isPlayer) {
  const baseX = isPlayer ? -5 : 5;
  const baseZ = 0;
  
  // Simple line formation for now
  const spacing = 0.8;
  const rows = Math.ceil(troops.length / 5);
  
  troops.forEach((troop, index) => {
    const row = Math.floor(index / 5);
    const col = index % 5;
    
    const x = baseX + (col - 2) * spacing;
    const z = baseZ + (row - Math.floor(rows/2)) * spacing;
    
    troop.mesh.position.set(x, 0, z);
    troop.position = { x: x, y: 0, z: z };
  });
}

function battleLoop() {
  if (state.phase !== 'battle') return;
  
  // Update troop cooldowns and attacks
  updateTroops();
  
  // Update projectiles
  updateProjectiles();
  
  // Check for battle end
  checkBattleEnd();
  
  // Continue loop
  setTimeout(battleLoop, 100);
}

function updateTroops() {
  // Update player troops
  playerTroops.forEach(troop => {
    if (troop.hp <= 0) return;
    
    troop.cooldown--;
    if (troop.cooldown <= 0) {
      // Find target
      const target = findNearestEnemy(troop, enemyTroops);
      if (target && getDistance(troop, target) <= troop.range) {
        attack(troop, target);
        troop.cooldown = troop.rate;
      }
    }
  });
  
  // Update enemy troops
  enemyTroops.forEach(troop => {
    if (troop.hp <= 0) return;
    
    troop.cooldown--;
    if (troop.cooldown <= 0) {
      // Find target
      const target = findNearestEnemy(troop, playerTroops);
      if (target && getDistance(troop, target) <= troop.range) {
        attack(troop, target);
        troop.cooldown = troop.rate;
      }
    }
  });
}

function findNearestEnemy(troop, enemies) {
  let nearest = null;
  let minDistance = Infinity;
  
  enemies.forEach(enemy => {
    if (enemy.hp <= 0) return;
    
    const distance = getDistance(troop, enemy);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = enemy;
    }
  });
  
  return nearest;
}

function getDistance(troop1, troop2) {
  const dx = troop1.position.x - troop2.position.x;
  const dz = troop1.position.z - troop2.position.z;
  return Math.sqrt(dx * dx + dz * dz);
}

function attack(attacker, target) {
  // Deal damage
  target.hp -= attacker.atk;
  
  // Create projectile for ranged attacks
  if (attacker.type === 'ranged' || attacker.type === 'magic') {
    createProjectile(attacker, target);
  }
  
  // Update target mesh if dead
  if (target.hp <= 0) {
    target.mesh.visible = false;
  }
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
  const playerAlive = playerTroops.some(troop => troop.hp > 0);
  const enemyAlive = enemyTroops.some(troop => troop.hp > 0);
  
  if (!playerAlive || !enemyAlive) {
    const playerWon = enemyAlive === false;
    endBattle(playerWon);
  }
}

function endBattle(playerWon) {
  state.phase = 'end';
  
  if (playerWon) {
    state.playerScore++;
    showRoundMessage(true);
  } else {
    state.enemyScore++;
    showRoundMessage(false);
  }
}

function nextRound() {
  if (state.round > ROUND_LIMIT) {
    endGame();
  } else {
    state.phase = 'formation';
    showFormationSelection();
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
  cardRow.innerHTML = '';
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
  
  // Restart game
  startGame();
}

// Make functions globally accessible
window.restartGame = restartGame;
window.selectGeneral = selectGeneral;
window.selectFormation = selectFormation;

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

// ============================================================================
// WINDOW RESIZE HANDLING
// ============================================================================

window.addEventListener('resize', function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
