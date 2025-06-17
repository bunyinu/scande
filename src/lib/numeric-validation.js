// Numeric validation utilities for DeathCast
// Fixes numeric overflow errors and validates bet amounts

export const NUMERIC_LIMITS = {
  // For DECIMAL(10,2) fields - max value is 99,999,999.99
  MAX_AMOUNT: 99999999.99,
  MIN_AMOUNT: 0.01,
  
  // Safe betting limits (much lower than DB limit)
  MAX_BET: 10000.00,
  MIN_BET: 1.00,
  
  // Payout calculation limits
  MAX_PAYOUT: 50000.00,
  
  // Decimal places
  DECIMAL_PLACES: 2
};

export const validateBetAmount = (amount) => {
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount)) {
    return { valid: false, error: 'Amount must be a valid number' };
  }
  
  if (numAmount < NUMERIC_LIMITS.MIN_BET) {
    return { valid: false, error: `Minimum bet is $${NUMERIC_LIMITS.MIN_BET}` };
  }
  
  if (numAmount > NUMERIC_LIMITS.MAX_BET) {
    return { valid: false, error: `Maximum bet is $${NUMERIC_LIMITS.MAX_BET}` };
  }
  
  // Check decimal places
  const decimalPlaces = (numAmount.toString().split('.')[1] || '').length;
  if (decimalPlaces > NUMERIC_LIMITS.DECIMAL_PLACES) {
    return { valid: false, error: 'Amount can only have 2 decimal places' };
  }
  
  return { valid: true, amount: numAmount };
};

export const validatePayout = (payout) => {
  const numPayout = parseFloat(payout);
  
  if (isNaN(numPayout)) {
    return { valid: false, error: 'Payout must be a valid number' };
  }
  
  if (numPayout > NUMERIC_LIMITS.MAX_PAYOUT) {
    return { valid: false, error: `Maximum payout is $${NUMERIC_LIMITS.MAX_PAYOUT}` };
  }
  
  return { valid: true, payout: numPayout };
};

export const formatCurrency = (amount) => {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numAmount);
};

export const sanitizeNumericInput = (input) => {
  // Remove any non-numeric characters except decimal point
  const cleaned = input.toString().replace(/[^0-9.]/g, '');
  
  // Ensure only one decimal point
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Limit to 2 decimal places
  if (parts[1] && parts[1].length > 2) {
    return parts[0] + '.' + parts[1].substring(0, 2);
  }
  
  return cleaned;
};

export const calculateSafePayout = (betAmount, odds) => {
  const amount = parseFloat(betAmount);
  const multiplier = parseFloat(odds);
  
  if (isNaN(amount) || isNaN(multiplier)) return 0;
  
  const payout = amount * multiplier;
  
  // Cap at maximum payout
  return Math.min(payout, NUMERIC_LIMITS.MAX_PAYOUT);
};