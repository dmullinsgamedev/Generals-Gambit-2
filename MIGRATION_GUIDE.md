# Migration Guide: Monolithic to Modular Architecture

This guide helps you understand the changes made during the refactoring from a monolithic structure to a modular architecture.

## What Changed

### Before (Monolithic)
```
├── main.js (1,866 lines)     # Everything in one file
├── gameData.js (206 lines)   # Game constants
├── troopGenerator.js (1,527 lines) # Complex mesh generation
├── uiComponents.js (284 lines) # UI components
├── style.css (416 lines)     # Styling
└── index.html (28 lines)     # HTML structure
```

### After (Modular)
```
src/
├── core/
│   ├── GameState.js         # Centralized state management
│   └── Logger.js            # Logging system
├── data/
│   └── GameData.js          # Game constants (moved)
├── game/
│   ├── BattleSystem.js      # Battle logic (extracted from main.js)
│   └── TroopManager.js      # Troop management (extracted from main.js)
├── generation/
│   └── TroopGenerator.js    # Simplified mesh generation
├── rendering/
│   └── Renderer.js          # Three.js setup (extracted from main.js)
├── ui/
│   └── uiComponents.js      # UI components (simplified)
└── main.js                  # Main entry point (simplified)
```

## Key Changes

### 1. State Management
**Before:**
```javascript
// Global state scattered throughout main.js
let state = { /* ... */ };
window.state = state;
```

**After:**
```javascript
// Centralized in GameState.js
import { gameState } from './core/GameState.js';
gameState.setPhase('battle');
gameState.setPlayer(playerData);
```

### 2. Battle Logic
**Before:**
```javascript
// Battle functions mixed in main.js
function battleLoop() { /* ... */ }
function updateTroops() { /* ... */ }
function attack() { /* ... */ }
```

**After:**
```javascript
// Organized in BattleSystem.js
import { battleSystem } from './game/BattleSystem.js';
battleSystem.startBattle();
battleSystem.stopBattle();
```

### 3. Troop Management
**Before:**
```javascript
// Troop functions scattered in main.js
function createTroop() { /* ... */ }
function positionTroopsInFormation() { /* ... */ }
function clearTroops() { /* ... */ }
```

**After:**
```javascript
// Organized in TroopManager.js
import { troopManager } from './game/TroopManager.js';
troopManager.initializeTroops();
troopManager.positionTroopsInFormation(troops, formation, isPlayer);
```

### 4. Rendering
**Before:**
```javascript
// Three.js setup mixed in main.js
function initializeThreeJS() { /* ... */ }
function animate() { /* ... */ }
```

**After:**
```javascript
// Organized in Renderer.js
import { gameRenderer } from './rendering/Renderer.js';
gameRenderer.initialize();
gameRenderer.onWindowResize();
```

## Backward Compatibility

The refactoring maintains backward compatibility:

### Global Functions
All existing global functions are preserved:
```javascript
// These still work exactly as before
window.showPromptInput('general');
window.generateGeneralFromPrompt(prompt);
window.selectFormation(formation);
```

### Global State
The global `window.state` is still available:
```javascript
// This still works
console.log(window.state.phase);
window.state.player = playerData;
```

### Event Handlers
All existing event handlers continue to work:
```javascript
// These still work
window.onBattleEnd = function(playerWon) { /* ... */ };
```

## Benefits of the New Structure

### 1. **Easier Maintenance**
- Each file has a single responsibility
- Changes are isolated to specific modules
- Easier to find and fix bugs

### 2. **Better for AI Tools**
- Smaller files (under 500 lines each)
- Clear dependencies through imports
- Focused functionality

### 3. **Improved Development**
- Parallel development possible
- Better testing capabilities
- Clearer code organization

### 4. **Enhanced Scalability**
- Easy to add new features
- Modular extensions
- Better code reuse

## Migration Checklist

If you're migrating from the old structure:

- [ ] Update import paths in your code
- [ ] Use the new module APIs where appropriate
- [ ] Test all existing functionality
- [ ] Update any custom extensions
- [ ] Verify backward compatibility

## Common Patterns

### Accessing Game State
```javascript
// New way (recommended)
import { gameState } from './core/GameState.js';
const phase = gameState.currentPhase;

// Old way (still works)
const phase = window.state.phase;
```

### Starting Battles
```javascript
// New way (recommended)
import { battleSystem } from './game/BattleSystem.js';
battleSystem.startBattle();

// Old way (still works)
window.startBattle();
```

### Managing Troops
```javascript
// New way (recommended)
import { troopManager } from './game/TroopManager.js';
troopManager.initializeTroops();

// Old way (still works)
// Functions are still available globally
```

## Troubleshooting

### Import Errors
If you see import errors, make sure:
1. You're using a local server (not file:// protocol)
2. All file paths are correct
3. Module syntax is supported in your browser

### Missing Functions
If a function seems missing:
1. Check if it's been moved to a different module
2. Verify it's still exported globally
3. Check the migration guide for the new location

### State Issues
If state isn't updating correctly:
1. Use the new `gameState` API
2. Check that you're using the correct setter methods
3. Verify the global `window.state` is still being updated

## Next Steps

1. **Familiarize yourself** with the new module structure
2. **Use the new APIs** where appropriate
3. **Test thoroughly** to ensure everything works
4. **Consider further improvements** based on your needs

The new structure is designed to be more maintainable and easier to work with, especially for AI-assisted development. 