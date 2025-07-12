// ============================================================================
// LOGGING SYSTEM
// ============================================================================

import { gameState } from './GameState.js';

export class GameLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 100; // Keep last 100 logs
    this.originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info
    };
    
    this.interceptConsole();
    this.setupPeriodicLogging();
  }
  
  interceptConsole() {
    const self = this;
    
    console.log = function(...args) {
      self.originalConsole.log(...args);
      self.addLog('LOG', args);
    };
    
    console.error = function(...args) {
      self.originalConsole.error(...args);
      self.addLog('ERROR', args);
    };
    
    console.warn = function(...args) {
      self.originalConsole.warn(...args);
      self.addLog('WARN', args);
    };
    
    console.info = function(...args) {
      self.originalConsole.info(...args);
      self.addLog('INFO', args);
    };
  }
  
  addLog(level, args) {
    const timestamp = new Date().toISOString();
    const message = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');
    
    this.logs.push({
      timestamp,
      level,
      message,
      gameState: gameState.getGameStateForLogging()
    });
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }
  
  setupPeriodicLogging() {
    // Send logs to assistant every 30 seconds or when there are important events
    setInterval(() => {
      if (this.logs.length > 0) {
        this.sendLogsToAssistant();
      }
    }, 30000);
  }
  
  sendLogsToAssistant() {
    const logData = {
      timestamp: new Date().toISOString(),
      logs: [...this.logs],
      gameState: gameState.getGameStateForLogging(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    // Store logs in localStorage for the assistant to access
    try {
      localStorage.setItem('gameLogs', JSON.stringify(logData));
      // Clear logs after storing
      this.logs = [];
    } catch (e) {
      // If localStorage fails, keep logs in memory
      console.warn('Could not store logs:', e);
    }
  }
  
  // Method to manually send logs (called on important events)
  sendLogsNow() {
    this.sendLogsToAssistant();
  }
  
  // Get logs for the assistant
  getGameLogs() {
    try {
      const logs = localStorage.getItem('gameLogs');
      if (logs) {
        const logData = JSON.parse(logs);
        localStorage.removeItem('gameLogs'); // Clear after reading
        return logData;
      }
      return null;
    } catch (e) {
      console.warn('Could not retrieve logs:', e);
      return null;
    }
  }
}

// Create and export singleton instance
export const gameLogger = new GameLogger();

// Make it globally accessible for backward compatibility
window.gameLogger = gameLogger;
window.getGameLogs = gameLogger.getGameLogs.bind(gameLogger); 