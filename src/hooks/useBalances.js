import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook to fetch user balances for a specific currency
 */
export function useBalances(currency = 'USD') {
  const { user } = useAuth();
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchBalances();
    } else {
      setLoading(false);
    }
  }, [user, currency]);

  const fetchBalances = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('balances')
        .select(`
          *,
          bucket:buckets(*)
        `)
        .eq('user_id', user.id)
        .eq('currency_code', currency);

      if (fetchError) throw fetchError;

      setBalances(data || []);
    } catch (err) {
      console.error('Error fetching balances:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getBalanceByBucket = (bucketId) => {
    const balance = balances.find((b) => b.bucket_id === bucketId);
    return balance?.balance || 0;
  };

  const updateBalance = async (bucketId, newBalance) => {
    if (!user) return { error: 'No user found' };

    try {
      // Use upsert to create or update balance
      const { data, error: upsertError } = await supabase
        .from('balances')
        .upsert(
          {
            user_id: user.id,
            bucket_id: bucketId,
            currency_code: currency,
            balance: newBalance,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,bucket_id,currency_code',
          }
        )
        .select()
        .single();

      if (upsertError) throw upsertError;

      // Update local state
      setBalances((prev) => {
        const existing = prev.findIndex(
          (b) => b.bucket_id === bucketId
        );
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = { ...updated[existing], ...data };
          return updated;
        }
        return [...prev, data];
      });

      return { data, error: null };
    } catch (err) {
      console.error('Error updating balance:', err);
      return { data: null, error: err.message };
    }
  };

  return {
    balances,
    loading,
    error,
    getBalanceByBucket,
    updateBalance,
    refetch: fetchBalances,
  };
}

