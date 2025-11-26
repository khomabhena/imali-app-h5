import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook to fetch and manage expenses
 */
export function useExpenses(filters = {}) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { active = 'all', currency = 'USD' } = filters;

  useEffect(() => {
    if (user) {
      fetchExpenses();
    } else {
      setLoading(false);
    }
  }, [user, active, currency]);

  const fetchExpenses = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .eq('currency_code', currency)
        .order('created_at', { ascending: false });

      if (active === 'active') {
        query = query.eq('active', true);
      } else if (active === 'inactive') {
        query = query.eq('active', false);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setExpenses(data || []);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createExpense = async (expenseData) => {
    if (!user) return { error: 'No user found' };

    try {
      setError(null);

      const expense = {
        ...expenseData,
        user_id: user.id,
      };

      const { data, error: insertError } = await supabase
        .from('expenses')
        .insert(expense)
        .select()
        .single();

      if (insertError) throw insertError;

      // Add to local state
      setExpenses((prev) => [data, ...prev]);

      return { data, error: null };
    } catch (err) {
      console.error('Error creating expense:', err);
      const errorMessage = err.message || 'Failed to create expense';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  const updateExpense = async (expenseId, updates) => {
    if (!user) return { error: 'No user found' };

    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from('expenses')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', expenseId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update local state
      setExpenses((prev) =>
        prev.map((exp) => (exp.id === expenseId ? data : exp))
      );

      return { data, error: null };
    } catch (err) {
      console.error('Error updating expense:', err);
      const errorMessage = err.message || 'Failed to update expense';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  const deleteExpense = async (expenseId) => {
    if (!user) return { error: 'No user found' };

    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Remove from local state
      setExpenses((prev) => prev.filter((exp) => exp.id !== expenseId));

      return { error: null };
    } catch (err) {
      console.error('Error deleting expense:', err);
      const errorMessage = err.message || 'Failed to delete expense';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const toggleActive = async (expenseId, isActive) => {
    return updateExpense(expenseId, { active: isActive });
  };

  return {
    expenses,
    loading,
    error,
    createExpense,
    updateExpense,
    deleteExpense,
    toggleActive,
    refetch: fetchExpenses,
  };
}

