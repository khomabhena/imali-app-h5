/**
 * Global Debug Logger
 * Stores debug logs that can be displayed in the UI
 */

let debugLogs = [];
let listeners = [];

export const addDebugLog = (message, type = 'info') => {
  const timestamp = new Date().toLocaleTimeString();
  const log = { timestamp, message, type };
  debugLogs.push(log);
  
  // Keep only last 50 logs
  if (debugLogs.length > 50) {
    debugLogs = debugLogs.slice(-50);
  }
  
  // Notify listeners
  listeners.forEach(listener => listener(log));
  
  // Also log to console
  const logMethod = type === 'error' ? console.error : type === 'warn' ? console.warn : console.log;
  logMethod(`[${timestamp}] ${message}`);
};

export const getDebugLogs = () => [...debugLogs];

export const clearDebugLogs = () => {
  debugLogs = [];
  listeners.forEach(listener => listener(null)); // Notify with null to indicate clear
};

export const subscribeToLogs = (callback) => {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter(l => l !== callback);
  };
};

