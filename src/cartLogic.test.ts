/**
 * Tests for cart utility functions and calculations.
 * 
 * These tests verify the pure functions that handle cart logic,
 * separate from React components.
 */

import { describe, it, expect } from 'vitest';
import type { Product, CartItem, CartState, Discount } from './types';
import { createProductId } from './types';
import { 
  calculateItemSubtotal, 
  calculateDiscountAmount, 
  calculateCartTotals,
  validatePromoCode,
  calculateItemCount
} from './utils/cartCalculations';
import { formatCurrency, roundToTwoDecimals } from './utils/currency';
import { PROMO_CODES } from './data';

// Test fixtures
const createTestProduct = (id: number, name: string, price: number): Product => ({
  id: createProductId(id),
  name,
  price,
});

const testProduct = createTestProduct(1, 'Test Product', 10.99);
const testProduct2 = createTestProduct(2, 'Product 2', 5.99);

describe('calculateItemSubtotal', () => {
  it('should calculate subtotal for single item correctly', () => {
    const item: CartItem = { product: testProduct, quantity: 2 };
    expect(calculateItemSubtotal(item)).toBe(21.98);
  });

  it('should handle quantity of 1', () => {
    const item: CartItem = { product: testProduct, quantity: 1 };
    expect(calculateItemSubtotal(item)).toBe(10.99);
  });

  it('should handle decimal prices correctly', () => {
    const product = createTestProduct(3, 'Decimal', 3.33);
    const item: CartItem = { product, quantity: 3 };
    // 3.33 * 3 = 9.99
    expect(calculateItemSubtotal(item)).toBe(9.99);
  });
});

describe('calculateDiscountAmount', () => {
  it('should calculate percentage discount correctly', () => {
    const discount: Discount = { type: 'percentage', value: 15 };
    const result = calculateDiscountAmount(100, discount);
    expect(result).toBe(15);
  });

  it('should calculate fixed discount correctly', () => {
    const discount: Discount = { type: 'fixed', value: 10 };
    const result = calculateDiscountAmount(100, discount);
    expect(result).toBe(10);
  });

  it('should not exceed subtotal for fixed discount', () => {
    const discount: Discount = { type: 'fixed', value: 50 };
    const result = calculateDiscountAmount(30, discount);
    expect(result).toBe(30); // Capped at subtotal
  });

  it('should return 0 when discount is null', () => {
    const result = calculateDiscountAmount(100, null);
    expect(result).toBe(0);
  });

  it('should handle percentage discount on small amounts', () => {
    const discount: Discount = { type: 'percentage', value: 15 };
    const result = calculateDiscountAmount(5.99, discount);
    expect(result).toBeCloseTo(0.90, 2);
  });
});

describe('calculateItemCount', () => {
  it('should return 0 for empty cart', () => {
    expect(calculateItemCount([])).toBe(0);
  });

  it('should count total items across all cart items', () => {
    const items: CartItem[] = [
      { product: testProduct, quantity: 2 },
      { product: testProduct2, quantity: 3 },
    ];
    expect(calculateItemCount(items)).toBe(5);
  });
});

describe('calculateCartTotals', () => {
  it('should calculate totals for empty cart', () => {
    const state: CartState = { items: [], appliedPromoCode: null };
    const totals = calculateCartTotals(state);
    
    expect(totals.subtotal).toBe(0);
    expect(totals.discountAmount).toBe(0);
    expect(totals.total).toBe(0);
    expect(totals.itemCount).toBe(0);
  });

  it('should calculate totals without discount', () => {
    const state: CartState = {
      items: [
        { product: testProduct, quantity: 2 }, // 21.98
        { product: testProduct2, quantity: 1 }, // 5.99
      ],
      appliedPromoCode: null,
    };
    const totals = calculateCartTotals(state);
    
    expect(totals.subtotal).toBe(27.97);
    expect(totals.discountAmount).toBe(0);
    expect(totals.total).toBe(27.97);
    expect(totals.itemCount).toBe(3);
  });

  it('should calculate totals with percentage discount', () => {
    const state: CartState = {
      items: [{ product: testProduct, quantity: 2 }], // 21.98
      appliedPromoCode: PROMO_CODES[0], // SAVE15 - 15%
    };
    const totals = calculateCartTotals(state);
    
    expect(totals.subtotal).toBe(21.98);
    expect(totals.discountAmount).toBeCloseTo(3.30, 2);
    expect(totals.total).toBeCloseTo(18.68, 2);
  });

  it('should calculate totals with fixed discount', () => {
    const state: CartState = {
      items: [{ product: testProduct, quantity: 2 }], // 21.98
      appliedPromoCode: PROMO_CODES[1], // SAVE10 - $10
    };
    const totals = calculateCartTotals(state);
    
    expect(totals.subtotal).toBe(21.98);
    expect(totals.discountAmount).toBe(10);
    expect(totals.total).toBe(11.98);
  });

  it('should not allow negative total', () => {
    const cheapProduct = createTestProduct(3, 'Cheap', 5.00);
    const state: CartState = {
      items: [{ product: cheapProduct, quantity: 1 }], // 5.00
      appliedPromoCode: PROMO_CODES[1], // SAVE10 - $10
    };
    const totals = calculateCartTotals(state);
    
    expect(totals.subtotal).toBe(5);
    expect(totals.discountAmount).toBe(5); // Capped at subtotal
    expect(totals.total).toBe(0);
  });
});

describe('validatePromoCode', () => {
  it('should return promo code for valid code', () => {
    const result = validatePromoCode('SAVE15', PROMO_CODES);
    expect(result).not.toBeNull();
    expect(result?.code).toBe('SAVE15');
  });

  it('should be case insensitive', () => {
    const result = validatePromoCode('save15', PROMO_CODES);
    expect(result).not.toBeNull();
    expect(result?.code).toBe('SAVE15');
  });

  it('should trim whitespace', () => {
    const result = validatePromoCode('  SAVE15  ', PROMO_CODES);
    expect(result).not.toBeNull();
  });

  it('should return null for invalid code', () => {
    const result = validatePromoCode('INVALID', PROMO_CODES);
    expect(result).toBeNull();
  });

  it('should return null for empty string', () => {
    const result = validatePromoCode('', PROMO_CODES);
    expect(result).toBeNull();
  });
});

describe('formatCurrency', () => {
  it('should format positive amounts', () => {
    expect(formatCurrency(10.99)).toBe('$10.99');
  });

  it('should format zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('should format large amounts with commas', () => {
    expect(formatCurrency(1000)).toBe('$1,000.00');
  });
});

describe('roundToTwoDecimals', () => {
  it('should round correctly', () => {
    expect(roundToTwoDecimals(10.999)).toBe(11);
    expect(roundToTwoDecimals(10.994)).toBe(10.99);
    expect(roundToTwoDecimals(10.995)).toBe(11);
  });
});
