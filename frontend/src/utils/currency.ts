/**
 * Formats a monetary number into Indian Rupee format (₹) with Indian digit grouping (e.g. ₹1,500 or ₹1,50,000).
 */
export function formatINR(
  amount: number | string | undefined | null,
  options?: { showDecimals?: boolean; compact?: boolean }
): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (num === null || num === undefined || isNaN(num)) {
    return '₹0';
  }

  if (options?.compact && Math.abs(num) >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (options?.compact && Math.abs(num) >= 100000) {
    return `₹${(num / 100000).toFixed(2)} Lakh`;
  }

  return `₹${num.toLocaleString('en-IN', {
    maximumFractionDigits: options?.showDecimals ? 2 : 0,
    minimumFractionDigits: options?.showDecimals ? 2 : 0,
  })}`;
}

/**
 * Formats companion hourly rate with Indian currency symbol.
 * Example: formatRate(1500) -> '₹1,500/hr'
 */
export function formatRate(rate: number | string | undefined | null): string {
  return `${formatINR(rate)}/hr`;
}

