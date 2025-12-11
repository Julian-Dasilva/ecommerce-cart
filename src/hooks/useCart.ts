/**
 * Custom hook for cart state management.
 *
 * Architecture Decision: useReducer over useState simple but important trade off to consider
 *
 * Why useReducer?
 * 1. Complex state logic - cart has multiple interdependent operations
 *  1.1. useState works best on a single primitive or a few unrelated fields
 * 2. Predictable state transitions - actions clearly describe WHAT happened
 *  2.1. every transition goes through dispatch(action)
 * 3. Testability - reducer is a pure function, easy to unit test
 *  3.1. with useState I would have had to mock the hooks AND the state
 *  3.2. with useReducer I can test the reducer in isolation
 * 4. Debugging - actions create a clear audit trail
 *  4.1. i like to keep at the forefront of my mind that if I was on-call how would I debug the code I'm writing? 
 *       If I had to debug it in its current state how would I do it? If I have no good answers it raises an alarm in my head.
 * 5. Performance - dispatch is stable (unlike setState callbacks)
 *  5.1. set state callbacks identity changes can ripple down forcing you to memoize per call :(
 *  5.2 as the app grows controlling the rendering of the component tree becomes more difficult
 * 6. Readability (opinion) - often times useState bodies can get bloated easily and turn into state spaghetti
 * Why not Context?
 * For this app size, prop drilling is actually fine and more explicit. (only two direct children consume cart state)
 * Context would add complexity without benefit. If the app grew significantly,
 * we might consider:
 * - React Context + useReducer for global state (if i had several distant components that needed to access the cart state)
 * - Zustand for simpler global state (simple api and pretty light weight good if you need global state and dont wanna deal with a ton of boilerplate)
 * - Redux Toolkit for larger apps with complex state ( a lot of boiler plate and complexity but has excellent dev tooling and debugging capabilities)
 * - tRPC for server side state management and syncing (this has grown in popularity recently, but SSR at scale requires a nuanced appraoch to be successful)
 */

import { useReducer, useCallback, useMemo } from "react";
import type {
  CartState,
  CartAction,
  Product,
  PromoCode,
  CartTotals,
  ProductId,
} from "../types";
import {
  calculateCartTotals,
  validatePromoCode,
} from "../utils/cartCalculations";

// Initial state - empty cart
const initialState: CartState = {
  items: [],
  appliedPromoCode: null,
};

/**
 * Cart reducer - handles all cart state transitions.
 *
 * Key Principle: Immutability
 * - Never mutate state directly
 * - Always return new objects/arrays
 * - This enables React to detect changes and re-render
 */
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const { product, quantity } = action.payload;
      const existingIndex = state.items.findIndex(
        (item) => item.product.id === product.id
      );

      if (existingIndex >= 0) {
        // Product exists - update quantity (immutably)
        const newItems = state.items.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        return { ...state, items: newItems };
      }

      // New product - add to cart
      return {
        ...state,
        items: [...state.items, { product, quantity }],
      };
    }

    case "REMOVE_ITEM": {
      const { productId } = action.payload;
      return {
        ...state,
        items: state.items.filter((item) => item.product.id !== productId),
      };
    }

    case "UPDATE_QUANTITY": {
      const { productId, quantity } = action.payload;

      // Remove item if quantity is 0 or less
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((item) => item.product.id !== productId),
        };
      }

      // Update quantity immutably
      return {
        ...state,
        items: state.items.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        ),
      };
    }

    case "APPLY_PROMO": {
      return {
        ...state,
        appliedPromoCode: action.payload.promoCode,
      };
    }

    case "REMOVE_PROMO": {
      return {
        ...state,
        appliedPromoCode: null,
      };
    }

    case "CLEAR_CART": {
      return initialState;
    }

    default: {
      // TypeScript exhaustiveness check
      const _exhaustiveCheck: never = action;
      return _exhaustiveCheck;
    }
  }
};

/**
 * Return type for useCart hook - explicitly typed for documentation.
 */
interface UseCartReturn {
  // State
  items: CartState["items"];
  appliedPromoCode: CartState["appliedPromoCode"];
  totals: CartTotals;
  isEmpty: boolean;

  // Actions
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: ProductId) => void;
  updateQuantity: (productId: ProductId, quantity: number) => void;
  applyPromoCode: (
    code: string,
    availableCodes: readonly PromoCode[]
  ) => boolean;
  removePromoCode: () => void;
  clearCart: () => void;
}

/**
 * Custom hook for managing shopping cart state.
 *
 * Usage:
 * ```tsx
 * const { items, totals, addItem, removeItem } = useCart();
 * ```
 */
export const useCart = (): UseCartReturn => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Memoize totals calculation - only recalculates when state changes
  const totals = useMemo(() => calculateCartTotals(state), [state]);

  // Action creators - useCallback ensures stable references
  const addItem = useCallback((product: Product, quantity: number = 1) => {
    dispatch({ type: "ADD_ITEM", payload: { product, quantity } });
  }, []);

  const removeItem = useCallback((productId: ProductId) => {
    dispatch({ type: "REMOVE_ITEM", payload: { productId } });
  }, []);

  const updateQuantity = useCallback(
    (productId: ProductId, quantity: number) => {
      dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity } });
    },
    []
  );

  const applyPromoCode = useCallback(
    (code: string, availableCodes: readonly PromoCode[]): boolean => {
      const validCode = validatePromoCode(code, availableCodes);
      if (validCode) {
        dispatch({ type: "APPLY_PROMO", payload: { promoCode: validCode } });
        return true;
      }
      return false;
    },
    []
  );

  const removePromoCode = useCallback(() => {
    dispatch({ type: "REMOVE_PROMO" });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
  }, []);

  return {
    items: state.items,
    appliedPromoCode: state.appliedPromoCode,
    totals,
    isEmpty: state.items.length === 0,
    addItem,
    removeItem,
    updateQuantity,
    applyPromoCode,
    removePromoCode,
    clearCart,
  };
};
