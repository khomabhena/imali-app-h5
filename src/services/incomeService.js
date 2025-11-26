import { supabase } from '../lib/supabase';

/**
 * Service to handle income recording and allocation
 */
export async function recordIncome({
  userId,
  amount,
  currency = 'USD',
  date = new Date().toISOString(),
  note = '',
  source = '',
}) {
  try {
    // 1. Get active expenses for the currency
    const { data: activeExpenses, error: expensesError } = await supabase
      .from('expenses')
      .select('amount')
      .eq('user_id', userId)
      .eq('currency_code', currency)
      .eq('active', true);

    if (expensesError) throw expensesError;

    const totalExpenses = activeExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

    // 2. Calculate net after expenses
    const netAfterExpenses = amount - totalExpenses;

    // 3. Get buckets (excluding Savings)
    const { data: buckets, error: bucketsError } = await supabase
      .from('buckets')
      .select('*')
      .neq('name', 'Savings')
      .order('display_order');

    if (bucketsError) throw bucketsError;

    // 4. Get Savings bucket
    const { data: savingsBucket, error: savingsError } = await supabase
      .from('buckets')
      .select('*')
      .eq('name', 'Savings')
      .single();

    if (savingsError) throw savingsError;

    // 5. Create income transaction
    const { data: incomeTransaction, error: incomeError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'income',
        amount: amount,
        currency_code: currency,
        bucket_id: null,
        item_name: source || 'Income',
        note: note,
        date: date,
      })
      .select()
      .single();

    if (incomeError) throw incomeError;

    // 6. Reserve expenses (if any)
    if (totalExpenses > 0) {
      const { error: reserveError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'reserve',
          amount: -totalExpenses,
          currency_code: currency,
          bucket_id: null,
          item_name: 'Expenses Reserve',
          note: `Reserved for ${activeExpenses.length} active expense(s)`,
          date: date,
        });

      if (reserveError) throw reserveError;
    }

    // 7. Allocate to buckets
    const allocations = [];
    let totalAllocated = 0;

    for (const bucket of buckets) {
      let allocationAmount = 0;

      if (bucket.name === 'Necessity') {
        // Necessity gets 60% of netAfterExpenses
        allocationAmount = netAfterExpenses * 0.6;
      } else {
        // Others get 10% each
        allocationAmount = netAfterExpenses * 0.1;
      }

      allocations.push({
        bucket,
        amount: allocationAmount,
      });
      totalAllocated += allocationAmount;
    }

    // 8. Calculate savings (remainder)
    const savingsAmount = netAfterExpenses - totalAllocated;

    // 9. Create allocation transactions and update balances
    const transactions = [];

    for (const { bucket, amount: allocationAmount } of allocations) {
      // Create transaction
      const { data: transaction, error: transError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'sweep',
          amount: allocationAmount,
          currency_code: currency,
          bucket_id: bucket.id,
          item_name: `Allocation to ${bucket.name}`,
          note: `${bucket.allocation_pct}% allocation`,
          date: date,
        })
        .select()
        .single();

      if (transError) throw transError;
      transactions.push(transaction);

      // Update balance
      await updateBalance(userId, bucket.id, currency, allocationAmount);
    }

    // 10. Handle Savings
    if (savingsAmount !== 0) {
      const { data: savingsTransaction, error: savingsTransError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'sweep',
          amount: savingsAmount,
          currency_code: currency,
          bucket_id: savingsBucket.id,
          item_name: 'Savings Allocation',
          note: 'Remainder after bucket allocations',
          date: date,
        })
        .select()
        .single();

      if (savingsTransError) throw savingsTransError;
      transactions.push(savingsTransaction);

      // Update savings balance
      await updateBalance(userId, savingsBucket.id, currency, savingsAmount);
    }

    return {
      data: {
        incomeTransaction,
        allocations,
        savingsAmount,
        totalExpenses,
        netAfterExpenses,
      },
      error: null,
    };
  } catch (err) {
    console.error('Error recording income:', err);
    return {
      data: null,
      error: err.message || 'Failed to record income',
    };
  }
}

/**
 * Helper function to update balance
 */
async function updateBalance(userId, bucketId, currency, amountChange) {
  try {
    // Get current balance
    const { data: currentBalance, error: fetchError } = await supabase
      .from('balances')
      .select('balance')
      .eq('user_id', userId)
      .eq('bucket_id', bucketId)
      .eq('currency_code', currency)
      .single();

    const currentBalanceValue = currentBalance?.balance || 0;
    const newBalance = currentBalanceValue + amountChange;

    // Upsert balance
    const { error: upsertError } = await supabase
      .from('balances')
      .upsert(
        {
          user_id: userId,
          bucket_id: bucketId,
          currency_code: currency,
          balance: newBalance,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,bucket_id,currency_code',
        }
      );

    if (upsertError) throw upsertError;

    return { error: null };
  } catch (err) {
    console.error('Error updating balance:', err);
    return { error: err.message };
  }
}

