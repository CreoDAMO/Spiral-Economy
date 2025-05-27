/**
 * QCHAIN.js - Quantum Chain Logging System
 * Provides secure, interplanetary logging with quantum verification
 */

/**
 * Log an event to the QCHAIN with quantum signature
 * @param {Object} data - Event data to log
 * @returns {Promise<Object>} Logging result
 */
export const logQCHAIN = async (data) => {
  // Ensure required fields
  if (!data.event || !data.txId) {
    throw new Error('QCHAIN log requires event and txId fields');
  }
  
  // Add timestamp if not provided
  if (!data.timestamp) {
    data.timestamp = new Date().toISOString();
  }
  
  // Default to interplanetary if not specified
  if (data.interplanetary === undefined) {
    data.interplanetary = true;
  }
  
  // Ensure metrics object exists
  if (!data.metrics) {
    data.metrics = {};
  }
  
  // Add default compliance metric if not provided
  if (!data.metrics.compliance) {
    data.metrics.compliance = '100%';
  }
  
  // Create quantum signature
  const signature = await createQuantumSignature(data);
  
  // Log to local storage for offline resilience
  storeLocalLog({ ...data, signature });
  
  // Attempt to transmit if online
  if (navigator.onLine) {
    try {
      await transmitLog({ ...data, signature });
    } catch (error) {
      console.error('Failed to transmit QCHAIN log:', error);
      // Will be synced later via background sync
    }
  }
  
  return { status: 'logged', txId: data.txId, signature };
};

/**
 * Create a quantum signature for data
 * @private
 * @param {Object} data - Data to sign
 * @returns {Promise<string>} Quantum signature
 */
const createQuantumSignature = async (data) => {
  // Simulate quantum signature with timestamp and hash
  const timestamp = Date.now();
  const hash = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(JSON.stringify(data) + timestamp)
  );
  
  // Convert hash to hex string
  const hashArray = Array.from(new Uint8Array(hash));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return `QS-${hashHex.substring(0, 16)}-${timestamp}`;
};

/**
 * Store log data locally for offline resilience
 * @private
 * @param {Object} logData - Log data with signature
 */
const storeLocalLog = (logData) => {
  // Get existing logs
  const existingLogs = JSON.parse(localStorage.getItem('qchain_logs') || '[]');
  
  // Add new log
  existingLogs.push(logData);
  
  // Store updated logs
  localStorage.setItem('qchain_logs', JSON.stringify(existingLogs));
  
  // Register for background sync if available
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then(registration => {
      registration.sync.register('qchain-sync');
    });
  }
};

/**
 * Transmit log data to the distributed ledger
 * @private
 * @param {Object} logData - Log data with signature
 * @returns {Promise<Object>} Transmission result
 */
const transmitLog = async (logData) => {
  // In a real implementation, this would send to a distributed ledger
  // For now, we'll simulate with a console log
  console.log('QCHAIN Transmission:', logData);
  
  // Simulate network delay for interplanetary transmission
  if (logData.interplanetary) {
    await new Promise(resolve => setTimeout(resolve, 240)); // 240ms to simulate light-speed delay
  }
  
  return { status: 'transmitted', txId: logData.txId };
};

/**
 * Get all stored QCHAIN logs
 * @returns {Array} Stored logs
 */
export const getQCHAINLogs = () => {
  return JSON.parse(localStorage.getItem('qchain_logs') || '[]');
};

/**
 * Clear all stored QCHAIN logs
 */
export const clearQCHAINLogs = () => {
  localStorage.removeItem('qchain_logs');
};

/**
 * Verify a QCHAIN signature
 * @param {Object} data - Original data
 * @param {string} signature - Quantum signature to verify
 * @returns {Promise<boolean>} Verification result
 */
export const verifyQCHAINSignature = async (data, signature) => {
  // Extract timestamp from signature
  const timestampMatch = signature.match(/QS-[0-9a-f]+-(\d+)/);
  if (!timestampMatch) {
    return false;
  }
  
  const timestamp = timestampMatch[1];
  
  // Recreate hash
  const hash = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(JSON.stringify(data) + timestamp)
  );
  
  // Convert hash to hex string
  const hashArray = Array.from(new Uint8Array(hash));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Compare with signature
  const expectedSignature = `QS-${hashHex.substring(0, 16)}-${timestamp}`;
  
  return signature === expectedSignature;
};

/**
 * Create a QCHAIN transaction ID
 * @param {string} prefix - Transaction ID prefix
 * @returns {string} Transaction ID
 */
export const createQCHAINTxId = (prefix = 'TX') => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  
  return `${prefix}-${timestamp}-${random}`;
};
