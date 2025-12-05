import { useState, useEffect } from 'react';

const STORAGE_KEY = 'balance_visibility';

/**
 * Hook to manage balance visibility (hide/show balances)
 */
export function useBalanceVisibility() {
  const [isVisible, setIsVisible] = useState(() => {
    // Default to visible (true)
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored !== null ? stored === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, isVisible.toString());
  }, [isVisible]);

  const toggle = () => {
    setIsVisible(prev => !prev);
  };

  return {
    isVisible,
    toggle,
    setIsVisible,
  };
}

