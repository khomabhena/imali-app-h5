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
        // Wait a bit for bridge to be injected (if in React Native WebView)
        setTimeout(() => {
          // Check if native bridge is available (for React Native) or WebAuthn (for web)
          const hasNativeBridge = typeof window !== 'undefined' && window.ReactNativeBiometric !== undefined;
          const hasWebAuthn = typeof window !== 'undefined' && 
                             typeof window.PublicKeyCredential !== 'undefined' &&
                             typeof window.navigator.credentials !== 'undefined';
          
          if (hasNativeBridge || hasWebAuthn) {
            console.log('💾 Storing biometric session on initial load...');
            storeBiometricSession({
              access_token: session.access_token,
              refresh_token: session.refresh_token,
              expires_at: session.expires_at,
              user: session.user,
            });
            console.log('✅ Biometric session stored');
          } else {
            console.log('⚠️ Biometric not available, skipping session storage');
          }
        }, 500); // Small delay to ensure bridge is injected
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
        // Wait a bit for bridge to be injected (if in React Native WebView)
        setTimeout(() => {
          // Check if native bridge is available (for React Native) or WebAuthn (for web)
          const hasNativeBridge = typeof window !== 'undefined' && window.ReactNativeBiometric !== undefined;
          const hasWebAuthn = typeof window !== 'undefined' && 
                             typeof window.PublicKeyCredential !== 'undefined' &&
                             typeof window.navigator.credentials !== 'undefined';
          
          if (hasNativeBridge || hasWebAuthn) {
            console.log('💾 Storing biometric session...');
            storeBiometricSession({
              access_token: session.access_token,
              refresh_token: session.refresh_token,
              expires_at: session.expires_at,
              user: session.user,
            });
            console.log('✅ Biometric session stored');
          } else {
            console.log('⚠️ Biometric not available, skipping session storage');
          }
        }, 500); // Small delay to ensure bridge is injected
      } else if (!session) {
        // Don't clear biometric session on logout - keep it for next login
        // The session will be validated/refreshed when user uses biometric login
        console.log('ℹ️ User logged out, but keeping biometric credentials for next login');
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
      // Wait a bit for bridge to be injected (if in React Native WebView)
      setTimeout(() => {
        // Check if native bridge is available (for React Native) or WebAuthn (for web)
        const hasNativeBridge = typeof window !== 'undefined' && window.ReactNativeBiometric !== undefined;
        const hasWebAuthn = typeof window !== 'undefined' && 
                           typeof window.PublicKeyCredential !== 'undefined' &&
                           typeof window.navigator.credentials !== 'undefined';
        
        if (hasNativeBridge || hasWebAuthn) {
          console.log('💾 Storing biometric session after sign in...');
          storeBiometricSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at,
            user: data.session.user,
          });
          console.log('✅ Biometric session stored');
        } else {
          console.log('⚠️ Biometric not available, skipping session storage');
        }
      }, 500); // Small delay to ensure bridge is injected
    }
    
    return { data, error };
  };

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
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
      
      // Set the session in Supabase
      const { data, error } = await supabase.auth.setSession({
        access_token: storedSession.access_token,
        refresh_token: storedSession.refresh_token,
      });

      if (error) {
        addDebugLog(`❌ Session restoration failed: ${error.message}`, 'error');
        // If session is expired, clear stored credentials
        if (error.message.includes('expired') || error.message.includes('invalid')) {
          addDebugLog('🗑️ Clearing expired credentials', 'warn');
          clearBiometricSession();
        }
        return { data: null, error };
      }

      addDebugLog('✅ Session restored successfully!', 'info');
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

