/**
 * Cart Component
 *
 * Container component that orchestrates the shopping cart UI.
 * Composes smaller components for a clean separation of concerns.
 *
 * Architecture:
 * - Container/Presentational pattern
 * - This component handles layout and composition
 * - Child components are mostly presentational
 */

import type { CartItem, CartTotals, PromoCode, ProductId } from "../types";
import { CartItemRow } from "./CartItemRow";
import { CartSummary } from "./CartSummary";
import { PromoCodeForm } from "./PromoCodeForm";

interface CartProps {
  readonly items: readonly CartItem[];
  readonly totals: CartTotals;
  readonly appliedPromoCode: PromoCode | null;
  readonly availablePromoCodes: readonly PromoCode[];
  readonly onUpdateQuantity: (productId: ProductId, quantity: number) => void;
  readonly onRemove: (productId: ProductId) => void;
  readonly onApplyPromoCode: (code: string) => boolean;
  readonly onRemovePromoCode: () => void;
}

export const Cart = ({
  items,
  totals,
  appliedPromoCode,
  availablePromoCodes,
  onUpdateQuantity,
  onRemove,
  onApplyPromoCode,
  onRemovePromoCode,
}: CartProps) => {
  // Empty cart state
  if (items.length === 0) {
    return (
      <section className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Shopping Cart</h2>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🛒</div>
          <p className="text-gray-500 text-lg">Your cart is empty</p>
          <p className="text-gray-400 text-sm mt-2">
            Add some products to get started!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Shopping Cart
        <span className="text-base font-normal text-gray-500 ml-2">
          ({totals.itemCount} {totals.itemCount === 1 ? "item" : "items"})
        </span>
      </h2>

      {/* Cart Items */}
      <ul className="space-y-4 mb-6" role="list" aria-label="Cart items">
        {items.map((item) => (
          <CartItemRow
            key={item.product.id}
            item={item}
            onUpdateQuantity={onUpdateQuantity}
            onRemove={onRemove}
          />
        ))}
      </ul>

      {/* Promo Code Section */}
      <div className="mb-6">
        <PromoCodeForm
          appliedPromoCode={appliedPromoCode}
          availablePromoCodes={availablePromoCodes}
          onApplyPromoCode={onApplyPromoCode}
          onRemovePromoCode={onRemovePromoCode}
        />
      </div>

      {/* Order Summary */}
      <CartSummary totals={totals} appliedPromoCode={appliedPromoCode} />
    </section>
  );
};
