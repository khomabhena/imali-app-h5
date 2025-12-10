import { supabase } from '../lib/supabase';

/**
 * Service to handle purchase recording
 */
export async function recordPurchase({
  userId,
  amount,
  bucketId,
  currency = 'USD',
  itemName = '',
  category = '',
  note = '',
  date = new Date().toISOString(),
}) {
  try {
    // 1. Get bucket and current balance
    const { data: bucket, error: bucketError } = await supabase
      .from('buckets')
      .select('*')
      .eq('id', bucketId)
      .single();

    if (bucketError) throw bucketError;

    const { data: balance, error: balanceError } = await supabase
      .from('balances')
      .select('balance')
      .eq('user_id', userId)
      .eq('bucket_id', bucketId)
      .eq('currency_code', currency)
      .single();

    const currentBalance = balance?.balance || 0;

    // 2. Get user settings to check mode
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('default_mode')
      .eq('user_id', userId)
      .single();

    if (settingsError && settingsError.code !== 'PGRST116') {
      throw settingsError;
    }

    const mode = settings?.default_mode || 'intermediate';

    // 3. Check affordability
    const limiter = getLimiter(bucket, mode);
    const requiredBalance = amount * limiter;

    if (currentBalance < requiredBalance) {
      return {
        data: null,
        error: {
          code: 'AFFORDABILITY_BLOCKED',
          message: 'Purchase blocked: insufficient balance',
          requiredBalance,
          currentBalance,
          maxAffordable: currentBalance / limiter,
          limiter,
        },
      };
    }

    // 4. Create expense transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'expense',
        amount: -amount, // Negative for expense
        currency_code: currency,
        bucket_id: bucketId,
        item_name: itemName,
        category: category,
        note: note,
        date: date,
      })
      .select()
      .single();

    if (transactionError) throw transactionError;

    // 5. Update balance
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
      },
      error: null,
    };
  } catch (err) {
    console.error('Error recording purchase:', err);
    return {
      data: null,
      error: {
        code: 'PURCHASE_ERROR',
        message: err.message || 'Failed to record purchase',
      },
    };
  }
}

/**
 * Get limiter for a bucket based on mode
 */
function getLimiter(bucket, mode) {
  switch (mode) {
    case 'light':
      return bucket.limiter_light;
    case 'intermediate':
      return bucket.limiter_intermediate;
    case 'strict':
      return bucket.limiter_strict;
    case 'desperate':
      return bucket.limiter_desperate || bucket.limiter_strict; // Fallback to strict if desperate not available
    default:
      return bucket.limiter_intermediate;
  }
}

