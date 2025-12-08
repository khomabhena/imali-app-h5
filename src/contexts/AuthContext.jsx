/**
 * AuthContext
 * Provides authentication state and methods throughout the app
 */
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  isBiometricSupported,
  isBiometricSupportedSync,
  hasBiometricCredentials,
  storeBiometricSession,
  getBiometricSession,
  clearBiometricSession,
  authenticateBiometric,
} from '../lib/biometric';
import { addDebugLog } from '../lib/debugLogger';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [biometricSupported, setBiometricSupported] = useState(false);

  useEffect(() => {
    // Check biometric support once on mount
    isBiometricSupported().then(supported => {
      setBiometricSupported(supported);
    });

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Store session for biometric login if available
      if (session) {
        // Store immediately, then verify and retry if needed
        const attemptStorage = (attempt = 1) => {
          // Check if native bridge is available (for React Native) or WebAuthn (for web)
          const hasNativeBridge = typeof window !== 'undefined' && window.ReactNativeBiometric !== undefined;
          const hasWebAuthn = typeof window !== 'undefined' && 
                             typeof window.PublicKeyCredential !== 'undefined' &&
                             typeof window.navigator.credentials !== 'undefined';
          
          if (hasNativeBridge || hasWebAuthn) {
            console.log(`💾 Storing biometric session on initial load (attempt ${attempt})...`);
            const stored = storeBiometricSession({
              access_token: session.access_token,
              refresh_token: session.refresh_token,
              expires_at: session.expires_at,
              user: session.user,
            });
            
            // Verify storage was successful
            setTimeout(() => {
              const verified = localStorage.getItem('biometric_enabled') === 'true';
              if (verified) {
                console.log('✅ Biometric session stored and verified');
              } else if (attempt < 3) {
                console.log(`⚠️ Storage verification failed, retrying (attempt ${attempt + 1})...`);
                setTimeout(() => attemptStorage(attempt + 1), 500);
              } else {
                console.error('❌ Failed to store biometric session after 3 attempts');
              }
            }, 100);
          } else if (attempt < 3) {
            // Bridge not ready yet, retry
            console.log(`⏳ Bridge not ready, retrying in 500ms (attempt ${attempt})...`);
            setTimeout(() => attemptStorage(attempt + 1), 500);
          } else {
            console.log('⚠️ Biometric not available after 3 attempts, skipping session storage');
          }
        };
        
        // Start storage attempt immediately
        attemptStorage(1);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Store session for biometric login if available
      if (session) {
        // Store immediately, then verify and retry if needed
        const attemptStorage = (attempt = 1) => {
          // Check if native bridge is available (for React Native) or WebAuthn (for web)
          const hasNativeBridge = typeof window !== 'undefined' && window.ReactNativeBiometric !== undefined;
          const hasWebAuthn = typeof window !== 'undefined' && 
                             typeof window.PublicKeyCredential !== 'undefined' &&
                             typeof window.navigator.credentials !== 'undefined';
          
          if (hasNativeBridge || hasWebAuthn) {
            console.log(`💾 Storing biometric session on auth change (attempt ${attempt})...`);
            const stored = storeBiometricSession({
              access_token: session.access_token,
              refresh_token: session.refresh_token,
              expires_at: session.expires_at,
              user: session.user,
            });
            
            // Verify storage was successful
            setTimeout(() => {
              const verified = localStorage.getItem('biometric_enabled') === 'true';
              if (verified) {
                console.log('✅ Biometric session stored and verified');
              } else if (attempt < 3) {
                console.log(`⚠️ Storage verification failed, retrying (attempt ${attempt + 1})...`);
                setTimeout(() => attemptStorage(attempt + 1), 500);
              } else {
                console.error('❌ Failed to store biometric session after 3 attempts');
              }
            }, 100);
          } else if (attempt < 3) {
            // Bridge not ready yet, retry
            console.log(`⏳ Bridge not ready, retrying in 500ms (attempt ${attempt})...`);
            setTimeout(() => attemptStorage(attempt + 1), 500);
          } else {
            console.log('⚠️ Biometric not available after 3 attempts, skipping session storage');
          }
        };
        
        // Start storage attempt immediately
        attemptStorage(1);
      } else if (!session) {
        // DON'T clear biometric session on logout - keep it for next login
        // This allows users to use biometric login even after signing out
        // clearBiometricSession(); // Commented out - keep credentials for biometric login
        console.log('ℹ️ Session cleared, but keeping biometric credentials for next login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign up with email and password
  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    // Store session for biometric login if login was successful
    if (data?.session && !error) {
      // Store immediately, then verify and retry if needed
      const attemptStorage = (attempt = 1) => {
        // Check if native bridge is available (for React Native) or WebAuthn (for web)
        const hasNativeBridge = typeof window !== 'undefined' && window.ReactNativeBiometric !== undefined;
        const hasWebAuthn = typeof window !== 'undefined' && 
                           typeof window.PublicKeyCredential !== 'undefined' &&
                           typeof window.navigator.credentials !== 'undefined';
        
        if (hasNativeBridge || hasWebAuthn) {
          console.log(`💾 Storing biometric session after sign in (attempt ${attempt})...`);
          const stored = storeBiometricSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at,
            user: data.session.user,
          });
          
          // Verify storage was successful
          setTimeout(() => {
            const verified = localStorage.getItem('biometric_enabled') === 'true';
            if (verified) {
              console.log('✅ Biometric session stored and verified');
            } else if (attempt < 3) {
              console.log(`⚠️ Storage verification failed, retrying (attempt ${attempt + 1})...`);
              setTimeout(() => attemptStorage(attempt + 1), 500);
            } else {
              console.error('❌ Failed to store biometric session after 3 attempts');
            }
          }, 100);
        } else if (attempt < 3) {
          // Bridge not ready yet, retry
          console.log(`⏳ Bridge not ready, retrying in 500ms (attempt ${attempt})...`);
          setTimeout(() => attemptStorage(attempt + 1), 500);
        } else {
          console.log('⚠️ Biometric not available after 3 attempts, skipping session storage');
        }
      };
      
      // Start storage attempt immediately
      attemptStorage(1);
    }
    
    return { data, error };
  };

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    // DON'T clear biometric session on sign out - keep it for next login
    // clearBiometricSession(); // Commented out - keep credentials for biometric login
    return { error };
  };

  // Reset password
  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { data, error };
  };

  // Verify OTP (for email verification and password reset)
  const verifyOtp = async (token_hash, type) => {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    });
    return { data, error };
  };

  // Update password
  const updatePassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { data, error };
  };

  // OAuth Sign In
  const signInWithOAuth = async (provider) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { data, error };
  };

  // Verify email (uses verifyOtp internally)
  const verifyEmail = async (token_hash, type) => {
    return verifyOtp(token_hash, type);
  };

  // Resend verification email
  const resendVerificationEmail = async (email) => {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    return { data, error };
  };

  // Sign in with biometric
  const signInWithBiometric = async () => {
    try {
      addDebugLog('🔐 Starting biometric login...', 'info');
      addDebugLog('📱 Checking biometric support...', 'info');
      const supported = await isBiometricSupported();
      if (!supported) {
        addDebugLog('❌ Biometric not supported on this device', 'error');
        return {
          error: { message: 'Biometric authentication is not supported on this device' },
        };
      }
      addDebugLog('✅ Biometric is supported', 'info');

      addDebugLog('🔑 Checking for stored credentials...', 'info');
      if (!hasBiometricCredentials()) {
        addDebugLog('❌ No biometric credentials found', 'warn');
        return {
          error: { message: 'No biometric credentials found. Please sign in with email first.' },
        };
      }
      addDebugLog('✅ Credentials found', 'info');

      addDebugLog('👆 Starting biometric authentication...', 'info');
      // Authenticate with biometric
      const biometricResult = await authenticateBiometric();
      
      if (!biometricResult.success) {
        addDebugLog(`❌ Authentication failed: ${biometricResult.error}`, 'error');
        return {
          error: { message: biometricResult.error || 'Biometric authentication failed' },
        };
      }
      addDebugLog('✅ Biometric authentication successful', 'info');

      // Restore session using stored tokens
      const storedSession = biometricResult.session;
      addDebugLog('🔄 Restoring session...', 'info');
      addDebugLog(`ℹ️ Stored session keys: ${Object.keys(storedSession).join(', ')}`, 'info');
      addDebugLog(`ℹ️ Access token exists: ${!!storedSession.access_token}`, 'info');
      addDebugLog(`ℹ️ Refresh token exists: ${!!storedSession.refresh_token}`, 'info');
      addDebugLog(`ℹ️ Access token length: ${storedSession.access_token?.length || 0}`, 'info');
      addDebugLog(`ℹ️ Refresh token length: ${storedSession.refresh_token?.length || 0}`, 'info');
      
      // Check if tokens are expired
      if (storedSession.expires_at) {
        const expiresAt = storedSession.expires_at;
        const now = Math.floor(Date.now() / 1000);
        const isExpired = expiresAt < now;
        addDebugLog(`ℹ️ Token expires at: ${new Date(expiresAt * 1000).toISOString()}`, 'info');
        addDebugLog(`ℹ️ Current time: ${new Date().toISOString()}`, 'info');
        addDebugLog(`ℹ️ Token expired: ${isExpired}`, isExpired ? 'warn' : 'info');
        
        if (isExpired) {
          addDebugLog('🔄 Token expired, attempting to refresh...', 'info');
          // Try to refresh the session using the refresh token
          try {
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
              refresh_token: storedSession.refresh_token,
            });
            
            if (refreshError) {
              addDebugLog(`❌ Token refresh failed: ${refreshError.message}`, 'error');
              addDebugLog('🗑️ Clearing expired credentials', 'warn');
              clearBiometricSession();
              return { data: null, error: refreshError };
            }
            
            addDebugLog('✅ Token refreshed successfully', 'info');
            // Update stored session with new tokens
            if (refreshData.session) {
              storeBiometricSession({
                access_token: refreshData.session.access_token,
                refresh_token: refreshData.session.refresh_token,
                expires_at: refreshData.session.expires_at,
                user: refreshData.session.user,
              });
            }
            return { data: refreshData, error: null };
          } catch (refreshErr) {
            addDebugLog(`❌ Token refresh exception: ${refreshErr.message}`, 'error');
            clearBiometricSession();
            return { 
              data: null, 
              error: { message: 'Session expired and could not be refreshed. Please sign in again.' } 
            };
          }
        }
      }
      
      // Set the session in Supabase
      addDebugLog('📤 Calling supabase.auth.setSession...', 'info');
      
      // Try to set session - Supabase expects access_token and refresh_token
      const sessionToSet = {
        access_token: storedSession.access_token,
        refresh_token: storedSession.refresh_token,
      };
      
      // If we have expires_at, include it (though it's optional)
      if (storedSession.expires_at) {
        sessionToSet.expires_at = storedSession.expires_at;
      }
      
      addDebugLog(`ℹ️ Session object keys: ${Object.keys(sessionToSet).join(', ')}`, 'info');
      
      const { data, error } = await supabase.auth.setSession(sessionToSet);
      
      // Verify the session was set by getting it back
      if (!error) {
        addDebugLog('✅ setSession call succeeded, verifying...', 'info');
        const { data: verifyData, error: verifyError } = await supabase.auth.getSession();
        if (verifyError || !verifyData.session) {
          addDebugLog(`⚠️ Session verification failed: ${verifyError?.message || 'No session found'}`, 'warn');
        } else {
          addDebugLog(`✅ Session verified - user: ${verifyData.session.user?.email || 'unknown'}`, 'info');
        }
      }

      if (error) {
        addDebugLog(`❌ Session restoration failed: ${error.message}`, 'error');
        addDebugLog(`ℹ️ Error code: ${error.status || 'unknown'}`, 'error');
        addDebugLog(`ℹ️ Full error: ${JSON.stringify(error)}`, 'error');
        
        // Try refreshing the token as a fallback
        if (storedSession.refresh_token) {
          addDebugLog('🔄 Attempting token refresh as fallback...', 'info');
          try {
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
              refresh_token: storedSession.refresh_token,
            });
            
            if (!refreshError && refreshData.session) {
              addDebugLog('✅ Token refresh successful, updating stored session', 'info');
              storeBiometricSession({
                access_token: refreshData.session.access_token,
                refresh_token: refreshData.session.refresh_token,
                expires_at: refreshData.session.expires_at,
                user: refreshData.session.user,
              });
              return { data: refreshData, error: null };
            } else {
              addDebugLog(`❌ Token refresh also failed: ${refreshError?.message}`, 'error');
            }
          } catch (refreshErr) {
            addDebugLog(`❌ Token refresh exception: ${refreshErr.message}`, 'error');
          }
        }
        
        // If session is expired or invalid, clear stored credentials
        if (error.message.includes('expired') || error.message.includes('invalid') || error.message.includes('missing')) {
          addDebugLog('🗑️ Clearing invalid/expired credentials', 'warn');
          clearBiometricSession();
        }
        return { data: null, error };
      }

      addDebugLog('✅ Session restored successfully!', 'info');
      addDebugLog(`ℹ️ Session user: ${data.session?.user?.email || 'unknown'}`, 'info');
      return { data, error: null };
    } catch (error) {
      addDebugLog(`💥 Exception: ${error.message}`, 'error');
      return {
        data: null,
        error: { message: error.message || 'Biometric authentication failed' },
      };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    signInWithOAuth,
    verifyEmail,
    verifyOtp,
    resendVerificationEmail,
    signInWithBiometric,
    isBiometricSupported: biometricSupported,
    hasBiometricCredentials: hasBiometricCredentials(),
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

