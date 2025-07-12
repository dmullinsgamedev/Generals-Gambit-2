// Renderer Module - Handles all game rendering
class Renderer {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.initialized = false;
    }

    initialize() {
        if (this.initialized) return;
        
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.warn('Canvas not found, will initialize later');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.initialized = true;
        console.log('Renderer initialized');
    }

    // Clear the canvas
    clear() {
        this.initialize();
        if (!this.initialized) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Draw a rectangle
    drawRect(x, y, width, height, color) {
        this.initialize();
        if (!this.initialized) return;
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
    }

    // Draw text
    drawText(text, x, y, color = 'white', fontSize = '16px') {
        this.initialize();
        if (!this.initialized) return;
        this.ctx.fillStyle = color;
        this.ctx.font = fontSize;
        this.ctx.fillText(text, x, y);
    }

    // Draw circle
    drawCircle(x, y, radius, color) {
        this.initialize();
        if (!this.initialized) return;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = color;
        this.ctx.fill();
    }

    // Draw troop
    drawTroop(troop) {
        this.initialize();
        if (!this.initialized) return;
        
        const x = troop.x;
        const y = troop.y;
        const size = troop.size || 10;
        const color = troop.color || 'blue';
        
        this.drawCircle(x, y, size, color);
        
        // Draw troop info
        if (troop.name) {
            this.drawText(troop.name, x, y - size - 5, 'white', '12px');
        }
        if (troop.health !== undefined) {
            this.drawText(`HP: ${troop.health}`, x, y + size + 15, 'white', '10px');
        }
    }

    // Draw all game elements
    render(gameState) {
        this.initialize();
        if (!this.initialized) return;
        
        this.clear();
        
        // Draw background
        this.drawRect(0, 0, this.canvas.width, this.canvas.height, '#2c3e50');
        
        // Draw troops
        if (gameState.troops) {
            gameState.troops.forEach(troop => {
                this.drawTroop(troop);
            });
        }
        
        // Draw UI elements
        this.drawUI(gameState);
    }

    // Draw UI elements
    drawUI(gameState) {
        this.initialize();
        if (!this.initialized) return;
        
        // Draw score or other UI info
        if (gameState.score !== undefined) {
            this.drawText(`Score: ${gameState.score}`, 10, 30, 'white', '18px');
        }
        
        // Draw turn info
        if (gameState.currentTurn !== undefined) {
            this.drawText(`Turn: ${gameState.currentTurn}`, 10, 50, 'white', '16px');
        }
    }
}

// Create global renderer instance
window.gameRenderer = new Renderer();

// Test the renderer
console.log('Renderer module loaded');
console.log('Testing renderer functionality...');
console.log('Canvas:', window.gameRenderer.canvas);
console.log('Context:', window.gameRenderer.ctx);
console.log('Initialized:', window.gameRenderer.initialized); 