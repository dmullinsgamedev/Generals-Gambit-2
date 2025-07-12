// ============================================================================
// UI COMPONENTS AND SYSTEMS
// ============================================================================

import { generateCustomTroopMesh, determineTroopVariantFromPrompt } from '../generation/TroopGenerator.js';
import { GENERALS, FORMATIONS, TROOP_TYPES, TROOP_VARIANTS } from '../data/GameData.js';
import { gameState } from '../core/GameState.js';

// --- Formation Preview System ---
export function showFormationPreview(formation) {
  const promptContainer = document.getElementById('promptContainer');
  
  promptContainer.innerHTML = `
    <div class="prompt-content">
      <div class="prompt-header">
        <h2>Formation Preview</h2>
        <button class="close-btn" onclick="hideFormationPreview()">×</button>
      </div>
      
      <div class="prompt-body">
        <div class="formation-info">
          <h3>${formation.name}</h3>
          <p><strong>Attack:</strong> ${formation.bonus.atk.toFixed(1)}x</p>
          <p><strong>Defense:</strong> ${formation.bonus.def.toFixed(1)}x</p>
          <p><strong>Speed:</strong> ${formation.bonus.speed.toFixed(1)}x</p>
          <p><strong>Description:</strong> ${formation.desc}</p>
        </div>
        
        <div class="formation-3d-preview" id="formation3dPreview">
          <!-- 3D formation preview will be rendered here -->
        </div>
        
        <div class="prompt-buttons">
          <button class="back-btn" onclick="hideFormationPreview()">Back</button>
          <button class="confirm-btn" onclick="selectFormationFromPreview()">Select Formation</button>
        </div>
      </div>
    </div>
  `;
  
  // Store formation data for later use
  window.currentFormation = formation;
  
  // Render 3D formation preview
  if (window.createFormationPreview) {
    const previewContainer = document.getElementById('formation3dPreview');
    window.createFormationPreview(previewContainer, formation, '');
  }
}

// --- Prompt UI ---
export function showPromptInput(type) {
  const promptContainer = document.getElementById('promptContainer');
  promptContainer.style.display = 'block';
  let enemyText = '';
  if (type === 'general') {
    enemyText = gameState.enemy && gameState.enemy.name ? `(Enemy chose: ${gameState.enemy.name})` : '';
  } else if (type === 'formation') {
    enemyText = gameState.enemyFormation && gameState.enemyFormation.name ? `(Enemy formation: ${gameState.enemyFormation.name})` : '';
  }
  promptContainer.innerHTML = `
    <h2 style="font-size:2.2em;margin-bottom:0.3em;">DESCRIBE YOUR ${type === 'general' ? 'TROOPS' : 'FORMATION'}</h2>
    <div id="enemyChoice" style="font-size:1.1em;margin-bottom:1em;"><b>${enemyText}</b></div>
    <input id="promptInput" class="prompt-input" placeholder="e.g.," autocomplete="off" style="width:100%;font-family:'Luckiest Guy',cursive,Arial,sans-serif;font-size:1.3em;padding:1em;box-sizing:border-box;" />
    <div class="prompt-buttons" style="margin:1em 0;">
      <button class="menu-btn" id="randomBtn">RANDOM</button>
      <button class="menu-btn" id="generateBtn">GENERATE ${type === 'general' ? 'TROOPS' : 'FORMATION'}</button>
    </div>
    <div id="previewContainer" style="display:none;margin-top:20px;text-align:center;">
      <h4>Preview</h4>
      <div id="preview3D" style="width:300px;height:200px;margin:0 auto;border:1px solid #ccc;background:#f0f0f0;"></div>
      <div id="previewInfo" style="margin-top:10px;"></div>
    </div>
  `;
  const input = document.getElementById('promptInput');
  input.focus();
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      generateFromPrompt(type, true);
    }
  });
  document.getElementById('generateBtn').onclick = () => generateFromPrompt(type, true);
  document.getElementById('randomBtn').onclick = () => window.generateRandom(type);
}
window.showPromptInput = showPromptInput;

function generateFromPrompt(promptType, showPreviewOnly) {
  const prompt = document.getElementById('promptInput').value.trim();
  if (!prompt) {
    alert('Please enter a description!');
    return;
  }
  
  let result;
  if (promptType === 'general') {
    result = window.generateGeneralFromPrompt(prompt);
    gameState.setPlayer(result);
    // Generate enemy if not already generated
    if (!gameState.enemy) {
      const enemyGeneral = GENERALS[Math.floor(Math.random() * GENERALS.length)];
      gameState.setEnemy(enemyGeneral);
    }
    window.showTroopPreviewCombined(result, prompt);
  } else {
    result = window.generateFormationFromPrompt(prompt);
    gameState.setPlayerFormation(result);
    window.showPreview(promptType, result, prompt);
  }
}
window.generateFromPrompt = generateFromPrompt;

window.showPreview = function(promptType, result, prompt) {
  const previewContainer = document.getElementById('previewContainer');
  const preview3D = document.getElementById('preview3D');
  const previewInfo = document.getElementById('previewInfo');
  
  previewContainer.style.display = 'block';
  
  if (promptType === 'formation') {
    previewInfo.innerHTML = `
      <h4>${result.name}</h4>
      <p><strong>Attack:</strong> ${result.bonus.atk.toFixed(1)}x</p>
      <p><strong>Defense:</strong> ${result.bonus.def.toFixed(1)}x</p>
      <p><strong>Speed:</strong> ${result.bonus.speed.toFixed(1)}x</p>
      <p><strong>Description:</strong> ${result.desc}</p>
      <button class="menu-btn" id="continueToBattleBtn">Continue to Battle</button>
    `;
    
    // Create formation preview
    if (window.createFormationPreview) {
      window.createFormationPreview(preview3D, result, prompt);
    }
    
    setTimeout(() => {
      const btn = document.getElementById('continueToBattleBtn');
      if (btn) {
        btn.onclick = () => {
          btn.disabled = true;
          window.startBattleFromPrompt();
        };
      }
    }, 0);
  }
};

window.generateRandom = function(promptType) {
  if (promptType === 'general') {
    const troopTypes = ['melee', 'ranged', 'magic'];
    const troopType = troopTypes[Math.floor(Math.random() * troopTypes.length)];
    const variants = TROOP_VARIANTS[troopType];
    const variant = variants[Math.floor(Math.random() * variants.length)];
    const randomDescriptions = [
      `${variant.name.toLowerCase()} ${troopType} warriors`,
      `Elite ${variant.name.toLowerCase()} troops`,
      `Heavy ${variant.name.toLowerCase()} soldiers`,
      `Light ${variant.name.toLowerCase()} fighters`,
      `Royal ${variant.name.toLowerCase()} guards`,
      `Stealthy ${variant.name.toLowerCase()} units`,
      `Aggressive ${variant.name.toLowerCase()} warriors`,
      `Defensive ${variant.name.toLowerCase()} troops`
    ];
    const randomDesc = randomDescriptions[Math.floor(Math.random() * randomDescriptions.length)];
    document.getElementById('promptInput').value = randomDesc;
  } else {
    const formations = ['phalanx', 'wedge', 'line', 'square', 'skirmish', 'column', 'echelon', 'hammer and anvil', 'crescent', 'circle', 'arrowhead', 'shield wall', 'pincer', 'turtle', 'spearhead', 'scatter', 'box', 'encirclement'];
    const formation = formations[Math.floor(Math.random() * formations.length)];
    const randomFormations = [
      `Ancient ${formation} formation`,
      `Aggressive ${formation} tactic`,
      `Defensive ${formation} strategy`,
      `Fast ${formation} movement`,
      `Heavy ${formation} defense`,
      `Mobile ${formation} approach`,
      `Tactical ${formation} deployment`
    ];
    const randomForm = randomFormations[Math.floor(Math.random() * randomFormations.length)];
    document.getElementById('promptInput').value = randomForm;
  }
};

window.showTroopPreviewCombined = function(result, prompt) {
  const previewContainer = document.getElementById('previewContainer');
  const preview3D = document.getElementById('preview3D');
  const previewInfo = document.getElementById('previewInfo');
  previewContainer.style.display = 'block';
  previewInfo.innerHTML = `<button class="menu-btn" id="continueToFormationBtn">Continue to Formation</button>`;
  if (window.createTroopPreview) window.createTroopPreview(preview3D, result, prompt);
  setTimeout(() => {
    const btn = document.getElementById('continueToFormationBtn');
    if (btn) {
      btn.onclick = () => {
        btn.disabled = true;
        window.continueToFormation();
      };
    }
  }, 0);
};

window.continueToFormation = function() {
  // Hide the prompt container
  const promptContainer = document.getElementById('promptContainer');
  promptContainer.style.display = 'none';
  
  // Generate enemy formation and show formation selection
  if (window.enemyChooseFormation) {
    window.enemyChooseFormation();
  }
};

window.goBackToTroops = function() {
  window.showPromptInput('general');
};

window.startBattleFromPrompt = function() {
  // Hide the prompt container
  const promptContainer = document.getElementById('promptContainer');
  if (promptContainer) {
    promptContainer.style.display = 'none';
  }

  // Always set the player's formation to the currently previewed formation before battle
  if (window.currentFormation) {
    gameState.setPlayerFormation(window.currentFormation);
  }

  // Generate enemy if not already generated
  if (!gameState.enemy) {
    const enemyGeneral = GENERALS[Math.floor(Math.random() * GENERALS.length)];
    gameState.setEnemy(enemyGeneral);
  }

  // Generate enemy formation
  const enemyFormation = FORMATIONS[Math.floor(Math.random() * FORMATIONS.length)];
  gameState.setEnemyFormation(enemyFormation);

  // Start battle
  if (window.startBattle) {
    window.startBattle();
  }
};

// --- Formation Preview ---
window.createFormationPreview = function(container, formation, prompt) {
  // Simple 3D formation preview
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ alpha: true });
  
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);
  
  // Add some simple troop representations
  for (let i = 0; i < 10; i++) {
    const geometry = new THREE.SphereGeometry(0.1, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0x1da1f2 });
    const troop = new THREE.Mesh(geometry, material);
    
    // Position in formation
    const row = Math.floor(i / 5);
    const col = i % 5;
    troop.position.set((col - 2) * 0.3, 0, (row - 1) * 0.3);
    scene.add(troop);
  }
  
  camera.position.z = 5;
  
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();
};

// --- Troop Preview ---
window.createTroopPreview = function(container, result, prompt) {
  // Simple 3D troop preview
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ alpha: true });
  
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);
  
  // Create a simple troop representation
  const geometry = new THREE.CylinderGeometry(0.1, 0.12, 0.4, 8);
  const material = new THREE.MeshBasicMaterial({ color: result.color || 0x1da1f2 });
  const troop = new THREE.Mesh(geometry, material);
  scene.add(troop);
  
  camera.position.z = 3;
  
  function animate() {
    requestAnimationFrame(animate);
    troop.rotation.y += 0.01;
    renderer.render(scene, camera);
  }
  animate();
};

// --- Enemy Formation Selection ---
window.enemyChooseFormation = function() {
  const enemyFormation = FORMATIONS[Math.floor(Math.random() * FORMATIONS.length)];
  gameState.setEnemyFormation(enemyFormation);
  
  // Show formation selection for player
  window.showPromptInput('formation');
};

export function hideFormationPreview() {
  const promptContainer = document.getElementById('promptContainer');
  promptContainer.style.display = 'none';
}
window.hideFormationPreview = hideFormationPreview; 