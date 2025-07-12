/**
 * Audio Manager
 * Handles sound effects and music in a centralized way
 */

class AudioManager {
    constructor() {
        this.sounds = {};
        this.music = {};
        this.currentMusic = null;
        this.masterVolume = 1.0;
        this.sfxVolume = 0.7;
        this.musicVolume = 0.5;
        this.isEnabled = true;
        this.audioContext = null;
        
        this.initAudioContext();
        this.loadDefaultSounds();
        
        // Use console.log as fallback if Logger is not available
        if (typeof Logger !== 'undefined') {
            Logger.log('AudioManager initialized');
        } else {
            console.log('AudioManager initialized');
        }
    }

    /**
     * Initialize Web Audio API context
     */
    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            if (typeof Logger !== 'undefined') {
                Logger.log('Audio context initialized');
            } else {
                console.log('Audio context initialized');
            }
        } catch (error) {
            if (typeof Logger !== 'undefined') {
                Logger.warn('Web Audio API not supported:', error);
            } else {
                console.warn('Web Audio API not supported:', error);
            }
        }
    }

    /**
     * Load default sounds using Web Audio API
     */
    loadDefaultSounds() {
        if (!this.audioContext) return;

        // Battle sounds
        this.createSound('sword_clash', this.generateSwordClash());
        this.createSound('arrow_shot', this.generateArrowShot());
        this.createSound('magic_cast', this.generateMagicCast());
        this.createSound('explosion', this.generateExplosion());
        this.createSound('victory', this.generateVictory());
        this.createSound('defeat', this.generateDefeat());
        
        // UI sounds
        this.createSound('button_click', this.generateButtonClick());
        this.createSound('formation_select', this.generateFormationSelect());
        this.createSound('general_select', this.generateGeneralSelect());
        
        if (typeof Logger !== 'undefined') {
            Logger.log('Default sounds loaded');
        } else {
            console.log('Default sounds loaded');
        }
    }

    /**
     * Create a sound from audio buffer
     */
    createSound(name, audioBuffer) {
        if (!this.audioContext || !audioBuffer) return;
        
        this.sounds[name] = {
            buffer: audioBuffer,
            volume: 1.0,
            pitch: 1.0
        };
        
        if (typeof Logger !== 'undefined') {
            Logger.log(`Sound created: ${name}`);
        } else {
            console.log(`Sound created: ${name}`);
        }
    }

    /**
     * Play a sound effect
     */
    playSound(name, options = {}) {
        if (!this.isEnabled || !this.audioContext || !this.sounds[name]) {
            return null;
        }

        try {
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = this.sounds[name].buffer;
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Apply volume
            const volume = (options.volume || this.sounds[name].volume) * this.sfxVolume * this.masterVolume;
            gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
            
            // Apply pitch
            const pitch = options.pitch || this.sounds[name].pitch;
            source.playbackRate.setValueAtTime(pitch, this.audioContext.currentTime);
            
            source.start();
            
            if (typeof Logger !== 'undefined') {
                Logger.log(`Playing sound: ${name}`);
            } else {
                console.log(`Playing sound: ${name}`);
            }
            
            return source;
        } catch (error) {
            if (typeof Logger !== 'undefined') {
                Logger.error('Error playing sound:', error);
            } else {
                console.error('Error playing sound:', error);
            }
            return null;
        }
    }

    /**
     * Play music (looping)
     */
    playMusic(name, options = {}) {
        if (!this.isEnabled || !this.audioContext || !this.music[name]) {
            return null;
        }

        try {
            // Stop current music
            this.stopMusic();
            
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = this.music[name].buffer;
            source.loop = true;
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Apply volume with fade in
            const volume = (options.volume || this.music[name].volume) * this.musicVolume * this.masterVolume;
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 1);
            
            source.start();
            this.currentMusic = { source, gainNode, name };
            
            if (typeof Logger !== 'undefined') {
                Logger.log(`Playing music: ${name}`);
            } else {
                console.log(`Playing music: ${name}`);
            }
            
            return source;
        } catch (error) {
            if (typeof Logger !== 'undefined') {
                Logger.error('Error playing music:', error);
            } else {
                console.error('Error playing music:', error);
            }
            return null;
        }
    }

    /**
     * Stop current music
     */
    stopMusic() {
        if (this.currentMusic) {
            try {
                // Fade out
                this.currentMusic.gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 1);
                setTimeout(() => {
                    if (this.currentMusic && this.currentMusic.source) {
                        this.currentMusic.source.stop();
                    }
                }, 1000);
                
                if (typeof Logger !== 'undefined') {
                    Logger.log(`Stopping music: ${this.currentMusic.name}`);
                } else {
                    console.log(`Stopping music: ${this.currentMusic.name}`);
                }
                
                this.currentMusic = null;
            } catch (error) {
                if (typeof Logger !== 'undefined') {
                    Logger.error('Error stopping music:', error);
                } else {
                    console.error('Error stopping music:', error);
                }
            }
        }
    }

    /**
     * Set master volume
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (typeof Logger !== 'undefined') {
            Logger.log(`Master volume set to: ${this.masterVolume}`);
        } else {
            console.log(`Master volume set to: ${this.masterVolume}`);
        }
    }

    /**
     * Set SFX volume
     */
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        if (typeof Logger !== 'undefined') {
            Logger.log(`SFX volume set to: ${this.sfxVolume}`);
        } else {
            console.log(`SFX volume set to: ${this.sfxVolume}`);
        }
    }

    /**
     * Set music volume
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.currentMusic) {
            const targetVolume = this.musicVolume * this.masterVolume;
            this.currentMusic.gainNode.gain.linearRampToValueAtTime(targetVolume, this.audioContext.currentTime + 0.5);
        }
        if (typeof Logger !== 'undefined') {
            Logger.log(`Music volume set to: ${this.musicVolume}`);
        } else {
            console.log(`Music volume set to: ${this.musicVolume}`);
        }
    }

    /**
     * Enable/disable audio
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        if (!enabled) {
            this.stopMusic();
        }
        if (typeof Logger !== 'undefined') {
            Logger.log(`Audio ${enabled ? 'enabled' : 'disabled'}`);
        } else {
            console.log(`Audio ${enabled ? 'enabled' : 'disabled'}`);
        }
    }

    /**
     * Get audio state
     */
    getAudioState() {
        return {
            isEnabled: this.isEnabled,
            masterVolume: this.masterVolume,
            sfxVolume: this.sfxVolume,
            musicVolume: this.musicVolume,
            currentMusic: this.currentMusic?.name || null,
            soundsLoaded: Object.keys(this.sounds).length,
            musicLoaded: Object.keys(this.music).length
        };
    }

    // ============================================================================
    // SOUND GENERATION FUNCTIONS
    // ============================================================================

    /**
     * Generate sword clash sound
     */
    generateSwordClash() {
        if (!this.audioContext) return null;
        
        const sampleRate = this.audioContext.sampleRate;
        const duration = 0.3;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            const frequency = 200 + Math.random() * 100;
            data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 10) * 0.3;
        }
        
        return buffer;
    }

    /**
     * Generate arrow shot sound
     */
    generateArrowShot() {
        if (!this.audioContext) return null;
        
        const sampleRate = this.audioContext.sampleRate;
        const duration = 0.2;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            const frequency = 800 + Math.random() * 200;
            data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 15) * 0.2;
        }
        
        return buffer;
    }

    /**
     * Generate magic cast sound
     */
    generateMagicCast() {
        if (!this.audioContext) return null;
        
        const sampleRate = this.audioContext.sampleRate;
        const duration = 0.5;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            const frequency = 300 + Math.sin(t * 10) * 100;
            data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 5) * 0.4;
        }
        
        return buffer;
    }

    /**
     * Generate explosion sound
     */
    generateExplosion() {
        if (!this.audioContext) return null;
        
        const sampleRate = this.audioContext.sampleRate;
        const duration = 0.8;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            const frequency = 50 + Math.random() * 100;
            data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 8) * 0.5;
        }
        
        return buffer;
    }

    /**
     * Generate victory sound
     */
    generateVictory() {
        if (!this.audioContext) return null;
        
        const sampleRate = this.audioContext.sampleRate;
        const duration = 1.0;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            const frequency = 400 + Math.sin(t * 5) * 200;
            data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 3) * 0.3;
        }
        
        return buffer;
    }

    /**
     * Generate defeat sound
     */
    generateDefeat() {
        if (!this.audioContext) return null;
        
        const sampleRate = this.audioContext.sampleRate;
        const duration = 0.6;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            const frequency = 150 - t * 100;
            data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 6) * 0.4;
        }
        
        return buffer;
    }

    /**
     * Generate button click sound
     */
    generateButtonClick() {
        if (!this.audioContext) return null;
        
        const sampleRate = this.audioContext.sampleRate;
        const duration = 0.1;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            const frequency = 1000 + Math.random() * 500;
            data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 20) * 0.2;
        }
        
        return buffer;
    }

    /**
     * Generate formation select sound
     */
    generateFormationSelect() {
        if (!this.audioContext) return null;
        
        const sampleRate = this.audioContext.sampleRate;
        const duration = 0.2;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            const frequency = 600 + Math.sin(t * 8) * 100;
            data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 12) * 0.25;
        }
        
        return buffer;
    }

    /**
     * Generate general select sound
     */
    generateGeneralSelect() {
        if (!this.audioContext) return null;
        
        const sampleRate = this.audioContext.sampleRate;
        const duration = 0.3;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            const frequency = 300 + Math.sin(t * 6) * 150;
            data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 8) * 0.3;
        }
        
        return buffer;
    }
}

// Create global instance
window.audioManager = new AudioManager(); 