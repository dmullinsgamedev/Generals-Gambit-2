/**
 * Game Loop Manager
 * Handles the main game loop, timing, and frame management
 */

class GameLoopManager {
    constructor() {
        this.isRunning = false;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.fps = 60;
        this.frameInterval = 1000 / this.fps;
        this.accumulator = 0;
        this.updateCallbacks = [];
        this.renderCallbacks = [];
        
        // Use console.log as fallback if Logger is not available
        if (typeof Logger !== 'undefined') {
            Logger.log('GameLoopManager initialized');
        } else {
            console.log('GameLoopManager initialized');
        }
    }

    /**
     * Start the game loop
     */
    start() {
        if (this.isRunning) {
            if (typeof Logger !== 'undefined') {
                Logger.warn('Game loop is already running');
            } else {
                console.warn('Game loop is already running');
            }
            return;
        }
        
        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop();
        if (typeof Logger !== 'undefined') {
            Logger.log('Game loop started');
        } else {
            console.log('Game loop started');
        }
    }

    /**
     * Stop the game loop
     */
    stop() {
        this.isRunning = false;
        if (typeof Logger !== 'undefined') {
            Logger.log('Game loop stopped');
        } else {
            console.log('Game loop stopped');
        }
    }

    /**
     * Main game loop using fixed timestep
     */
    gameLoop(currentTime = performance.now()) {
        if (!this.isRunning) return;

        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        this.accumulator += this.deltaTime;

        // Fixed timestep updates
        while (this.accumulator >= this.frameInterval) {
            this.update(this.frameInterval / 1000);
            this.accumulator -= this.frameInterval;
        }

        // Render at variable rate
        this.render();

        requestAnimationFrame((time) => this.gameLoop(time));
    }

    /**
     * Update game state
     */
    update(deltaTime) {
        this.updateCallbacks.forEach(callback => {
            try {
                callback(deltaTime);
            } catch (error) {
                if (typeof Logger !== 'undefined') {
                    Logger.error('Error in update callback:', error);
                } else {
                    console.error('Error in update callback:', error);
                }
            }
        });
    }

    /**
     * Render the game
     */
    render() {
        this.renderCallbacks.forEach(callback => {
            try {
                callback();
            } catch (error) {
                if (typeof Logger !== 'undefined') {
                    Logger.error('Error in render callback:', error);
                } else {
                    console.error('Error in render callback:', error);
                }
            }
        });
    }

    /**
     * Add an update callback
     */
    addUpdateCallback(callback) {
        this.updateCallbacks.push(callback);
        if (typeof Logger !== 'undefined') {
            Logger.log('Update callback added');
        } else {
            console.log('Update callback added');
        }
    }

    /**
     * Add a render callback
     */
    addRenderCallback(callback) {
        this.renderCallbacks.push(callback);
        if (typeof Logger !== 'undefined') {
            Logger.log('Render callback added');
        } else {
            console.log('Render callback added');
        }
    }

    /**
     * Remove an update callback
     */
    removeUpdateCallback(callback) {
        const index = this.updateCallbacks.indexOf(callback);
        if (index > -1) {
            this.updateCallbacks.splice(index, 1);
            if (typeof Logger !== 'undefined') {
                Logger.log('Update callback removed');
            } else {
                console.log('Update callback removed');
            }
        }
    }

    /**
     * Remove a render callback
     */
    removeRenderCallback(callback) {
        const index = this.renderCallbacks.indexOf(callback);
        if (index > -1) {
            this.renderCallbacks.splice(index, 1);
            if (typeof Logger !== 'undefined') {
                Logger.log('Render callback removed');
            } else {
                console.log('Render callback removed');
            }
        }
    }

    /**
     * Set target FPS
     */
    setFPS(fps) {
        this.fps = Math.max(1, Math.min(120, fps));
        this.frameInterval = 1000 / this.fps;
        if (typeof Logger !== 'undefined') {
            Logger.log(`FPS set to ${this.fps}`);
        } else {
            console.log(`FPS set to ${this.fps}`);
        }
    }

    /**
     * Get current FPS
     */
    getFPS() {
        return this.fps;
    }

    /**
     * Get delta time in seconds
     */
    getDeltaTime() {
        return this.deltaTime / 1000;
    }

    /**
     * Check if game loop is running
     */
    isGameRunning() {
        return this.isRunning;
    }
}

// Create global instance
window.gameLoopManager = new GameLoopManager(); 