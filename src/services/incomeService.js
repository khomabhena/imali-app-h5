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

    // 2. Get Expenses bucket (create if doesn't exist)
    let { data: expensesBucket, error: expensesBucketError } = await supabase
      .from('buckets')
      .select('*')
      .eq('name', 'Expenses')
      .single();

    if (expensesBucketError && expensesBucketError.code === 'PGRST116') {
      // Expenses bucket doesn't exist, create it
      const { data: newBucket, error: createError } = await supabase
        .from('buckets')
        .insert({
          name: 'Expenses',
          allocation_pct: 0,
          limiter_light: 1,
          limiter_intermediate: 1,
          limiter_strict: 1,
          color: '#8b5cf6',
          display_order: 7,
        })
        .select()
        .single();

      if (createError) throw createError;
      expensesBucket = newBucket;
    } else if (expensesBucketError) {
      throw expensesBucketError;
    }

    // 3. Calculate net after expenses
    const netAfterExpenses = amount - totalExpenses;

    // 4. Get buckets (excluding Savings and Expenses)
    const { data: buckets, error: bucketsError } = await supabase
      .from('buckets')
      .select('*')
      .neq('name', 'Savings')
      .neq('name', 'Expenses')
      .order('display_order');

    if (bucketsError) throw bucketsError;

    // 5. Get Savings bucket
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

    // 6. Allocate expenses to Expense Bucket (if any)
    let expensesAllocation = null;
    if (totalExpenses > 0) {
      // Create allocation transaction for Expense Bucket
      const { data: expensesTransaction, error: expensesTransError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'sweep',
          amount: totalExpenses,
          currency_code: currency,
          bucket_id: expensesBucket.id,
          item_name: 'Expenses Allocation',
          note: `Allocated for ${activeExpenses.length} active expense(s)`,
          date: date,
        })
        .select()
        .single();

      if (expensesTransError) throw expensesTransError;

      // Update Expense Bucket balance
      await updateBalance(userId, expensesBucket.id, currency, totalExpenses);

      expensesAllocation = {
        bucket: expensesBucket,
        amount: totalExpenses,
        transaction: expensesTransaction,
      };
    }

    // 7. Allocate to other buckets
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
        expensesAllocation,
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

