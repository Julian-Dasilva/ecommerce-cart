/**
 * Tests for Cart component.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Cart } from "./Cart";
import type { CartItem, PromoCode, CartTotals } from "../types";
import { createProductId } from "../types";

// Test fixtures
const createMockItems = (): CartItem[] => [
  {
    product: { id: createProductId(1), name: "Shampoo", price: 24.99 },
    quantity: 2,
  },
];

const createMockTotals = (overrides = {}): CartTotals => ({
  subtotal: 49.98,
  discountAmount: 0,
  total: 49.98,
  itemCount: 2,
  ...overrides,
});

const createMockPromoCodes = (): PromoCode[] => [
  {
    code: "SAVE15",
    discount: { type: "percentage", value: 15 },
    displayText: "15% off",
  },
  {
    code: "SAVE10",
    discount: { type: "fixed", value: 10 },
    displayText: "$10 off",
  },
];

describe("Cart", () => {
  it("should display empty cart message when no items", () => {
    render(
      <Cart
        items={[]}
        totals={{ subtotal: 0, discountAmount: 0, total: 0, itemCount: 0 }}
        appliedPromoCode={null}
        availablePromoCodes={createMockPromoCodes()}
        onUpdateQuantity={vi.fn()}
        onRemove={vi.fn()}
        onApplyPromoCode={vi.fn()}
        onRemovePromoCode={vi.fn()}
      />
    );

    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
  });

  it("should display cart items", () => {
    render(
      <Cart
        items={createMockItems()}
        totals={createMockTotals()}
        appliedPromoCode={null}
        availablePromoCodes={createMockPromoCodes()}
        onUpdateQuantity={vi.fn()}
        onRemove={vi.fn()}
        onApplyPromoCode={vi.fn()}
        onRemovePromoCode={vi.fn()}
      />
    );

    expect(screen.getByText("Shampoo")).toBeInTheDocument();
  });

  it("should display item count in header", () => {
    render(
      <Cart
        items={createMockItems()}
        totals={createMockTotals()}
        appliedPromoCode={null}
        availablePromoCodes={createMockPromoCodes()}
        onUpdateQuantity={vi.fn()}
        onRemove={vi.fn()}
        onApplyPromoCode={vi.fn()}
        onRemovePromoCode={vi.fn()}
      />
    );

    expect(screen.getByText("(2 items)")).toBeInTheDocument();
  });

  it("should apply promo code when valid code is entered", async () => {
    const user = userEvent.setup();
    const handleApplyPromoCode = vi.fn().mockReturnValue(true);

    render(
      <Cart
        items={createMockItems()}
        totals={createMockTotals()}
        appliedPromoCode={null}
        availablePromoCodes={createMockPromoCodes()}
        onUpdateQuantity={vi.fn()}
        onRemove={vi.fn()}
        onApplyPromoCode={handleApplyPromoCode}
        onRemovePromoCode={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText("Enter code");
    const submitButton = screen.getByRole("button", { name: /apply/i });

    await user.type(input, "SAVE15");
    await user.click(submitButton);

    expect(handleApplyPromoCode).toHaveBeenCalledWith("SAVE15");
  });

  it("should show error when invalid promo code is entered", async () => {
    const user = userEvent.setup();
    const handleApplyPromoCode = vi.fn().mockReturnValue(false);

    render(
      <Cart
        items={createMockItems()}
        totals={createMockTotals()}
        appliedPromoCode={null}
        availablePromoCodes={createMockPromoCodes()}
        onUpdateQuantity={vi.fn()}
        onRemove={vi.fn()}
        onApplyPromoCode={handleApplyPromoCode}
        onRemovePromoCode={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText("Enter code");
    const submitButton = screen.getByRole("button", { name: /apply/i });

    await user.type(input, "INVALID");
    await user.click(submitButton);

    expect(screen.getByText(/invalid promo code/i)).toBeInTheDocument();
  });

  it("should display applied promo code", () => {
    const mockPromoCodes = createMockPromoCodes();

    render(
      <Cart
        items={createMockItems()}
        totals={createMockTotals({ discountAmount: 7.5 })}
        appliedPromoCode={mockPromoCodes[0]}
        availablePromoCodes={mockPromoCodes}
        onUpdateQuantity={vi.fn()}
        onRemove={vi.fn()}
        onApplyPromoCode={vi.fn()}
        onRemovePromoCode={vi.fn()}
      />
    );

    const promoCodes = screen.getAllByText("SAVE15");
    expect(promoCodes.length).toBeGreaterThan(0);
    expect(screen.getByText("Promo code applied!")).toBeInTheDocument();
  });

  it("should remove promo code when remove button is clicked", async () => {
    const user = userEvent.setup();
    const handleRemovePromoCode = vi.fn();
    const mockPromoCodes = createMockPromoCodes();

    render(
      <Cart
        items={createMockItems()}
        totals={createMockTotals()}
        appliedPromoCode={mockPromoCodes[0]}
        availablePromoCodes={mockPromoCodes}
        onUpdateQuantity={vi.fn()}
        onRemove={vi.fn()}
        onApplyPromoCode={vi.fn()}
        onRemovePromoCode={handleRemovePromoCode}
      />
    );

    const removeButton = screen.getByRole("button", {
      name: /remove promo code/i,
    });
    await user.click(removeButton);

    expect(handleRemovePromoCode).toHaveBeenCalled();
  });

  it("should display discount amount when promo is applied", () => {
    const mockPromoCodes = createMockPromoCodes();

    render(
      <Cart
        items={createMockItems()}
        totals={createMockTotals({ discountAmount: 7.5, total: 42.48 })}
        appliedPromoCode={mockPromoCodes[0]}
        availablePromoCodes={mockPromoCodes}
        onUpdateQuantity={vi.fn()}
        onRemove={vi.fn()}
        onApplyPromoCode={vi.fn()}
        onRemovePromoCode={vi.fn()}
      />
    );

    expect(screen.getByText("-$7.50")).toBeInTheDocument();
  });
});
