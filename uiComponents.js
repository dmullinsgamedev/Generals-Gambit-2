// ============================================================================
// UI COMPONENTS AND SYSTEMS
// ============================================================================

import { generateCustomTroopMesh, determineTroopVariantFromPrompt } from './troopGenerator.js';
import { FORMATIONS, TROOP_TYPES, TROOP_VARIANTS } from './gameData.js';

// --- Global state for custom troops ---
let customTroopData = null;

// --- Troop Description UI System ---
export function showTroopDescriptionUI() {
  const promptContainer = document.getElementById('promptContainer');
  const cardRow = document.getElementById('cardRow');
  
  cardRow.innerHTML = '';
  promptContainer.style.display = 'block';
  
  promptContainer.innerHTML = `
    <div class="prompt-content">
      <div class="prompt-header">
        <h2>Describe Your Troops</h2>
        <button class="close-btn" onclick="hideTroopDescriptionUI()">×</button>
      </div>
      
      <div class="prompt-body">
        <textarea id="troopPrompt" placeholder="Describe your troops (e.g., 'Elite knights with heavy armor and broadswords')" rows="4"></textarea>
        
        <div class="prompt-buttons">
          <button class="random-btn" onclick="generateRandomTroopDescription()">Random</button>
          <button class="generate-btn" onclick="generateTroopsFromDescription()">Generate</button>
        </div>
      </div>
    </div>
  `;
  
  // Add some preset suggestions
  const suggestions = [
    'Elite knights with heavy armor',
    'Stealthy ninjas with daggers',
    'Powerful berserkers with axes',
    'Precision archers with longbows',
    'Mystical wizards with staffs'
  ];
  
  suggestions.forEach(suggestion => {
    const suggestionBtn = document.createElement('button');
    suggestionBtn.className = 'suggestion-btn';
    suggestionBtn.textContent = suggestion;
    suggestionBtn.onclick = () => {
      document.getElementById('troopPrompt').value = suggestion;
    };
    promptContainer.querySelector('.prompt-body').appendChild(suggestionBtn);
  });
}

export function hideTroopDescriptionUI() {
  const promptContainer = document.getElementById('promptContainer');
  promptContainer.style.display = 'none';
}

export function generateRandomTroopDescription() {
  const troopTypes = ['melee', 'ranged', 'magic'];
  const randomType = troopTypes[Math.floor(Math.random() * troopTypes.length)];
  const variants = TROOP_VARIANTS[randomType];
  const randomVariant = variants[Math.floor(Math.random() * variants.length)];
  
  const descriptions = [
    `${randomVariant.name}s with ${randomVariant.weapon}s`,
    `Elite ${randomVariant.name}s`,
    `Stealthy ${randomVariant.name}s`,
    `Heavy armored ${randomVariant.name}s`,
    `Fast ${randomVariant.name}s`
  ];
  
  const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];
  document.getElementById('troopPrompt').value = randomDescription;
}

export function generateTroopsFromDescription() {
  const prompt = document.getElementById('troopPrompt').value.trim();
  if (!prompt) {
    alert('Please enter a description of your troops');
    return;
  }
  
  // Generate custom troops based on description
  const customTroops = generateCustomTroopsFromPrompt(prompt);
  
  // Show preview
  showTroopPreview(customTroops, prompt);
}

function generateCustomTroopsFromPrompt(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  
  // Determine troop type
  let troopType = 'melee';
  if (lowerPrompt.includes('bow') || lowerPrompt.includes('arrow') || lowerPrompt.includes('gun') || lowerPrompt.includes('rifle')) {
    troopType = 'ranged';
  } else if (lowerPrompt.includes('magic') || lowerPrompt.includes('wizard') || lowerPrompt.includes('mage') || lowerPrompt.includes('spell')) {
    troopType = 'magic';
  }
  
  // Determine variant
  const variant = determineTroopVariantFromPrompt(prompt, troopType);
  
  // Generate stats based on description
  const baseStats = TROOP_TYPES[troopType];
  let stats = { ...baseStats };
  
  // Adjust stats based on keywords
  if (lowerPrompt.includes('elite') || lowerPrompt.includes('strong') || lowerPrompt.includes('powerful')) {
    stats.atk *= 1.2;
    stats.hp *= 1.3;
  }
  
  if (lowerPrompt.includes('heavy') || lowerPrompt.includes('armor')) {
    stats.hp *= 1.5;
    stats.rate *= 0.8;
  }
  
  if (lowerPrompt.includes('fast') || lowerPrompt.includes('quick') || lowerPrompt.includes('light')) {
    stats.rate *= 1.3;
    stats.hp *= 0.8;
  }
  
  if (lowerPrompt.includes('stealth') || lowerPrompt.includes('ninja')) {
    stats.rate *= 1.2;
    stats.range *= 1.1;
  }
  
  return {
    type: troopType,
    variant: variant,
    stats: stats,
    prompt: prompt
  };
}

function showTroopPreview(customTroops, prompt) {
  const promptContainer = document.getElementById('promptContainer');
  
  promptContainer.innerHTML = `
    <div class="prompt-content">
      <div class="prompt-header">
        <h2>Generated Troops</h2>
        <button class="close-btn" onclick="hideTroopDescriptionUI()">×</button>
      </div>
      
      <div class="prompt-body">
        <div class="troop-preview">
          <div class="troop-info">
            <h3>${customTroops.variant.name}</h3>
            <p><strong>Type:</strong> ${customTroops.type}</p>
            <p><strong>Weapon:</strong> ${customTroops.variant.weapon}</p>
            <p><strong>Special:</strong> ${customTroops.variant.special}</p>
            <p><strong>Stats:</strong> ATK: ${customTroops.stats.atk.toFixed(1)}, HP: ${customTroops.stats.hp.toFixed(1)}, Range: ${customTroops.stats.range.toFixed(1)}, Speed: ${customTroops.stats.rate.toFixed(1)}</p>
          </div>
          
          <div class="troop-3d-preview" id="troop3dPreview">
            <!-- 3D preview will be rendered here -->
          </div>
        </div>
        
        <div class="prompt-buttons">
          <button class="back-btn" onclick="showTroopDescriptionUI()">Back</button>
          <button class="confirm-btn" onclick="confirmTroopSelection()">Confirm</button>
        </div>
      </div>
    </div>
  `;
  
  // Store custom troop data for later use
  customTroopData = customTroops;
  
  // Render 3D preview
  renderTroop3DPreview(customTroops);
}

function renderTroop3DPreview(customTroops) {
  const previewContainer = document.getElementById('troop3dPreview');
  
  // Create a small Three.js scene for preview
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 200 / 200, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ alpha: true });
  
  renderer.setSize(200, 200);
  previewContainer.appendChild(renderer.domElement);
  
  // Lighting
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);
  
  // Create troop mesh
  const troopMesh = generateCustomTroopMesh(customTroops.prompt, true, 0x1da1f2);
  scene.add(troopMesh);
  
  camera.position.set(0, 2, 3);
  
  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    troopMesh.rotation.y += 0.01;
    renderer.render(scene, camera);
  }
  animate();
}

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
  renderFormation3DPreview(formation);
}

function renderFormation3DPreview(formation) {
  const previewContainer = document.getElementById('formation3dPreview');
  
  // Create a small Three.js scene for preview
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 300 / 200, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ alpha: true });
  
  renderer.setSize(300, 200);
  previewContainer.appendChild(renderer.domElement);
  
  // Lighting
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);
  
  // Create formation with troop meshes
  const troopCount = 20;
  const troops = [];
  
  for (let i = 0; i < troopCount; i++) {
    const troopMesh = generateCustomTroopMesh('Warrior', true, 0x1da1f2);
    troops.push(troopMesh);
    scene.add(troopMesh);
  }
  
  // Position troops in formation
  positionTroopsInFormationPreview(troops, formation);
  
  camera.position.set(0, 3, 5);
  camera.lookAt(0, 0, 0);
  
  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();
}

function positionTroopsInFormationPreview(troops, formation) {
  const formationName = formation.name.toLowerCase();
  
  if (formationName.includes('line') || formationName.includes('wall')) {
    // Line formation
    troops.forEach((troop, index) => {
      const x = (index - troops.length / 2) * 0.8;
      troop.position.set(x, 0, 0);
    });
  } else if (formationName.includes('wedge') || formationName.includes('spearhead')) {
    // Wedge formation
    troops.forEach((troop, index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;
      const x = (col - 1) * 0.6;
      const z = row * 0.6;
      troop.position.set(x, 0, z);
    });
  } else if (formationName.includes('circle') || formationName.includes('ring')) {
    // Circle formation
    troops.forEach((troop, index) => {
      const angle = (index / troops.length) * Math.PI * 2;
      const radius = 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      troop.position.set(x, 0, z);
    });
  } else {
    // Default formation (grid)
    troops.forEach((troop, index) => {
      const row = Math.floor(index / 5);
      const col = index % 5;
      const x = (col - 2) * 0.8;
      const z = (row - 1) * 0.8;
      troop.position.set(x, 0, z);
    });
  }
}

// --- Prompt UI Restoration ---

// Show the prompt input for troop or formation
export function showPromptInput(type) {
  const promptContainer = document.getElementById('promptContainer');
  const cardRow = document.getElementById('cardRow');
  cardRow.innerHTML = '';
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
    <input id="promptInput" class="prompt-input" placeholder="e.g.," autocomplete="off" />
    <div class="prompt-buttons" style="margin:1em 0;">
      <button class="menu-btn" onclick="generateRandom('${type}')">RANDOM</button>
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
      window.generateFromPrompt(type, true);
    }
  });
  document.getElementById('generateBtn').onclick = () => window.generateFromPrompt(type, true);
}

window.showPromptInput = showPromptInput;

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

window.generateFromPrompt = function(promptType, showPreviewOnly) {
  const prompt = document.getElementById('promptInput').value.trim();
  if (!prompt) {
    alert('Please enter a description!');
    return;
  }
  let result;
  if (promptType === 'general') {
    result = window.generateGeneralFromPrompt(prompt);
    window.state.player = result;
    window.state.playerHP = result.hp;
    window.state.enemyHP = window.state.enemy.hp;
    window.state.player.troops = result.troops;
    window.state.player.prompt = prompt;
    window.showTroopPreviewCombined(result, prompt);
  } else {
    result = window.generateFormationFromPrompt(prompt);
    window.state.playerFormation = result;
    window.showPreview(promptType, result, prompt);
  }
};

window.showTroopPreviewCombined = function(result, prompt) {
  const previewContainer = document.getElementById('previewContainer');
  const preview3D = document.getElementById('preview3D');
  const previewInfo = document.getElementById('previewInfo');
  previewContainer.style.display = 'block';
  previewInfo.innerHTML = `<button class="menu-btn" id="continueToFormationBtn" onclick="continueToFormation()">Continue to Formation</button>`;
  if (window.createTroopPreview) window.createTroopPreview(preview3D, result, prompt);
  setTimeout(() => {
    const btn = document.getElementById('continueToFormationBtn');
    if (btn) {
      btn.onclick = () => {
        btn.disabled = true;
        continueToFormation();
      };
    }
  }, 0);
};

window.continueToFormation = function() {
  if (window.enemyChooseFormation) window.enemyChooseFormation();
};

window.goBackToTroops = function() {
  window.showPromptInput('general');
};

window.startBattleFromPrompt = function() {
  setTimeout(window.startBattle, 800);
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

// --- Troop Confirmation Functions ---
window.confirmTroopSelection = function() {
  if (customTroopData) {
    // Create a custom general from the troop data
    const customGeneral = {
      name: customTroopData.variant.name,
      hp: customTroopData.stats.hp * 10, // Scale up for general
      troops: customTroopData.type,
      color: 0x1da1f2,
      special: customTroopData.variant.special,
      desc: `Custom ${customTroopData.type} general.`,
      customData: customTroopData
    };
    // Set as player general
    window.state = window.state || {};
    window.state.player = customGeneral;
    // Go directly to formation selection
    if (window.showFormationSelection) {
      window.showFormationSelection();
    }
  }
};

export function hideFormationPreview() {
  const promptContainer = document.getElementById('promptContainer');
  promptContainer.style.display = 'none';
} 