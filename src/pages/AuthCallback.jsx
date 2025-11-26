/**
 * Auth Callback Page
 * Handles OAuth redirects from Supabase
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import PageLayout from '../components/layout/PageLayout';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Wait a moment for Supabase to process the URL hash
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get the session from the URL hash
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setStatus('error');
          setTimeout(() => {
            navigate('/login', { replace: true, state: { error: error.message } });
          }, 2000);
          return;
        }

        if (data?.session) {
          // Successfully authenticated
          setStatus('success');
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 1000);
        } else {
          // Check if there's an error in the URL
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const errorParam = hashParams.get('error');
          const errorDescription = hashParams.get('error_description');
          
          if (errorParam) {
            console.error('OAuth error:', errorParam, errorDescription);
            setStatus('error');
            setTimeout(() => {
              navigate('/login', { replace: true, state: { error: errorDescription || errorParam } });
            }, 2000);
          } else {
            // No session found and no error - might need to wait longer
            setStatus('error');
            setTimeout(() => {
              navigate('/login', { replace: true, state: { error: 'Authentication failed. Please try again.' } });
            }, 2000);
          }
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setStatus('error');
        setTimeout(() => {
          navigate('/login', { replace: true, state: { error: 'An unexpected error occurred.' } });
        }, 2000);
      }
    };

    // Also listen to auth state changes as a backup
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setStatus('success');
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1000);
      } else if (event === 'SIGNED_OUT') {
        setStatus('error');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
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
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-4"></div>
            <p className="text-sm text-gray-600">Completing your sign in...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (status === 'success') {
    return (
      <PageLayout
        title="Sign In Successful"
        subtitle="Redirecting to dashboard..."
      >
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">Successfully signed in!</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Sign In Failed"
      subtitle="Redirecting to login..."
    >
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="text-center">
          <p className="text-sm text-red-600">Failed to complete sign in. Please try again.</p>
        </div>
      </div>
    </PageLayout>
  );
}

