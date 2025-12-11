# Ecommerce Shopping Cart

A simple react shopping cart implementation demonstrating modern front-end architecture patterns.

## Live Demo

Run `npm run dev` and open `http://localhost:5173`

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test
```

## Future Enhancements

If this were a real production app, consider:

### State Management at Scale
```typescript
// For larger apps, consider Zustand or Redux Toolkit
import { create } from 'zustand';

const useCartStore = create((set) => ({
  items: [],
  addItem: (product) => set((state) => ({
    items: [...state.items, { product, quantity: 1 }]
  })),
}));
```

### Server-Side Validation
```typescript
// Never trust client-side promo code validation
const applyPromoCode = async (code: string) => {
  const response = await fetch('/api/validate-promo', {
    method: 'POST',
    body: JSON.stringify({ code, cartTotal: subtotal }),
  });
  // Server validates and returns discount
};
```

### Persistence
```typescript
// Save cart to localStorage
useEffect(() => {
  localStorage.setItem('cart', JSON.stringify(state));
}, [state]);

// Or sync with backend
useEffect(() => {
  saveCartToServer(state);
}, [state]);
```

### Optimistic Updates
```typescript
// Update UI immediately, rollback on error
const addItem = async (product) => {
  const previousState = state;
  dispatch({ type: 'ADD_ITEM', payload: { product } }); // Optimistic
  
  try {
    await api.addToCart(product.id);
  } catch (error) {
    dispatch({ type: 'ROLLBACK', payload: previousState }); // Rollback
  }
};
```

### Inventory Tracking

Add stock awareness so the cart never exceeds available units:

1. **Extend the data model**: add `inventory` (and optional `maxPerOrder`) to `Product` in `types.ts` and `data.ts`.
2. **Guard mutations**: inside `useCart`, check current quantity before `ADD_ITEM`/`UPDATE_QUANTITY`. Clamp to available stock or return `{ success: false, error: 'Out of stock' }` so the UI can surface messaging.
3. **Optional reservations**: keep a `Map<ProductId, number>` in state when multiple tabs/users might race for the same inventory. Note this can also be guarded by having a SOLD OUT THRESHOLD that is NOT 0 and managing cart qty as a buffered "removed inv qty"
4. **UI feedback**: disable “Add to Cart” when `inventory <= SOLD_OUT_THRESHOLD`, show “Only N left” for low stock, and surface errors when a user exceeds the maximum.
5. **Testing**: unit-test the guard logic and component-test the disabled button/error states.

---

## Testing Philosophy

### Unit Tests (Pure Functions)
```typescript
describe('calculateDiscountAmount', () => {
  it('should calculate percentage discount', () => {
    const discount = { type: 'percentage', value: 15 };
    expect(calculateDiscountAmount(100, discount)).toBe(15);
  });
});
```

### Component Tests (User Behavior)
```typescript
it('should add item to cart when clicked', async () => {
  const user = userEvent.setup();
  const handleAdd = vi.fn();
  
  render(<ProductCard product={mockProduct} onAddToCart={handleAdd} />);
  
  await user.click(screen.getByRole('button', { name: /add/i }));
  
  expect(handleAdd).toHaveBeenCalledWith(mockProduct.id);
});
```

## Technologies

- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Vite 7** - Build tool
- **Vitest** - Testing framework
- **React Testing Library** - Component testing

---