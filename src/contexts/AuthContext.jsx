/**
 * AuthContext
 * Provides authentication state and methods throughout the app
 */
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  isBiometricSupported,
  hasBiometricCredentials,
  storeBiometricSession,
  getBiometricSession,
  clearBiometricSession,
  authenticateBiometric,
} from '../lib/biometric';

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

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Store session for biometric login if available
      if (session && isBiometricSupported()) {
        storeBiometricSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at,
          user: session.user,
        });
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
      if (session && isBiometricSupported()) {
        storeBiometricSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at,
          user: session.user,
        });
      } else if (!session) {
        // Clear biometric session on logout
        clearBiometricSession();
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
      if (!isBiometricSupported()) {
        return {
          error: { message: 'Biometric authentication is not supported on this device' },
        };
      }

      if (!hasBiometricCredentials()) {
        return {
          error: { message: 'No biometric credentials found. Please sign in with email first.' },
        };
      }

      // Authenticate with biometric
      const biometricResult = await authenticateBiometric();
      
      if (!biometricResult.success) {
        return {
          error: { message: biometricResult.error || 'Biometric authentication failed' },
        };
      }

      // Restore session using stored tokens
      const storedSession = biometricResult.session;
      
      // Set the session in Supabase
      const { data, error } = await supabase.auth.setSession({
        access_token: storedSession.access_token,
        refresh_token: storedSession.refresh_token,
      });

      if (error) {
        // If session is expired, clear stored credentials
        if (error.message.includes('expired') || error.message.includes('invalid')) {
          clearBiometricSession();
        }
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error signing in with biometric:', error);
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
    isBiometricSupported: isBiometricSupported(),
    hasBiometricCredentials: hasBiometricCredentials(),
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

