/**
 * ProductCard Component
 *
 * Displays a single product with add-to-cart functionality.
 *
 * Design Decisions:
 * - Separated from ProductList for single responsibility
 * - Memoized to prevent unnecessary re-renders when other items change
 * - Handles its own quantity state for future enhancement (quantity selector)
 */

import React, { memo, useCallback } from "react";
import type { Product, ProductId } from "../types";
import { formatCurrency } from "../utils/currency";

interface ProductCardProps {
  readonly product: Product;
  readonly onAddToCart: (productId: ProductId) => void;
  readonly disabled?: boolean;
}

/**
 * ProductCard - Displays product info with add-to-cart button.
 *
 * Memoized to prevent re-renders when sibling products change.
 * Only re-renders when its own props change.
 */
export const ProductCard = memo(function ProductCard({
  product,
  onAddToCart,
  disabled = false,
}: ProductCardProps) {
  const handleClick = useCallback(() => {
    onAddToCart(product.id);
  }, [onAddToCart, product.id]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onAddToCart(product.id);
      }
    },
    [onAddToCart, product.id]
  );

  return (
    <article
      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-200"
      data-testid={`product-${product.id}`}
    >
      <div className="flex-1 min-w-0 mr-4">
        <h3 className="text-lg font-semibold text-gray-900 truncate">
          {product.name}
        </h3>
        <p className="text-blue-600 font-medium mt-1">
          {formatCurrency(product.price)}
        </p>
      </div>

      <button
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          px-4 py-2 rounded-lg font-medium transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2
          ${
            disabled
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 active:bg-blue-800"
          }
        `}
        aria-label={`Add ${product.name} to cart`}
        type="button"
      >
        Add to Cart
      </button>
    </article>
  );
});
