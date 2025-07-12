// ============================================================================
// SIMPLE LOGGER MODULE - INCREMENTAL REFACTORING STEP 1
// ============================================================================

// Simple logger that captures console output for debugging
class SimpleLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 50; // Keep last 50 logs
    this.originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info
    };
    
    this.interceptConsole();
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
      message
    });
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }
  
  // Get logs for debugging
  getLogs() {
    return [...this.logs];
  }
  
  // Clear logs
  clearLogs() {
    this.logs = [];
  }
}

// Create and export singleton instance
export const simpleLogger = new SimpleLogger();

// Make it globally accessible for backward compatibility
window.simpleLogger = simpleLogger; 