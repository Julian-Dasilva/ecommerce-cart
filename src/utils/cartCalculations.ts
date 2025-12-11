/**
 * Pure functions for cart calculations.
 * 
 * Design Philosophy:
 * - All functions are pure (no side effects, same input = same output)
 * - Easy to test in isolation
 * - Can be memoized if performance becomes an issue
 * - Separated from React to enable reuse (e.g., server-side calculations)
 */

import type { CartItem, CartState, CartTotals, Discount, PromoCode } from '../types';
import { roundToTwoDecimals } from './currency';

/**
 * Calculates the subtotal for a single cart item.
 */
export const calculateItemSubtotal = (item: CartItem): number => {
  return roundToTwoDecimals(item.product.price * item.quantity);
};

/**
 * Calculates the discount amount based on discount type.
 * 
 * @param subtotal - The cart subtotal before discount
 * @param discount - The discount to apply
 * @returns The discount amount (never exceeds subtotal)
 */
export const calculateDiscountAmount = (
  subtotal: number,
  discount: Discount | null
): number => {
  if (!discount) return 0;

  let discountAmount: number;

  switch (discount.type) {
    case 'percentage':
      discountAmount = (subtotal * discount.value) / 100;
      break;
    case 'fixed':
      discountAmount = discount.value;
      break;
    default:
      // TypeScript exhaustiveness check - this should never happen
      const _exhaustiveCheck: never = discount;
      return _exhaustiveCheck;
  }

  // Discount cannot exceed subtotal (no negative totals)
  return roundToTwoDecimals(Math.min(discountAmount, subtotal));
};

/**
 * Calculates total item count in cart.
 */
export const calculateItemCount = (items: readonly CartItem[]): number => {
  return items.reduce((count, item) => count + item.quantity, 0);
};

/**
 * Calculates all cart totals from cart state.
 * This is the main calculation function used by the cart hook.
 */
export const calculateCartTotals = (state: CartState): CartTotals => {
  const subtotal = roundToTwoDecimals(
    state.items.reduce((sum, item) => sum + calculateItemSubtotal(item), 0)
  );

  const discountAmount = calculateDiscountAmount(
    subtotal,
    state.appliedPromoCode?.discount ?? null
  );

  const total = roundToTwoDecimals(Math.max(0, subtotal - discountAmount));
  const itemCount = calculateItemCount(state.items);

  return {
    subtotal,
    discountAmount,
    total,
    itemCount,
  };
};

/**
 * Validates a promo code against available codes.
 * Returns the matching PromoCode or null if invalid.
 */
export const validatePromoCode = (
  code: string,
  availableCodes: readonly PromoCode[]
): PromoCode | null => {
  const normalizedCode = code.trim().toUpperCase();
  return availableCodes.find(pc => pc.code === normalizedCode) ?? null;
};

