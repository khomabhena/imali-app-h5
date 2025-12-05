import { supabase } from '../lib/supabase';

/**
 * Service to handle expense deductions from buckets
 */

/**
 * Deduct expense from bucket balance
 * @param {Object} params
 * @param {string} params.userId - User ID
 * @param {string} params.expenseId - Expense ID
 * @param {string} params.bucketId - Bucket ID to deduct from
 * @param {number} params.amount - Amount to deduct (use paid_amount for incremental)
 * @param {string} params.currency - Currency code
 * @param {string} params.expenseName - Name of the expense
 * @param {boolean} params.isIncremental - Whether this is an incremental payment
 * @returns {Promise<{data: any, error: string|null}>}
 */
export async function deductExpenseFromBucket({
  userId,
  expenseId,
  bucketId,
  amount,
  currency,
  expenseName,
  isIncremental = false,
}) {
  try {
    if (!bucketId) {
      return {
        data: null,
        error: 'Bucket ID is required',
      };
    }

    if (amount <= 0) {
      return {
        data: null,
        error: 'Amount must be greater than 0',
      };
    }

    // 1. Get current bucket balance
    const { data: balance, error: balanceError } = await supabase
      .from('balances')
      .select('balance')
      .eq('user_id', userId)
      .eq('bucket_id', bucketId)
      .eq('currency_code', currency)
      .single();

    if (balanceError && balanceError.code !== 'PGRST116') {
      throw balanceError;
    }

    const currentBalance = balance?.balance || 0;

    // 2. Allow negative balance (deficit carries forward)
    // No balance check - expenses can exceed allocated amount

    // 3. Create expense transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'expense',
        amount: -amount, // Negative for expense
        currency_code: currency,
        bucket_id: bucketId,
        item_name: expenseName,
        category: 'Expense Deduction',
        note: isIncremental ? 'Incremental payment' : 'Full payment',
        date: new Date().toISOString(),
      })
      .select()
      .single();

    if (transactionError) throw transactionError;

    // 4. Update bucket balance
    const newBalance = currentBalance - amount;

    const { error: balanceUpdateError } = await supabase
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

    if (balanceUpdateError) throw balanceUpdateError;

    return {
      data: {
        transaction,
        newBalance,
        previousBalance: currentBalance,
      },
      error: null,
    };
  } catch (err) {
    console.error('Error deducting expense from bucket:', err);
    return {
      data: null,
      error: {
        code: 'DEDUCTION_ERROR',
        message: err.message || 'Failed to deduct expense from bucket',
      },
    };
  }
}

/**
 * Get or create Expenses bucket
 */
async function getExpensesBucket() {
  let { data: expensesBucket, error } = await supabase
    .from('buckets')
    .select('*')
    .eq('name', 'Expenses')
    .single();

  if (error && error.code === 'PGRST116') {
    // Create Expenses bucket if it doesn't exist
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
    return newBucket;
  }

  if (error) throw error;
  return expensesBucket;
}

/**
 * Process expense deduction when expense is created or updated
 * This should be called after creating/updating an expense
 * Always uses Expense Bucket automatically
 */
export async function processExpenseDeduction({
  userId,
  expense,
  previousExpense = null,
}) {
  try {
    // Only process if expense is active
    if (!expense.active) {
      return { data: null, error: null }; // No deduction needed
    }

    // Get Expense Bucket automatically
    const expensesBucket = await getExpensesBucket();

    const amountToDeduct = expense.paid_amount !== undefined && expense.paid_amount !== null
      ? expense.paid_amount
      : expense.amount;
    const isIncremental = expense.paid_amount !== undefined && expense.paid_amount !== null && expense.paid_amount < expense.amount;

    // If updating and previous expense existed, calculate the difference
    let deductionAmount = amountToDeduct;
    if (previousExpense) {
      const previousPaid = previousExpense.paid_amount !== undefined && previousExpense.paid_amount !== null
        ? previousExpense.paid_amount
        : (previousExpense.amount || 0);
      deductionAmount = amountToDeduct - previousPaid;
      
      // If amount decreased (refund scenario), skip deduction
      if (deductionAmount < 0) {
        return { data: null, error: null };
      }
    }

    if (deductionAmount <= 0) {
      return { data: null, error: null }; // No deduction needed
    }

    // Deduct from Expense Bucket
    return await deductExpenseFromBucket({
      userId,
      expenseId: expense.id,
      bucketId: expensesBucket.id,
      amount: deductionAmount,
      currency: expense.currency_code,
      expenseName: expense.name,
      isIncremental,
    });
  } catch (err) {
    console.error('Error processing expense deduction:', err);
    return {
      data: null,
      error: err.message || 'Failed to process expense deduction',
    };
  }
}

/**
 * Update incremental payment on expense
 * Deducts only the additional amount paid
 */
export async function updateIncrementalPayment({
  userId,
  expenseId,
  additionalAmount,
  currency,
}) {
  try {
    // Get expense details
    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', expenseId)
      .eq('user_id', userId)
      .single();

    if (expenseError) throw expenseError;

    // Get Expense Bucket automatically
    const expensesBucket = await getExpensesBucket();

    // Deduct the additional amount from Expense Bucket
    return await deductExpenseFromBucket({
      userId,
      expenseId: expense.id,
      bucketId: expensesBucket.id,
      amount: additionalAmount,
      currency: currency || expense.currency_code,
      expenseName: expense.name,
      isIncremental: true,
    });
  } catch (err) {
    console.error('Error updating incremental payment:', err);
    return {
      data: null,
      error: err.message || 'Failed to update incremental payment',
    };
  }
}

