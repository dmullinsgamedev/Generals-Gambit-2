/**
 * Configuration Manager
 * Centralizes all game settings, constants, and user preferences
 */

import { simpleLogger } from './logger.js';

class ConfigManager {
  constructor() {
    this.isInitialized = false;
    this.config = {};
    this.defaults = {};
    this.userSettings = {};
    this.storageKey = 'generals_gambit_config';
    
    // Define all configuration categories
    this.categories = {
      GAME: 'game',
      AUDIO: 'audio', 
      GRAPHICS: 'graphics',
      BATTLE: 'battle',
      TROOPS: 'troops',
      TERRAIN: 'terrain',
      UI: 'ui',
      DEBUG: 'debug'
    };
    
    this.initialize();
  }

  initialize() {
    simpleLogger.addLog('INFO', ['Initializing Configuration Manager']);
    
    this.setupDefaults();
    this.loadUserSettings();
    this.mergeConfigurations();
    
    this.isInitialized = true;
    simpleLogger.addLog('INFO', ['Configuration Manager initialized']);
  }

  setupDefaults() {
    // Game Settings
    this.defaults[this.categories.GAME] = {
      // Core game settings
      maxRounds: 10,
      roundTimeLimit: 300, // seconds
      autoSaveInterval: 30, // seconds
      enableAutoSave: true,
      enableTutorial: true,
      difficulty: 'normal', // easy, normal, hard
      
      // Game flow
      enableFormationSelection: true,
      enableEnemyGeneration: true,
      enableBattleReplay: false,
      
      // Performance
      targetFPS: 60,
      enableVSync: true,
      enableAntialiasing: true,
      
      // Debug
      enableDebugMode: false,
      enablePerformanceMonitoring: false,
      enableDetailedLogging: false
    };

    // Audio Settings
    this.defaults[this.categories.AUDIO] = {
      // Master controls
      masterVolume: 1.0,
      enableAudio: true,
      
      // Volume levels
      sfxVolume: 0.8,
      musicVolume: 0.6,
      voiceVolume: 0.7,
      
      // Audio features
      enable3DAudio: true,
      enableAudioEffects: true,
      enableMusic: true,
      
      // Sound categories
      battleSounds: true,
      uiSounds: true,
      ambientSounds: true,
      
      // Audio quality
      audioSampleRate: 44100,
      audioBufferSize: 2048
    };

    // Graphics Settings
    this.defaults[this.categories.GRAPHICS] = {
      // Rendering
      renderQuality: 'high', // low, medium, high, ultra
      shadowQuality: 'medium',
      textureQuality: 'high',
      
      // Lighting
      enableShadows: true,
      enableDynamicLighting: true,
      enableBloom: false,
      enableFog: true,
      
      // Camera
      cameraFOV: 75,
      cameraNear: 0.1,
      cameraFar: 1000,
      enableCameraSmoothing: true,
      cameraSensitivity: 1.0,
      
      // Effects
      enableParticles: true,
      enablePostProcessing: true,
      enableMotionBlur: false,
      
      // Performance
      maxParticles: 1000,
      maxLights: 8,
      enableLOD: true
    };

    // Battle Settings
    this.defaults[this.categories.BATTLE] = {
      // Battle mechanics
      battleSpeed: 1.0,
      enableRealTimeCombat: true,
      enableFormationBonuses: true,
      enableTerrainEffects: true,
      
      // Combat settings
      attackRange: 2.0,
      attackSpeed: 1.0,
      damageMultiplier: 1.0,
      healthMultiplier: 1.0,
      
      // AI behavior
      aiAggressiveness: 0.7,
      aiIntelligence: 0.8,
      aiReactionTime: 0.5,
      
      // Battle effects
      enableBloodEffects: false,
      enableImpactEffects: true,
      enableDeathAnimations: true,
      
      // Victory conditions
      victoryCondition: 'elimination', // elimination, capture, time
      timeLimit: 300, // seconds
      capturePoints: 3
    };

    // Troop Settings
    this.defaults[this.categories.TROOPS] = {
      // Troop counts
      playerTroopCount: 20,
      enemyTroopCount: 20,
      maxTroopsPerSide: 50,
      
      // Troop positioning
      troopSpacing: 0.8,
      formationSpacing: 1.2,
      generalOffset: 1.2,
      
      // Troop appearance
      enableTroopVariation: true,
      enableColorVariation: true,
      enableSizeVariation: true,
      
      // Troop types
      defaultTroopType: 'melee',
      enableRangedTroops: true,
      enableMountedTroops: true,
      enableMagicTroops: true,
      
      // Troop stats
      baseHealth: 100,
      baseAttack: 10,
      baseSpeed: 0.02,
      baseRange: 2.0,
      
      // General settings
      generalHealth: 150,
      generalAttack: 15,
      generalRange: 3.0,
      enableGeneralAbilities: true
    };

    // Terrain Settings
    this.defaults[this.categories.TERRAIN] = {
      // Terrain generation
      terrainSize: 50,
      terrainSegments: 20,
      terrainHeightVariation: 0.5,
      
      // Terrain features
      enableTrees: true,
      enableRocks: true,
      enableWater: false,
      enableElevation: true,
      
      // Terrain counts
      treeCount: 30,
      rockCount: 20,
      decorationCount: 50,
      
      // Terrain materials
      groundColor: 0x90EE90,
      treeColor: 0x228B22,
      rockColor: 0x696969,
      
      // Terrain effects
      enableTerrainCollision: true,
      enableTerrainHeight: true,
      enableTerrainTextures: true
    };

    // UI Settings
    this.defaults[this.categories.UI] = {
      // UI appearance
      uiScale: 1.0,
      enableAnimations: true,
      enableTransitions: true,
      
      // UI elements
      enableScoreboard: true,
      enableMinimap: false,
      enableTooltips: true,
      enableNotifications: true,
      
      // UI colors
      primaryColor: '#00e0ff',
      secondaryColor: '#8e54e9',
      accentColor: '#22ff22',
      dangerColor: '#ff5e62',
      
      // UI fonts
      fontFamily: 'Luckiest Guy',
      fontSize: '1em',
      enableCustomFonts: true,
      
      // UI layout
      enableResponsiveDesign: true,
      enableFullscreen: false,
      enableCustomLayout: false
    };

    // Debug Settings
    this.defaults[this.categories.DEBUG] = {
      // Debug features
      enableDebugPanel: false,
      enableFPSDisplay: false,
      enablePerformanceMetrics: false,
      enableConsoleLogging: true,
      
      // Debug shortcuts
      enableDebugShortcuts: true,
      enableCheatMode: false,
      enableGodMode: false,
      
      // Debug information
      showTroopStats: false,
      showBattleInfo: false,
      showTerrainInfo: false,
      
      // Debug controls
      enableDebugControls: true,
      enableTestMode: false,
      enableProfiling: false
    };
  }

  loadUserSettings() {
    try {
      const savedSettings = localStorage.getItem(this.storageKey);
      if (savedSettings) {
        this.userSettings = JSON.parse(savedSettings);
        simpleLogger.addLog('INFO', ['Loaded user settings from storage']);
      } else {
        this.userSettings = {};
        simpleLogger.addLog('INFO', ['No saved settings found, using defaults']);
      }
    } catch (error) {
      simpleLogger.addLog('ERROR', ['Failed to load user settings:', error]);
      this.userSettings = {};
    }
  }

  mergeConfigurations() {
    // Start with defaults
    this.config = JSON.parse(JSON.stringify(this.defaults));
    
    // Override with user settings
    for (const category in this.userSettings) {
      if (this.config[category]) {
        this.config[category] = { ...this.config[category], ...this.userSettings[category] };
      }
    }
    
    simpleLogger.addLog('INFO', ['Configuration merged successfully']);
  }

  // Get configuration value
  get(category, key, defaultValue = null) {
    if (!this.isInitialized) {
      simpleLogger.addLog('WARN', ['ConfigManager not initialized, returning default']);
      return defaultValue;
    }

    if (this.config[category] && this.config[category][key] !== undefined) {
      return this.config[category][key];
    }

    if (defaultValue !== null) {
      return defaultValue;
    }

    simpleLogger.addLog('WARN', ['Configuration key not found:', category, key]);
    return null;
  }

  // Set configuration value
  set(category, key, value) {
    if (!this.isInitialized) {
      simpleLogger.addLog('ERROR', ['ConfigManager not initialized']);
      return false;
    }

    if (!this.config[category]) {
      this.config[category] = {};
    }

    this.config[category][key] = value;
    
    // Update user settings
    if (!this.userSettings[category]) {
      this.userSettings[category] = {};
    }
    this.userSettings[category][key] = value;
    
    // Save to storage
    this.saveUserSettings();
    
    simpleLogger.addLog('INFO', ['Configuration updated:', category, key, value]);
    return true;
  }

  // Get entire category
  getCategory(category) {
    if (!this.isInitialized) {
      simpleLogger.addLog('WARN', ['ConfigManager not initialized']);
      return {};
    }

    return this.config[category] || {};
  }

  // Set entire category
  setCategory(category, values) {
    if (!this.isInitialized) {
      simpleLogger.addLog('ERROR', ['ConfigManager not initialized']);
      return false;
    }

    this.config[category] = { ...this.config[category], ...values };
    this.userSettings[category] = { ...this.userSettings[category], ...values };
    
    this.saveUserSettings();
    
    simpleLogger.addLog('INFO', ['Category updated:', category]);
    return true;
  }

  // Reset category to defaults
  resetCategory(category) {
    if (!this.isInitialized) {
      simpleLogger.addLog('ERROR', ['ConfigManager not initialized']);
      return false;
    }

    if (this.defaults[category]) {
      this.config[category] = { ...this.defaults[category] };
      delete this.userSettings[category];
      this.saveUserSettings();
      
      simpleLogger.addLog('INFO', ['Category reset to defaults:', category]);
      return true;
    }

    simpleLogger.addLog('WARN', ['Category not found for reset:', category]);
    return false;
  }

  // Reset all settings to defaults
  resetAll() {
    if (!this.isInitialized) {
      simpleLogger.addLog('ERROR', ['ConfigManager not initialized']);
      return false;
    }

    this.userSettings = {};
    this.config = JSON.parse(JSON.stringify(this.defaults));
    this.saveUserSettings();
    
    simpleLogger.addLog('INFO', ['All settings reset to defaults']);
    return true;
  }

  // Save user settings to storage
  saveUserSettings() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.userSettings));
      simpleLogger.addLog('DEBUG', ['User settings saved to storage']);
    } catch (error) {
      simpleLogger.addLog('ERROR', ['Failed to save user settings:', error]);
    }
  }

  // Export configuration
  exportConfig() {
    return {
      defaults: this.defaults,
      userSettings: this.userSettings,
      currentConfig: this.config,
      version: '1.0.0',
      timestamp: Date.now()
    };
  }

  // Import configuration
  importConfig(configData) {
    if (!this.isInitialized) {
      simpleLogger.addLog('ERROR', ['ConfigManager not initialized']);
      return false;
    }

    try {
      if (configData.userSettings) {
        this.userSettings = configData.userSettings;
        this.mergeConfigurations();
        this.saveUserSettings();
        
        simpleLogger.addLog('INFO', ['Configuration imported successfully']);
        return true;
      }
    } catch (error) {
      simpleLogger.addLog('ERROR', ['Failed to import configuration:', error]);
    }

    return false;
  }

  // Get configuration statistics
  getConfigStats() {
    if (!this.isInitialized) {
      return { error: 'ConfigManager not initialized' };
    }

    const stats = {
      totalCategories: Object.keys(this.categories).length,
      totalSettings: 0,
      userModifiedSettings: 0,
      categories: {}
    };

    for (const category in this.config) {
      const categoryStats = {
        totalSettings: Object.keys(this.config[category]).length,
        userModifiedSettings: 0
      };

      for (const key in this.config[category]) {
        stats.totalSettings++;
        
        if (this.userSettings[category] && this.userSettings[category][key] !== undefined) {
          categoryStats.userModifiedSettings++;
          stats.userModifiedSettings++;
        }
      }

      stats.categories[category] = categoryStats;
    }

    return stats;
  }

  // Validate configuration
  validateConfig() {
    if (!this.isInitialized) {
      return { valid: false, errors: ['ConfigManager not initialized'] };
    }

    const errors = [];
    const warnings = [];

    // Check for required categories
    for (const category in this.categories) {
      if (!this.config[this.categories[category]]) {
        errors.push(`Missing required category: ${this.categories[category]}`);
      }
    }

    // Check for invalid values
    for (const category in this.config) {
      for (const key in this.config[category]) {
        const value = this.config[category][key];
        
        // Check for null/undefined values
        if (value === null || value === undefined) {
          warnings.push(`Null/undefined value in ${category}.${key}`);
        }
        
        // Check for numeric ranges
        if (typeof value === 'number') {
          if (key.includes('Volume') && (value < 0 || value > 1)) {
            errors.push(`Invalid volume value in ${category}.${key}: ${value}`);
          }
          if (key.includes('Count') && value < 0) {
            errors.push(`Invalid count value in ${category}.${key}: ${value}`);
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Get configuration as environment variables (for compatibility)
  getAsEnvironment() {
    const env = {};
    
    for (const category in this.config) {
      for (const key in this.config[category]) {
        const envKey = `${category.toUpperCase()}_${key.toUpperCase()}`;
        env[envKey] = this.config[category][key];
      }
    }
    
    return env;
  }

  // Destroy the configuration manager
  destroy() {
    this.saveUserSettings();
    this.config = {};
    this.userSettings = {};
    this.isInitialized = false;
    simpleLogger.addLog('INFO', ['Configuration Manager destroyed']);
  }
}

// Create singleton instance
const configManager = new ConfigManager();

// Export functions for backward compatibility
export function getConfig(category, key, defaultValue) {
  return configManager.get(category, key, defaultValue);
}

export function setConfig(category, key, value) {
  return configManager.set(category, key, value);
}

export function getCategory(category) {
  return configManager.getCategory(category);
}

export function setCategory(category, values) {
  return configManager.setCategory(category, values);
}

export function resetConfig(category) {
  return configManager.resetCategory(category);
}

export function resetAllConfig() {
  return configManager.resetAll();
}

export function exportConfig() {
  return configManager.exportConfig();
}

export function importConfig(configData) {
  return configManager.importConfig(configData);
}

export function getConfigStats() {
  return configManager.getConfigStats();
}

export function validateConfig() {
  return configManager.validateConfig();
}

// Export the manager instance for advanced usage
export { configManager };

// Test function to verify configuration manager is working
export function testConfigManager() {
  console.log('=== Configuration Manager Test ===');
  
  // Test basic functionality
  console.log('Is initialized:', configManager.isInitialized);
  console.log('Config stats:', configManager.getConfigStats());
  console.log('Validation:', configManager.validateConfig());
  
  // Test getting values
  console.log('Player troop count:', configManager.get('troops', 'playerTroopCount'));
  console.log('Terrain size:', configManager.get('terrain', 'terrainSize'));
  console.log('Camera FOV:', configManager.get('graphics', 'cameraFOV'));
  console.log('Master volume:', configManager.get('audio', 'masterVolume'));
  
  // Test setting values
  configManager.set('debug', 'enableDebugPanel', true);
  console.log('Debug panel enabled:', configManager.get('debug', 'enableDebugPanel'));
  
  // Test category operations
  const battleConfig = configManager.getCategory('battle');
  console.log('Battle config:', battleConfig);
  
  console.log('=== Configuration Manager Test Complete ===');
} 