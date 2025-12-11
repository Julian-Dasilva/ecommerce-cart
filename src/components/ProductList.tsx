/**
 * ProductList Component
 *
 * Displays a grid/list of available products.
 *
 * Architecture Notes:
 * - Uses composition (ProductCard) rather than rendering everything inline
 * - Handles empty state gracefully
 * - Accessible with proper ARIA roles
 */

import { useCallback } from "react";
import type { Product, ProductId } from "../types";
import { ProductCard } from "./ProductCard";

interface ProductListProps {
  readonly products: readonly Product[];
  readonly onAddToCart: (productId: ProductId, quantity: number) => void;
}

export const ProductList = ({ products, onAddToCart }: ProductListProps) => {
  /**
   * Adapter function to match ProductCard's simpler interface.
   * Defaults quantity to 1 for single-click add.
   */
  const handleAddToCart = useCallback(
    (productId: ProductId) => {
      onAddToCart(productId, 1);
    },
    [onAddToCart]
  );

  // Early return for empty state
  if (products.length === 0) {
    return (
      <section className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Products</h2>
        <p className="text-gray-500 text-center py-8">
          No products available at this time.
        </p>
      </section>
    );
  }

  return (
    <section className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Products</h2>

      <ul className="space-y-3" role="list" aria-label="Available products">
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} onAddToCart={handleAddToCart} />
          </li>
        ))}
      </ul>
    </section>
  );
};
