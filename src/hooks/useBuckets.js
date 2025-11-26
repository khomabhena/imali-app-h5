import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook to fetch buckets
 * Buckets are shared definitions, so all users see the same buckets
 */
export function useBuckets() {
  const [buckets, setBuckets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBuckets();
  }, []);

  const fetchBuckets = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('buckets')
        .select('*')
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;

      setBuckets(data || []);
    } catch (err) {
      console.error('Error fetching buckets:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { buckets, loading, error, refetch: fetchBuckets };
}

