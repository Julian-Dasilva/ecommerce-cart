/**
 * CartSummary Component
 *
 * Displays the cart totals breakdown: subtotal, discounts, and final total.
 *
 * Design Decisions:
 * - Pure presentational component (no state)
 * - Uses semantic HTML for better accessibility
 * - Visual hierarchy guides user attention to final total
 */

import type { CartTotals, PromoCode } from "../types";
import { formatCurrency } from "../utils/currency";

interface CartSummaryProps {
  readonly totals: CartTotals;
  readonly appliedPromoCode: PromoCode | null;
}

export const CartSummary = ({ totals, appliedPromoCode }: CartSummaryProps) => {
  const hasDiscount = totals.discountAmount > 0;

  return (
    <div className="p-4 bg-gray-900 text-white rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

      <dl className="space-y-3">
        {/* Subtotal */}
        <div className="flex justify-between text-gray-300">
          <dt>
            Subtotal ({totals.itemCount}{" "}
            {totals.itemCount === 1 ? "item" : "items"})
          </dt>
          <dd>{formatCurrency(totals.subtotal)}</dd>
        </div>

        {/* Discount (only shown when applied) */}
        {hasDiscount && (
          <div className="flex justify-between text-green-400">
            <dt className="flex items-center gap-2">
              Discount
              {appliedPromoCode && (
                <span className="text-xs bg-green-900 px-2 py-0.5 rounded">
                  {appliedPromoCode.code}
                </span>
              )}
            </dt>
            <dd>-{formatCurrency(totals.discountAmount)}</dd>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-700 my-2" />

        {/* Total */}
        <div className="flex justify-between items-center">
          <dt className="text-lg font-bold">Total</dt>
          <dd className="text-2xl font-bold text-white">
            {formatCurrency(totals.total)}
          </dd>
        </div>
      </dl>

      {/* Savings callout */}
      {hasDiscount && (
        <div className="mt-4 p-3 bg-green-900/50 rounded-lg text-center">
          <p className="text-green-300 text-sm font-medium">
            You're saving {formatCurrency(totals.discountAmount)} on this order!
          </p>
        </div>
      )}
    </div>
  );
};
