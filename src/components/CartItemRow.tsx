/**
 * CartItemRow Component
 *
 * Displays a single item in the shopping cart with quantity controls.
 *
 * Design Decisions:
 * - Memoized to prevent re-renders when other cart items change
 * - Quantity input commits immediately on valid changes (arrow keys, typing)
 *  - this is minor but adds to the user experience very important for prod usecases
 * - Basic validation on blur and enter key
 * - Basic accessibility with labels and ARIA attributes
 */

import React, { memo, useCallback, useState, useEffect, useRef } from "react";
import type { CartItem, ProductId } from "../types";
import { formatCurrency } from "../utils/currency";
import { calculateItemSubtotal } from "../utils/cartCalculations";

interface CartItemRowProps {
  readonly item: CartItem;
  readonly onUpdateQuantity: (productId: ProductId, quantity: number) => void;
  readonly onRemove: (productId: ProductId) => void;
}

/**
 * CartItemRow - Displays a cart item with quantity controls.
 *
 * Commits changes immediately when:
 * - Arrow keys are used (up/down)
 * - A valid number is typed
 * - Enter is pressed
 *
 * Resets to previous value on:
 * - Invalid input on blur
 * - Escape key
 */
export const CartItemRow = memo(function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemRowProps) {
  // Local state for input - allows typing without immediate validation
  const [inputValue, setInputValue] = useState(item.quantity.toString());

  // Track if we're currently focused to handle blur differently
  const lastCommittedValue = useRef(item.quantity);

  // Sync local state when prop changes (e.g., after cart update from parent)
  useEffect(() => {
    setInputValue(item.quantity.toString());
    lastCommittedValue.current = item.quantity;
  }, [item.quantity]);

  /**
   * Commits a quantity change to the parent.
   * Returns true if the value was valid and committed.
   */
  const commitQuantity = useCallback(
    (value: string): boolean => {
      const newQuantity = parseInt(value, 10);

      if (isNaN(newQuantity) || newQuantity < 1) {
        return false;
      }

      if (newQuantity !== lastCommittedValue.current) {
        lastCommittedValue.current = newQuantity;
        onUpdateQuantity(item.product.id, newQuantity);
      }
      return true;
    },
    [item.product.id, onUpdateQuantity]
  );

  /**
   * Handle input changes - commits immediately if valid number.
   * This makes arrow keys work instantly.
   */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);

      // Commit immediately if it's a valid positive integer
      // This handles arrow keys and direct valid input
      const parsed = parseInt(newValue, 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 99) {
        commitQuantity(newValue);
      }
    },
    [commitQuantity]
  );

  /**
   * Handle blur - reset to last valid value if current is invalid.
   */
  const handleBlur = useCallback(() => {
    const parsed = parseInt(inputValue, 10);
    if (isNaN(parsed) || parsed < 1) {
      // Reset to last committed value
      setInputValue(lastCommittedValue.current.toString());
    }
  }, [inputValue]);

  /**
   * Handle keyboard events.
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        (e.target as HTMLInputElement).blur();
      }
      if (e.key === "Escape") {
        setInputValue(lastCommittedValue.current.toString());
        (e.target as HTMLInputElement).blur();
      }
    },
    []
  );

  const handleRemove = useCallback(() => {
    onRemove(item.product.id);
  }, [onRemove, item.product.id]);

  const subtotal = calculateItemSubtotal(item);
  const inputId = `quantity-${item.product.id}`;

  return (
    <li
      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
      data-testid={`cart-item-${item.product.id}`}
    >
      {/* Product Info */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {item.product.name}
          </h3>
          <p className="text-gray-600 text-sm">
            {formatCurrency(item.product.price)} each
          </p>
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-4 mb-3">
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          Qty:
        </label>
        <input
          id={inputId}
          type="number"
          min="1"
          max="99"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-20 px-3 py-2 text-center border border-gray-300 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     transition-shadow duration-200"
          aria-label={`Quantity for ${item.product.name}`}
        />
        <button
          onClick={handleRemove}
          className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 
                     hover:bg-red-50 rounded-lg transition-colors duration-200
                     focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          aria-label={`Remove ${item.product.name} from cart`}
          type="button"
        >
          Remove
        </button>
      </div>

      {/* Subtotal */}
      <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
        <span className="text-sm text-gray-600">Subtotal</span>
        <span className="text-lg font-bold text-gray-900">
          {formatCurrency(subtotal)}
        </span>
      </div>
    </li>
  );
});
