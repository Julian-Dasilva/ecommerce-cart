/**
 * Static data for the application.
 * 
 * In a real application, this would come from:
 * - REST API / GraphQL endpoint
 * - Database
 * - CMS
 * 
 * Using `as const` assertions where possible for:
 * - Readonly arrays (prevents accidental mutations)
 * - Literal types (better type inference)
 */

import type { Product, PromoCode } from './types';
import { createProductId } from './types';

/**
 * Available products in the store.
 * Marked as readonly to prevent accidental mutations.
 */
export const PRODUCTS: readonly Product[] = [
  { id: createProductId(1), name: "Shampoo", price: 24.99 },
  { id: createProductId(2), name: "Conditioner", price: 24.99 },
  { id: createProductId(3), name: "Hair Color", price: 34.99 },
  { id: createProductId(4), name: "Styling Serum", price: 19.99 },
] as const;

/**
 * Available promotional codes.
 * 
 * Note: In production, promo code validation would happen server-side
 * to prevent users from discovering valid codes through client-side inspection.
 */
export const PROMO_CODES: readonly PromoCode[] = [
  { 
    code: "SAVE15", 
    discount: { type: 'percentage', value: 15 },
    displayText: "15% off"
  },
  { 
    code: "SAVE10", 
    discount: { type: 'fixed', value: 10 },
    displayText: "$10 off"
  },
] as const;

/**
 * Helper to find a product by ID.
 * Returns undefined if not found (caller must handle).
 */
export const findProductById = (id: number): Product | undefined => {
  return PRODUCTS.find(p => p.id === id);
};
