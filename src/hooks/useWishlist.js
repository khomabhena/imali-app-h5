import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook to fetch and manage wishlist items
 */
export function useWishlist(filters = {}) {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { bucketId = 'all', currency = 'USD' } = filters;

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [user, bucketId, currency]);

  const fetchWishlist = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('wishlist_items')
        .select(`
          *,
          bucket:buckets(*)
        `)
        .eq('user_id', user.id)
        .eq('currency_code', currency)
        .is('purchased_at', null) // Only show unpurchased items
        .order('priority', { ascending: true })
        .order('created_at', { ascending: false });

      if (bucketId !== 'all') {
        query = query.eq('bucket_id', bucketId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setWishlistItems(data || []);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createWishlistItem = async (itemData) => {
    if (!user) return { error: 'No user found' };

    try {
      setError(null);

      const item = {
        ...itemData,
        user_id: user.id,
      };

      const { data, error: insertError } = await supabase
        .from('wishlist_items')
        .insert(item)
        .select(`
          *,
          bucket:buckets(*)
        `)
        .single();

      if (insertError) throw insertError;

      // Add to local state
      setWishlistItems((prev) => [data, ...prev]);

      return { data, error: null };
    } catch (err) {
      console.error('Error creating wishlist item:', err);
      const errorMessage = err.message || 'Failed to create wishlist item';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  const updateWishlistItem = async (itemId, updates) => {
    if (!user) return { error: 'No user found' };

    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from('wishlist_items')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', itemId)
        .eq('user_id', user.id)
        .select(`
          *,
          bucket:buckets(*)
        `)
        .single();

      if (updateError) throw updateError;

      // Update local state
      setWishlistItems((prev) =>
        prev.map((item) => (item.id === itemId ? data : item))
      );

      return { data, error: null };
    } catch (err) {
      console.error('Error updating wishlist item:', err);
      const errorMessage = err.message || 'Failed to update wishlist item';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  const deleteWishlistItem = async (itemId) => {
    if (!user) return { error: 'No user found' };

    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Remove from local state
      setWishlistItems((prev) => prev.filter((item) => item.id !== itemId));

      return { error: null };
    } catch (err) {
      console.error('Error deleting wishlist item:', err);
      const errorMessage = err.message || 'Failed to delete wishlist item';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const markAsPurchased = async (itemId) => {
    return updateWishlistItem(itemId, {
      purchased_at: new Date().toISOString(),
    });
  };

  return {
    wishlistItems,
    loading,
    error,
    createWishlistItem,
    updateWishlistItem,
    deleteWishlistItem,
    markAsPurchased,
    refetch: fetchWishlist,
  };
}

