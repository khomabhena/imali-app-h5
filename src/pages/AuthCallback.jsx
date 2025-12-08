/**
 * Auth Callback Page
 * Handles OAuth redirects from Supabase
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { storeBiometricSession } from '../lib/biometric';
import { addDebugLog, getDebugLogs, clearDebugLogs, subscribeToLogs } from '../lib/debugLogger';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import PageLayout from '../components/layout/PageLayout';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [debugLogs, setDebugLogs] = useState([]);
  const [showDebug, setShowDebug] = useState(true);

  // Subscribe to debug logs
  useEffect(() => {
    const unsubscribe = subscribeToLogs(() => {
      setDebugLogs(getDebugLogs());
    });
    // Get initial logs
    setDebugLogs(getDebugLogs());
    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Wait a moment for Supabase to process the URL hash
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get the session from the URL hash
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          addDebugLog(`❌ Auth callback error: ${error.message}`, 'error');
          console.error('Auth callback error:', error);
          setStatus('error');
          // Don't auto-navigate - let user see logs and navigate manually
          return;
        }

        if (data?.session) {
          // Successfully authenticated
          addDebugLog('✅ OAuth sign-in successful', 'info');
          // Store session for biometric login if available
          setTimeout(() => {
            // Check if native bridge is available (for React Native) or WebAuthn (for web)
            const hasNativeBridge = typeof window !== 'undefined' && window.ReactNativeBiometric !== undefined;
            const hasWebAuthn = typeof window !== 'undefined' && 
                               typeof window.PublicKeyCredential !== 'undefined' &&
                               typeof window.navigator.credentials !== 'undefined';
            
            if (hasNativeBridge || hasWebAuthn) {
              addDebugLog('💾 Storing biometric session after OAuth login...', 'info');
              storeBiometricSession({
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
                expires_at: data.session.expires_at,
                user: data.session.user,
              });
              addDebugLog('✅ Biometric session stored after OAuth', 'info');
            } else {
              addDebugLog('⚠️ Biometric not available, skipping session storage', 'warn');
            }
          }, 500); // Small delay to ensure bridge is injected
          
          setStatus('success');
          // Don't auto-navigate - let user see logs and navigate manually
        } else {
          // Check if there's an error in the URL
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const errorParam = hashParams.get('error');
          const errorDescription = hashParams.get('error_description');
          
          if (errorParam) {
            addDebugLog(`❌ OAuth error: ${errorParam} - ${errorDescription}`, 'error');
            console.error('OAuth error:', errorParam, errorDescription);
            setStatus('error');
            // Don't auto-navigate - let user see logs and navigate manually
          } else {
            // No session found and no error - might need to wait longer
            addDebugLog('⚠️ No session found and no error in URL', 'warn');
            setStatus('error');
            // Don't auto-navigate - let user see logs and navigate manually
          }
        }
      } catch (err) {
        addDebugLog(`💥 Unexpected error: ${err.message}`, 'error');
        console.error('Unexpected error:', err);
        setStatus('error');
        // Don't auto-navigate - let user see logs and navigate manually
      }
    };

    // Also listen to auth state changes as a backup
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        addDebugLog(`✅ Auth state changed: ${event}`, 'info');
        // Store session for biometric login if available
        setTimeout(() => {
          // Check if native bridge is available (for React Native) or WebAuthn (for web)
          const hasNativeBridge = typeof window !== 'undefined' && window.ReactNativeBiometric !== undefined;
          const hasWebAuthn = typeof window !== 'undefined' && 
                             typeof window.PublicKeyCredential !== 'undefined' &&
                             typeof window.navigator.credentials !== 'undefined';
          
          if (hasNativeBridge || hasWebAuthn) {
            addDebugLog('💾 Storing biometric session after OAuth (from auth state change)...', 'info');
            storeBiometricSession({
              access_token: session.access_token,
              refresh_token: session.refresh_token,
              expires_at: session.expires_at,
              user: session.user,
            });
            addDebugLog('✅ Biometric session stored after OAuth', 'info');
          } else {
            addDebugLog('⚠️ Biometric not available, skipping session storage', 'warn');
          }
        }, 500); // Small delay to ensure bridge is injected
        
        setStatus('success');
        // Don't auto-navigate - let user see logs and navigate manually
      } else if (event === 'SIGNED_OUT') {
        addDebugLog('⚠️ Auth state changed: SIGNED_OUT', 'warn');
        setStatus('error');
        // Don't auto-navigate - let user see logs and navigate manually
      }
    });

    handleAuthCallback();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (status === 'processing') {
    return (
      <PageLayout
        title="Completing Sign In"
        subtitle="Please wait..."
      >
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-4">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-4"></div>
            <p className="text-sm text-gray-600">Completing your sign in...</p>
          </div>
        </div>

        {/* Debug Log Panel */}
        <div className="bg-white rounded-xl border border-gray-200">
          <button
            type="button"
            onClick={() => setShowDebug(!showDebug)}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold text-gray-900">Debug Logs</span>
            {showDebug ? (
              <ChevronUpIcon className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 text-gray-500" />
            )}
          </button>
          {showDebug && (
            <div className="p-4 max-h-96 overflow-y-auto border-t border-gray-200">
              <div className="space-y-1 text-xs font-mono">
                {debugLogs.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No logs yet...</p>
                ) : (
                  debugLogs.map((log, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded ${
                        log.type === 'error'
                          ? 'bg-red-50 text-red-700'
                          : log.type === 'warn'
                          ? 'bg-yellow-50 text-yellow-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                    </div>
                  ))
                )}
              </div>
              {debugLogs.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    clearDebugLogs();
                    setDebugLogs([]);
                  }}
                  className="mt-3 text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Clear logs
                </button>
              )}
            </div>
          )}
        </div>
      </PageLayout>
    );
  }

  if (status === 'success') {
    return (
      <PageLayout
        title="Sign In Successful"
        subtitle="Check logs below, then navigate to dashboard"
      >
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 mb-4">Successfully signed in!</p>
            <button
              onClick={() => navigate('/dashboard', { replace: true })}
              className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
            >
              Go to Dashboard
            </button>
          </div>
        </div>

        {/* Debug Log Panel */}
        <div className="bg-white rounded-xl border border-gray-200">
          <button
            type="button"
            onClick={() => setShowDebug(!showDebug)}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold text-gray-900">Debug Logs</span>
            {showDebug ? (
              <ChevronUpIcon className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 text-gray-500" />
            )}
          </button>
          {showDebug && (
            <div className="p-4 max-h-96 overflow-y-auto border-t border-gray-200">
              <div className="space-y-1 text-xs font-mono">
                {debugLogs.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No logs yet...</p>
                ) : (
                  debugLogs.map((log, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded ${
                        log.type === 'error'
                          ? 'bg-red-50 text-red-700'
                          : log.type === 'warn'
                          ? 'bg-yellow-50 text-yellow-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                    </div>
                  ))
                )}
              </div>
              {debugLogs.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    clearDebugLogs();
                    setDebugLogs([]);
                  }}
                  className="mt-3 text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Clear logs
                </button>
              )}
            </div>
          )}
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Sign In Failed"
      subtitle="Check logs below for details"
    >
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-4">
        <div className="text-center">
          <p className="text-sm text-red-600 mb-4">Failed to complete sign in. Please try again.</p>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
          >
            Back to Login
          </button>
        </div>
      </div>

      {/* Debug Log Panel */}
      <div className="bg-white rounded-xl border border-gray-200">
        <button
          type="button"
          onClick={() => setShowDebug(!showDebug)}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <span className="font-semibold text-gray-900">Debug Logs</span>
          {showDebug ? (
            <ChevronUpIcon className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDownIcon className="w-5 h-5 text-gray-500" />
          )}
        </button>
        {showDebug && (
          <div className="p-4 max-h-96 overflow-y-auto border-t border-gray-200">
            <div className="space-y-1 text-xs font-mono">
              {debugLogs.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No logs yet...</p>
              ) : (
                debugLogs.map((log, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded ${
                      log.type === 'error'
                        ? 'bg-red-50 text-red-700'
                        : log.type === 'warn'
                        ? 'bg-yellow-50 text-yellow-700'
                        : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                  </div>
                ))
              )}
            </div>
            {debugLogs.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  clearDebugLogs();
                  setDebugLogs([]);
                }}
                className="mt-3 text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Clear logs
              </button>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}

