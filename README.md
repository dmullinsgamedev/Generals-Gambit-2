# General's Gambit 2

A 3D battle game where you describe your troops and formations using natural language prompts.

## Project Structure

The project has been refactored into a modular architecture for better maintainability:

```
src/
├── core/                    # Core game systems
│   ├── GameState.js        # Centralized game state management
│   └── Logger.js           # Logging system
├── data/                   # Game data and constants
│   └── GameData.js         # Generals, formations, troop types
├── game/                   # Game logic
│   ├── BattleSystem.js     # Battle mechanics and AI
│   └── TroopManager.js     # Troop creation and management
├── generation/             # 3D mesh generation
│   └── TroopGenerator.js   # Troop and general mesh generation
├── rendering/              # Three.js rendering
│   └── Renderer.js         # Scene, camera, and rendering setup
├── ui/                     # User interface
│   └── uiComponents.js     # UI components and prompt handling
└── main.js                 # Main game entry point
```

## Key Improvements

### 1. **Modular Architecture**
- **Separation of Concerns**: Each module has a single responsibility
- **Maintainability**: Easier to find and modify specific functionality
- **Testability**: Individual modules can be tested in isolation
- **Scalability**: New features can be added without affecting existing code

### 2. **Centralized State Management**
- **GameState.js**: Single source of truth for all game state
- **Consistent API**: Getter/setter methods for state changes
- **Backward Compatibility**: Maintains global `window.state` for existing code

### 3. **Dedicated Systems**
- **BattleSystem.js**: Handles all battle logic, AI, and combat mechanics
- **TroopManager.js**: Manages troop creation, positioning, and lifecycle
- **Renderer.js**: Handles all Three.js setup and rendering
- **Logger.js**: Centralized logging with assistant integration

### 4. **Simplified File Sizes**
- **main.js**: Reduced from 1,866 lines to ~300 lines
- **troopGenerator.js**: Simplified from 1,527 lines to ~400 lines
- **uiComponents.js**: Streamlined from 284 lines to ~200 lines

## How to Use

1. **Start the server**: Run `start-server.bat` or use any local server
2. **Open the game**: Navigate to `index.html` in your browser
3. **Describe your troops**: Enter prompts like "elite archer warriors" or "heavy melee knights"
4. **Choose formations**: Describe formations like "ancient phalanx" or "aggressive wedge"
5. **Watch the battle**: Your troops will fight against AI opponents

## Development

### Adding New Features

1. **New Troop Types**: Add to `src/data/GameData.js` in `TROOP_TYPES` and `TROOP_VARIANTS`
2. **New Formations**: Add to `src/data/GameData.js` in `FORMATIONS`
3. **New Battle Mechanics**: Modify `src/game/BattleSystem.js`
4. **New UI Components**: Add to `src/ui/uiComponents.js`

### Debugging

- **Debug Panel**: Press `Ctrl+Shift+D` to toggle debug panel
- **Logs**: Press `Ctrl+Shift+L` to view game logs
- **Console**: All game events are logged to console

## Technical Details

### State Management
```javascript
import { gameState } from './core/GameState.js';

// Get current state
const phase = gameState.currentPhase;
const player = gameState.player;

// Update state
gameState.setPhase('battle');
gameState.setPlayer(playerData);
```

### Battle System
```javascript
import { battleSystem } from './game/BattleSystem.js';

// Start/stop battles
battleSystem.startBattle();
battleSystem.stopBattle();
```

### Troop Management
```javascript
import { troopManager } from './game/TroopManager.js';

// Create and manage troops
troopManager.initializeTroops();
troopManager.positionTroopsInFormation(troops, formation, isPlayer);
```

## Benefits for AI Development

This refactored structure provides several advantages for AI-assisted development:

1. **Smaller Files**: Each file is under 500 lines, making them easier for AI tools to process
2. **Clear Dependencies**: Import/export statements make relationships explicit
3. **Focused Modules**: Each module has a single purpose, reducing complexity
4. **Consistent Patterns**: Similar functionality is organized consistently
5. **Backward Compatibility**: Existing global functions are preserved

## Future Enhancements

- **Save/Load System**: Persistent game state
- **More Troop Types**: Additional variants and body types
- **Advanced AI**: Smarter enemy formations and tactics
- **Multiplayer**: Real-time battles with other players
- **Custom Maps**: User-generated terrain and scenarios 