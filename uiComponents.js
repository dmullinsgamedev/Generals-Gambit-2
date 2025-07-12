// ============================================================================
// UI COMPONENTS AND SYSTEMS
// ============================================================================

import { generateCustomTroopMesh, determineTroopVariantFromPrompt } from './troopGenerator.js';
import { GENERALS, FORMATIONS, TROOP_TYPES, TROOP_VARIANTS } from './gameData.js';
import { generateGeneralFromPrompt, generateFormationFromPrompt } from './main.js';

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
  
  // Render 3D formation preview using the robust main.js version
  if (window.createFormationPreview) {
    const previewContainer = document.getElementById('formation3dPreview');
    window.createFormationPreview(previewContainer, formation, '');
  }
}

// --- Prompt UI Restoration ---

// Show the prompt input for troop or formation
export function showPromptInput(type) {
  const promptContainer = document.getElementById('promptContainer');
  promptContainer.style.display = 'block';
  let enemyText = '';
  if (type === 'general') {
    enemyText = window.state && window.state.enemy && window.state.enemy.name ? `(Enemy chose: ${window.state.enemy.name})` : '';
  } else if (type === 'formation') {
    enemyText = window.state && window.state.enemyFormation && window.state.enemyFormation.name ? `(Enemy formation: ${window.state.enemyFormation.name})` : '';
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
  
  // Use the game logger if available, otherwise fall back to console
  const log = window.gameLogger ? window.gameLogger.addLog.bind(window.gameLogger) : console.log;
  log('INFO', ['Generating from prompt:', promptType, prompt]);
  
  let result;
  if (promptType === 'general') {
    result = window.generateGeneralFromPrompt(prompt);
    log('INFO', ['Generated general:', result]);
    if (window.state.player && window.state.player.troops && window.state.player.troops !== result.troops) {
      log('WARN', ['Attempted to overwrite player troop type during general generation. Old:', window.state.player.troops, 'New:', result.troops]);
    }
    window.state.player = result;
    window.state.playerHP = result.hp;
    // Generate enemy if not already generated
    if (!window.state.enemy) {
      const enemyGeneral = GENERALS[Math.floor(Math.random() * GENERALS.length)];
      window.state.enemy = enemyGeneral;
      log('INFO', ['Generated enemy:', enemyGeneral]);
    }
    window.state.enemyHP = window.state.enemy.hp;
    window.state.player.prompt = prompt;
    window.showTroopPreviewCombined(result, prompt);
  } else {
    // Only update the formation, not the player troop type or color
    result = window.generateFormationFromPrompt(prompt);
    log('INFO', ['Generated formation:', result]);
    // Safeguard: do not overwrite player troop type or color
    if (window.state.player && result.troops && window.state.player.troops !== result.troops) {
      log('WARN', ['Attempted to overwrite player troop type during formation generation. Ignored. Old:', window.state.player.troops, 'Attempted:', result.troops]);
      // Remove any accidental troop type from result
      delete result.troops;
    }
    window.state.playerFormation = result;
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
    window.state.playerFormation = window.currentFormation;
  }

  // Generate enemy if not already generated
  if (!window.state.enemy) {
    const enemyGeneral = GENERALS[Math.floor(Math.random() * GENERALS.length)];
    window.state.enemy = enemyGeneral;
    console.log('Generated enemy general:', enemyGeneral);
  }

  // Generate enemy formation if not already generated
  if (!window.state.enemyFormation) {
    const enemyFormation = FORMATIONS[Math.floor(Math.random() * FORMATIONS.length)];
    window.state.enemyFormation = enemyFormation;
    console.log('Generated enemy formation:', enemyFormation);
  }

  // Start the battle after a short delay
  setTimeout(() => {
    if (window.startBattle) {
      window.startBattle();
    }
  }, 800);
};

// --- Formation Selection Functions ---
window.selectFormationFromPreview = function() {
  const formation = window.currentFormation;
  if (formation) {
    // Call the main game's formation selection function
    if (window.selectFormation) {
      window.selectFormation(formation);
    }
  }
};

export function hideFormationPreview() {
  const promptContainer = document.getElementById('promptContainer');
  promptContainer.style.display = 'none';
} 