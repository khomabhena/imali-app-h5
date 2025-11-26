import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook to fetch and update user settings
 */
export function useSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchSettings();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        // If settings don't exist, create default settings
        if (fetchError.code === 'PGRST116') {
          await createDefaultSettings();
          return;
        }
        throw fetchError;
      }

      setSettings(data);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const ensureProfileExists = async () => {
    if (!user) return false;

    try {
      // Check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      // If profile exists, return true
      if (existingProfile && !checkError) {
        return true;
      }

      // If profile doesn't exist (PGRST116 = no rows returned), create it
      if (checkError && checkError.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
          });

        if (insertError) {
          console.error('Error creating profile:', insertError);
          return false;
        }
        return true;
      }

      // Other error
      if (checkError) {
        console.error('Error checking profile:', checkError);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error ensuring profile exists:', err);
      return false;
    }
  };

  const createDefaultSettings = async () => {
    if (!user) return;

    try {
      // Ensure profile exists first
      const profileExists = await ensureProfileExists();
      if (!profileExists) {
        throw new Error('Failed to create or verify profile');
      }

      const defaultSettings = {
        user_id: user.id,
        default_mode: 'intermediate',
        default_currency: 'USD',
        locale: 'en-US',
      };

      const { data, error: insertError } = await supabase
        .from('settings')
        .insert(defaultSettings)
        .select()
        .single();

      if (insertError) throw insertError;

      setSettings(data);
    } catch (err) {
      console.error('Error creating default settings:', err);
      setError(err.message);
    }
  };

  const updateSettings = async (updates) => {
    if (!user || !settings) return { error: 'No user or settings found' };

    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from('settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setSettings(data);
      return { data, error: null };
    } catch (err) {
      console.error('Error updating settings:', err);
      const errorMessage = err.message || 'Failed to update settings';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  return {
    settings,
    loading,
    error,
    updateSettings,
    refetch: fetchSettings,
  };
}

