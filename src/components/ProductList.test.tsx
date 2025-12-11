/**
 * Tests for ProductList component.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductList } from "./ProductList";
import type { Product } from "../types";
import { createProductId } from "../types";

const mockProducts: Product[] = [
  { id: createProductId(1), name: "Shampoo", price: 24.99 },
  { id: createProductId(2), name: "Conditioner", price: 24.99 },
];

describe("ProductList", () => {
  it("should render all products", () => {
    const handleAddToCart = vi.fn();
    render(
      <ProductList products={mockProducts} onAddToCart={handleAddToCart} />
    );

    expect(screen.getByText("Shampoo")).toBeInTheDocument();
    expect(screen.getByText("Conditioner")).toBeInTheDocument();
  });

  it("should display product prices", () => {
    const handleAddToCart = vi.fn();
    render(
      <ProductList products={mockProducts} onAddToCart={handleAddToCart} />
    );

    const prices = screen.getAllByText("$24.99");
    expect(prices.length).toBeGreaterThan(0);
  });

  it("should call onAddToCart when Add to Cart button is clicked", async () => {
    const user = userEvent.setup();
    const handleAddToCart = vi.fn();

    render(
      <ProductList products={mockProducts} onAddToCart={handleAddToCart} />
    );

    const buttons = screen.getAllByRole("button", { name: /add.*to cart/i });
    await user.click(buttons[0]);

    expect(handleAddToCart).toHaveBeenCalledWith(createProductId(1), 1);
  });

  it("should display empty state when no products", () => {
    const handleAddToCart = vi.fn();
    render(<ProductList products={[]} onAddToCart={handleAddToCart} />);

    expect(
      screen.getByText("No products available at this time.")
    ).toBeInTheDocument();
  });

  it("should have proper accessibility attributes", () => {
    const handleAddToCart = vi.fn();
    render(
      <ProductList products={mockProducts} onAddToCart={handleAddToCart} />
    );

    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).toHaveAttribute("aria-label");
    });
  });
});
