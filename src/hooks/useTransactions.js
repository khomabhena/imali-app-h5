import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook to fetch and create transactions
 */
export function useTransactions(filters = {}) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    type = 'all',
    bucketId = 'all',
    currency = 'USD',
    limit = 100,
    startDate = null,
    endDate = null,
  } = filters;

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('transactions')
        .select(`
          *,
          bucket:buckets(*)
        `)
        .eq('user_id', user.id)
        .eq('currency_code', currency)
        .order('date', { ascending: false })
        .limit(limit);

      if (type !== 'all') {
        query = query.eq('type', type);
      }

      if (bucketId !== 'all') {
        query = query.eq('bucket_id', bucketId);
      }

      if (startDate) {
        query = query.gte('date', startDate);
      }

      if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setTransactions(data || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, type, bucketId, currency, startDate, endDate]);

  const createTransaction = async (transactionData) => {
    if (!user) return { error: 'No user found' };

    try {
      setError(null);

      const transaction = {
        ...transactionData,
        user_id: user.id,
        date: transactionData.date || new Date().toISOString(),
      };

      const { data, error: insertError } = await supabase
        .from('transactions')
        .insert(transaction)
        .select(`
          *,
          bucket:buckets(*)
        `)
        .single();

      if (insertError) throw insertError;

      // Add to local state
      setTransactions((prev) => [data, ...prev]);

      return { data, error: null };
    } catch (err) {
      console.error('Error creating transaction:', err);
      const errorMessage = err.message || 'Failed to create transaction';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  return {
    transactions,
    loading,
    error,
    createTransaction,
    refetch: fetchTransactions,
  };
}

