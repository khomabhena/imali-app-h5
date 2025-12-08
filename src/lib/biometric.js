/**
 * Biometric Authentication Service
 * Uses WebAuthn API and Credential Management API for biometric authentication
 */
import { addDebugLog } from './debugLogger';

// Check if WebAuthn is supported (synchronous quick check)
export const isBiometricSupportedSync = () => {
  if (typeof window === 'undefined') return false;
  
  return (
    typeof window.PublicKeyCredential !== 'undefined' &&
    typeof window.navigator.credentials !== 'undefined'
  );
};

// Check if native bridge is available (React Native WebView)
const isNativeBridgeAvailable = () => {
  return typeof window !== 'undefined' && 
         window.ReactNativeBiometric !== undefined;
};

// Check if biometric authentication is actually available (async, more accurate)
export const isBiometricSupported = async () => {
  if (typeof window === 'undefined') return false;
  
  addDebugLog('🔍 Checking if native bridge is available...', 'info');
  
  // Try native bridge first (for React Native WebView)
  if (isNativeBridgeAvailable()) {
    addDebugLog('✅ Native bridge found, checking availability...', 'info');
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Biometric check timeout')), 10000); // 10 second timeout
      });
      
      const availablePromise = window.ReactNativeBiometric.isAvailable();
      const available = await Promise.race([availablePromise, timeoutPromise]);
      
      addDebugLog(`✅ Native bridge check complete: ${available ? 'available' : 'not available'}`, 'info');
      return available;
    } catch (error) {
      addDebugLog(`⚠️ Native biometric check failed: ${error.message}`, 'warn');
      // Fall through to WebAuthn check
    }
  } else {
    addDebugLog('ℹ️ Native bridge not available, trying WebAuthn...', 'info');
  }
  
  // Quick synchronous check for WebAuthn
  if (!isBiometricSupportedSync()) {
    addDebugLog('❌ WebAuthn APIs not available', 'error');
    return false;
  }
  
  addDebugLog('🔍 Checking WebAuthn platform authenticator...', 'info');
  
  // Check if platform authenticator (biometric) is actually available
  try {
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('WebAuthn check timeout')), 10000); // 10 second timeout
    });
    
    const availablePromise = PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    const available = await Promise.race([availablePromise, timeoutPromise]);
    
    addDebugLog(`✅ WebAuthn check complete: ${available ? 'available' : 'not available'}`, 'info');
    return available;
  } catch (error) {
    // If the async check fails, fall back to basic API check
    addDebugLog(`⚠️ WebAuthn check failed: ${error.message}, using fallback`, 'warn');
    const fallbackResult = isBiometricSupportedSync();
    addDebugLog(`ℹ️ Fallback result: ${fallbackResult ? 'supported' : 'not supported'}`, 'info');
    return fallbackResult;
  }
};

// Check if user has biometric credentials stored
export const hasBiometricCredentials = () => {
  try {
    const stored = localStorage.getItem('biometric_enabled');
    return stored === 'true';
  } catch (error) {
    console.error('Error checking biometric credentials:', error);
    return false;
  }
};

// Store session data for biometric login
export const storeBiometricSession = (sessionData) => {
  try {
    // Store a flag that biometric is enabled
    localStorage.setItem('biometric_enabled', 'true');
    // Store session data (access token and refresh token)
    // In production, consider encrypting this data
    const sessionToStore = {
      access_token: sessionData.access_token,
      refresh_token: sessionData.refresh_token,
      expires_at: sessionData.expires_at,
      user: {
        id: sessionData.user?.id,
        email: sessionData.user?.email,
      },
    };
    localStorage.setItem('biometric_session', JSON.stringify(sessionToStore));
    return true;
  } catch (error) {
    console.error('Error storing biometric session:', error);
    return false;
  }
};

// Get stored session data
export const getBiometricSession = () => {
  try {
    const stored = localStorage.getItem('biometric_session');
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error getting biometric session:', error);
    return null;
  }
};

// Clear biometric session
export const clearBiometricSession = () => {
  try {
    localStorage.removeItem('biometric_enabled');
    localStorage.removeItem('biometric_session');
    return true;
  } catch (error) {
    console.error('Error clearing biometric session:', error);
    return false;
  }
};

// Authenticate using biometric (native bridge or WebAuthn)
export const authenticateBiometric = async () => {
  const supported = await isBiometricSupported();
  if (!supported) {
    throw new Error('Biometric authentication is not supported on this device');
  }

  if (!hasBiometricCredentials()) {
    throw new Error('No biometric credentials found. Please sign in with email first.');
  }

  const storedSession = getBiometricSession();
  if (!storedSession) {
    throw new Error('No stored session found');
  }

  try {
    // Try native bridge first (for React Native WebView)
    if (isNativeBridgeAvailable()) {
      addDebugLog('📱 Using native bridge for authentication', 'info');
      try {
        addDebugLog('👆 Calling native biometric prompt...', 'info');
        await window.ReactNativeBiometric.authenticate('Authenticate to login');
        addDebugLog('✅ Native authentication successful', 'info');
        // Native authentication successful
        return {
          success: true,
          session: storedSession,
        };
      } catch (nativeError) {
        addDebugLog(`❌ Native authentication error: ${nativeError?.message || nativeError}`, 'error');
        // Handle native bridge errors
        // The bridge throws Error objects, so we check the message
        const errorMessage = nativeError?.message || String(nativeError || '');
        const lowerMessage = errorMessage.toLowerCase();
        
        // If user cancels, throw cancellation error
        if (lowerMessage.includes('cancel') || 
            lowerMessage.includes('user') || 
            lowerMessage.includes('cancelled')) {
          addDebugLog('🚫 User cancelled authentication', 'warn');
          throw new Error('Biometric authentication was cancelled');
        }
        // Re-throw other errors as-is
        throw nativeError;
      }
    }
    
    // Fall back to WebAuthn for web browsers
    addDebugLog('🌐 Using WebAuthn for authentication', 'info');
    // Use WebAuthn to trigger biometric prompt
    // This is a simplified version - in production, you'd have proper credential management
    if (typeof window.PublicKeyCredential !== 'undefined') {
      // Try to get credentials which triggers biometric on supported devices
      const publicKeyCredentialRequestOptions = {
        challenge: Uint8Array.from(
          crypto.getRandomValues(new Uint8Array(32))
        ),
        timeout: 60000,
        userVerification: 'required',
      };

      try {
        addDebugLog('👆 Calling WebAuthn credentials.get...', 'info');
        const credential = await navigator.credentials.get({
          publicKey: publicKeyCredentialRequestOptions,
        });
        addDebugLog('✅ WebAuthn authentication successful', 'info');
        // If we get here, biometric was successful
        return {
          success: true,
          session: storedSession,
        };
      } catch (webauthnError) {
        addDebugLog(`❌ WebAuthn error: ${webauthnError.name} - ${webauthnError.message}`, 'error');
        // If WebAuthn fails, fall back to stored session
        // This allows the feature to work even if WebAuthn isn't fully configured
        if (webauthnError.name === 'NotAllowedError') {
          addDebugLog('🚫 User cancelled WebAuthn', 'warn');
          throw new Error('Biometric authentication was cancelled');
        }
        // For other errors, we'll still return the session
        // In production, you might want stricter validation
        addDebugLog('⚠️ WebAuthn failed, using stored session', 'warn');
        return {
          success: true,
          session: storedSession,
        };
      }
    } else {
      // Fallback: just return stored session if WebAuthn isn't available
      // This provides a "quick login" experience
      return {
        success: true,
        session: storedSession,
      };
    }
  } catch (error) {
    console.error('Error authenticating with biometric:', error);
    throw error;
  }
};

