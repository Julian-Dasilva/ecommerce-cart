/**
 * App Component - Application Root
 * 
 * This is the main entry point that composes the application.
 * 
 * Architecture Decisions:
 * 
 * 1. State Management: useCart custom hook with useReducer
 *    - Centralizes all cart logic in one testable hook
 *    - Immutable state updates ensure React detects changes
 *    - Actions create a clear audit trail of state changes
 * 
 * 2. Component Composition:
 *    - App provides data and callbacks to child components
 *    - Children are mostly presentational (easy to test/reuse)
 *    - Clear data flow from parent to children (no prop drilling issues at this scale)
 * 
 * 3. Why Not Context/Redux?
 *    - App complexity doesn't warrant it yet
 *    - Prop drilling is fine for 2-3 levels
 *    - Easier to understand and debug
 *    - Can migrate to Context if needed later
 */

import React, { useCallback } from 'react';
import { useCart } from './hooks/useCart';
import { PRODUCTS, PROMO_CODES, findProductById } from './data';
import { ProductList } from './components/ProductList';
import { Cart } from './components/Cart';
import type { ProductId } from './types';

export const App = () => {
  const {
    items,
    appliedPromoCode,
    totals,
    addItem,
    removeItem,
    updateQuantity,
    applyPromoCode,
    removePromoCode,
  } = useCart();

  /**
   * Handler for adding products to cart.
   * Looks up product by ID and adds if found.
   */
  const handleAddToCart = useCallback((productId: ProductId, quantity: number) => {
    const product = findProductById(productId as number);
    if (!product) {
      console.warn(`Product with ID ${productId} not found`);
      return;
    }
    addItem(product, quantity);
  }, [addItem]);

  /**
   * Handler for applying promo codes.
   * Passes available codes to cart hook for validation.
   */
  const handleApplyPromoCode = useCallback((code: string): boolean => {
    return applyPromoCode(code, PROMO_CODES);
  }, [applyPromoCode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Hair Care Shop
          </h1>
          <p className="text-gray-600">
            Premium products for your hair care routine
          </p>
        </header>

        {/* Main Content */}
        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Products Section */}
          <div>
            <ProductList 
              products={PRODUCTS} 
              onAddToCart={handleAddToCart} 
            />
          </div>

          {/* Cart Section */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <Cart
              items={items}
              totals={totals}
              appliedPromoCode={appliedPromoCode}
              availablePromoCodes={PROMO_CODES}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
              onApplyPromoCode={handleApplyPromoCode}
              onRemovePromoCode={removePromoCode}
            />
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>
            Built with React + TypeScript + Tailwind CSS by Julian Dasilva!
          </p>
        </footer>
      </div>
    </div>
  );
};
