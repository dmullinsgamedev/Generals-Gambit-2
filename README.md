# General's Gambit - Refactored Code Structure

This project has been refactored from a single monolithic HTML file into a modular structure for better maintainability.

## File Structure

```
├── index.html          # Clean HTML structure with external dependencies
├── style.css           # All CSS styles
├── main.js             # Main game logic and functionality
├── gameData.js         # Game constants and data (generals, formations, troops)
└── README.md           # This documentation
```

## Code Organization

### `index.html`
- Clean HTML structure
- External CSS and JavaScript references
- No embedded styles or scripts
- Easy to modify structure without touching logic

### `style.css`
- All visual styling
- Responsive design rules
- UI component styles
- Easy to modify appearance without touching functionality

### `main.js`
- Core game logic
- Three.js setup and rendering
- Game state management
- UI interactions
- Battle mechanics
- Modular functions for easy maintenance

### `gameData.js`
- Game constants and data
- General definitions
- Formation configurations
- Troop type specifications
- Troop variant definitions
- Easy to modify game balance and content

## Key Improvements

1. **Separation of Concerns**: HTML, CSS, and JavaScript are now in separate files
2. **Modular Structure**: Game data is separated from game logic
3. **Maintainability**: Each file has a specific purpose and can be modified independently
4. **Readability**: Code is organized into logical sections with clear comments
5. **Scalability**: Easy to add new features or modify existing ones

## How to Make Changes

### Adding New Generals
Edit `gameData.js` and add to the `GENERALS` array:
```javascript
{
  name: 'New General',
  hp: 100,
  troops: 'melee',
  color: 0xff0000,
  special: 'Special Ability',
  desc: 'Description'
}
```

### Adding New Formations
Edit `gameData.js` and add to the `FORMATIONS` array:
```javascript
{
  name: 'New Formation',
  bonus: {atk: 1.0, def: 1.0, speed: 1.0},
  desc: 'Formation description'
}
```

### Modifying UI Styles
Edit `style.css` to change appearance:
```css
.card {
  /* Modify card appearance */
}
```

### Adding Game Features
Edit `main.js` and add new functions in the appropriate section:
- UI Management: Add to UI section
- Game Logic: Add to Game Logic section
- Three.js: Add to Three.js section

## Benefits of This Structure

1. **Easier Debugging**: Issues can be isolated to specific files
2. **Team Development**: Multiple developers can work on different files simultaneously
3. **Version Control**: Smaller, focused changes are easier to track
4. **Testing**: Individual components can be tested separately
5. **Performance**: Files can be cached separately by browsers

## Future Enhancements

Consider further modularization:
- `ui.js` - UI management functions
- `battle.js` - Battle mechanics
- `threeRenderer.js` - Three.js rendering logic
- `formations.js` - Formation positioning algorithms
- `troops.js` - Troop creation and management

This structure makes the codebase much more maintainable and easier to extend with new features. 