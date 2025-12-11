/**
 * Tests for CartItemRow component.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartItemRow } from "./CartItemRow";
import type { CartItem } from "../types";
import { createProductId } from "../types";

const mockItem: CartItem = {
  product: { id: createProductId(1), name: "Shampoo", price: 24.99 },
  quantity: 2,
};

describe("CartItemRow", () => {
  it("should display product information", () => {
    render(
      <CartItemRow
        item={mockItem}
        onUpdateQuantity={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    expect(screen.getByText("Shampoo")).toBeInTheDocument();
    expect(screen.getByText("$24.99 each")).toBeInTheDocument();
  });

  it("should display quantity input with correct value", () => {
    render(
      <CartItemRow
        item={mockItem}
        onUpdateQuantity={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    const quantityInput = screen.getByLabelText(
      /quantity/i
    ) as HTMLInputElement;
    expect(quantityInput.value).toBe("2");
  });

  it("should call onUpdateQuantity immediately when quantity changes", async () => {
    const user = userEvent.setup();
    const handleUpdateQuantity = vi.fn();

    render(
      <CartItemRow
        item={mockItem}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={vi.fn()}
      />
    );

    const quantityInput = screen.getByLabelText(/quantity/i);
    await user.clear(quantityInput);
    await user.type(quantityInput, "5");

    // Should be called immediately without needing blur
    expect(handleUpdateQuantity).toHaveBeenCalledWith(createProductId(1), 5);
  });

  it("should call onRemove when remove button is clicked", async () => {
    const user = userEvent.setup();
    const handleRemove = vi.fn();

    render(
      <CartItemRow
        item={mockItem}
        onUpdateQuantity={vi.fn()}
        onRemove={handleRemove}
      />
    );

    const removeButton = screen.getByRole("button", { name: /remove/i });
    await user.click(removeButton);

    expect(handleRemove).toHaveBeenCalledWith(createProductId(1));
  });

  it("should calculate and display subtotal correctly", () => {
    render(
      <CartItemRow
        item={mockItem}
        onUpdateQuantity={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    expect(screen.getByText("$49.98")).toBeInTheDocument();
  });

  it("should have proper accessibility attributes", () => {
    render(
      <CartItemRow
        item={mockItem}
        onUpdateQuantity={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    const quantityInput = screen.getByLabelText(/quantity/i);
    expect(quantityInput).toHaveAttribute("aria-label");

    const removeButton = screen.getByRole("button", { name: /remove/i });
    expect(removeButton).toHaveAttribute("aria-label");
  });
});
