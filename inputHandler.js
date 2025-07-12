/**
 * Input Handler
 * Manages keyboard and mouse interactions in a centralized way
 */

class InputHandler {
    constructor() {
        this.keys = {};
        this.mouse = {
            x: 0,
            y: 0,
            left: false,
            right: false,
            middle: false
        };
        this.callbacks = {
            keydown: [],
            keyup: [],
            mousedown: [],
            mouseup: [],
            mousemove: [],
            wheel: []
        };
        this.isEnabled = true;
        
        this.setupEventListeners();
        
        // Use console.log as fallback if Logger is not available
        if (typeof Logger !== 'undefined') {
            Logger.log('InputHandler initialized');
        } else {
            console.log('InputHandler initialized');
        }
    }

    /**
     * Setup event listeners for keyboard and mouse
     */
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Mouse events
        document.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('wheel', (e) => this.handleWheel(e));
        
        // Prevent context menu on right click
        document.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    /**
     * Handle key down events
     */
    handleKeyDown(e) {
        if (!this.isEnabled) return;
        
        this.keys[e.code] = true;
        
        // Call registered callbacks
        this.callbacks.keydown.forEach(callback => {
            try {
                callback(e.code, e);
            } catch (error) {
                if (typeof Logger !== 'undefined') {
                    Logger.error('Error in keydown callback:', error);
                } else {
                    console.error('Error in keydown callback:', error);
                }
            }
        });
    }

    /**
     * Handle key up events
     */
    handleKeyUp(e) {
        if (!this.isEnabled) return;
        
        this.keys[e.code] = false;
        
        // Call registered callbacks
        this.callbacks.keyup.forEach(callback => {
            try {
                callback(e.code, e);
            } catch (error) {
                if (typeof Logger !== 'undefined') {
                    Logger.error('Error in keyup callback:', error);
                } else {
                    console.error('Error in keyup callback:', error);
                }
            }
        });
    }

    /**
     * Handle mouse down events
     */
    handleMouseDown(e) {
        if (!this.isEnabled) return;
        
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        
        if (e.button === 0) this.mouse.left = true;
        if (e.button === 1) this.mouse.middle = true;
        if (e.button === 2) this.mouse.right = true;
        
        // Call registered callbacks
        this.callbacks.mousedown.forEach(callback => {
            try {
                callback(e.button, e);
            } catch (error) {
                if (typeof Logger !== 'undefined') {
                    Logger.error('Error in mousedown callback:', error);
                } else {
                    console.error('Error in mousedown callback:', error);
                }
            }
        });
    }

    /**
     * Handle mouse up events
     */
    handleMouseUp(e) {
        if (!this.isEnabled) return;
        
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        
        if (e.button === 0) this.mouse.left = false;
        if (e.button === 1) this.mouse.middle = false;
        if (e.button === 2) this.mouse.right = false;
        
        // Call registered callbacks
        this.callbacks.mouseup.forEach(callback => {
            try {
                callback(e.button, e);
            } catch (error) {
                if (typeof Logger !== 'undefined') {
                    Logger.error('Error in mouseup callback:', error);
                } else {
                    console.error('Error in mouseup callback:', error);
                }
            }
        });
    }

    /**
     * Handle mouse move events
     */
    handleMouseMove(e) {
        if (!this.isEnabled) return;
        
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        
        // Call registered callbacks
        this.callbacks.mousemove.forEach(callback => {
            try {
                callback(e.movementX, e.movementY, e);
            } catch (error) {
                if (typeof Logger !== 'undefined') {
                    Logger.error('Error in mousemove callback:', error);
                } else {
                    console.error('Error in mousemove callback:', error);
                }
            }
        });
    }

    /**
     * Handle mouse wheel events
     */
    handleWheel(e) {
        if (!this.isEnabled) return;
        
        // Call registered callbacks
        this.callbacks.wheel.forEach(callback => {
            try {
                callback(e.deltaY, e);
            } catch (error) {
                if (typeof Logger !== 'undefined') {
                    Logger.error('Error in wheel callback:', error);
                } else {
                    console.error('Error in wheel callback:', error);
                }
            }
        });
    }

    /**
     * Check if a key is currently pressed
     */
    isKeyPressed(keyCode) {
        return this.keys[keyCode] || false;
    }

    /**
     * Check if any key is pressed
     */
    isAnyKeyPressed() {
        return Object.values(this.keys).some(pressed => pressed);
    }

    /**
     * Get mouse position
     */
    getMousePosition() {
        return { x: this.mouse.x, y: this.mouse.y };
    }

    /**
     * Check if mouse button is pressed
     */
    isMousePressed(button = 0) {
        if (button === 0) return this.mouse.left;
        if (button === 1) return this.mouse.middle;
        if (button === 2) return this.mouse.right;
        return false;
    }

    /**
     * Add a keydown callback
     */
    onKeyDown(callback) {
        this.callbacks.keydown.push(callback);
        if (typeof Logger !== 'undefined') {
            Logger.log('Keydown callback added');
        } else {
            console.log('Keydown callback added');
        }
    }

    /**
     * Add a keyup callback
     */
    onKeyUp(callback) {
        this.callbacks.keyup.push(callback);
        if (typeof Logger !== 'undefined') {
            Logger.log('Keyup callback added');
        } else {
            console.log('Keyup callback added');
        }
    }

    /**
     * Add a mousedown callback
     */
    onMouseDown(callback) {
        this.callbacks.mousedown.push(callback);
        if (typeof Logger !== 'undefined') {
            Logger.log('Mousedown callback added');
        } else {
            console.log('Mousedown callback added');
        }
    }

    /**
     * Add a mouseup callback
     */
    onMouseUp(callback) {
        this.callbacks.mouseup.push(callback);
        if (typeof Logger !== 'undefined') {
            Logger.log('Mouseup callback added');
        } else {
            console.log('Mouseup callback added');
        }
    }

    /**
     * Add a mousemove callback
     */
    onMouseMove(callback) {
        this.callbacks.mousemove.push(callback);
        if (typeof Logger !== 'undefined') {
            Logger.log('Mousemove callback added');
        } else {
            console.log('Mousemove callback added');
        }
    }

    /**
     * Add a wheel callback
     */
    onWheel(callback) {
        this.callbacks.wheel.push(callback);
        if (typeof Logger !== 'undefined') {
            Logger.log('Wheel callback added');
        } else {
            console.log('Wheel callback added');
        }
    }

    /**
     * Remove a callback
     */
    removeCallback(type, callback) {
        if (this.callbacks[type]) {
            const index = this.callbacks[type].indexOf(callback);
            if (index > -1) {
                this.callbacks[type].splice(index, 1);
                if (typeof Logger !== 'undefined') {
                    Logger.log(`${type} callback removed`);
                } else {
                    console.log(`${type} callback removed`);
                }
            }
        }
    }

    /**
     * Enable/disable input handling
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        if (typeof Logger !== 'undefined') {
            Logger.log(`Input handler ${enabled ? 'enabled' : 'disabled'}`);
        } else {
            console.log(`Input handler ${enabled ? 'enabled' : 'disabled'}`);
        }
    }

    /**
     * Clear all pressed keys
     */
    clearKeys() {
        this.keys = {};
        if (typeof Logger !== 'undefined') {
            Logger.log('All keys cleared');
        } else {
            console.log('All keys cleared');
        }
    }

    /**
     * Get current input state
     */
    getInputState() {
        return {
            keys: { ...this.keys },
            mouse: { ...this.mouse },
            isEnabled: this.isEnabled
        };
    }
}

// Create global instance
window.inputHandler = new InputHandler(); 