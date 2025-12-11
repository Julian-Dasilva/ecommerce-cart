/**
 * Core domain types for the ecommerce cart application.
 * 
 * Design Decisions:
 * - Product IDs are branded types for type safety (prevents mixing with other numbers)
 * - Prices are stored as numbers (cents could be used for precision in production)
 * - Discounts use discriminated unions for type-safe handling
 */

// Branded type for Product IDs - prevents accidentally passing wrong IDs this is why typescript is amazing
export type ProductId = number & { readonly brand: unique symbol };

// Helper to create ProductId (in real app, this would come from API)
export const createProductId = (id: number): ProductId => id as ProductId;

export interface Product {
  readonly id: ProductId;
  readonly name: string;
  readonly price: number;
}

export interface CartItem {
  readonly product: Product;
  readonly quantity: number;
}

/**
 * Discriminated union for discount types.
 * This provides type safety when handling different discount calculations.
 * It also enables us to extend to new discount types later while maintaing branch logic type safety.
 * Since typescript will FORCE us to implmement all cases, we can't forget to handle a new discount type.
 * IE: if I add a new discount type in the switch statement this will error until we handle it
 */
export type Discount = 
  | { readonly type: 'percentage'; readonly value: number }  // e.g., 15 for 15%
  | { readonly type: 'fixed'; readonly value: number };      // e.g., 10 for $10

export interface PromoCode {
  readonly code: string;
  readonly discount: Discount;
  readonly displayText: string; // Human-readable format like "15%" or "$10"
}

export interface CartTotals {
  readonly subtotal: number;
  readonly discountAmount: number;
  readonly total: number;
  readonly itemCount: number;
}

/**
 * Cart state - immutable structure for React state management.
 * All mutations return new objects rather than modifying in place.
 */
export interface CartState {
  readonly items: readonly CartItem[];
  readonly appliedPromoCode: PromoCode | null;
}

/**
 * Action types for cart reducer - exhaustive union for type safety.
 * Using discriminated unions ensures all actions are handled.
 * This is a simple but powerful example where we want to bias towards describing what happened not how to update state
 * This discrimianted union 
*/
export type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { productId: ProductId } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: ProductId; quantity: number } }
  | { type: 'APPLY_PROMO'; payload: { promoCode: PromoCode } }
  | { type: 'REMOVE_PROMO' }
  | { type: 'CLEAR_CART' };
