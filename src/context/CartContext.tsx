import { createContext, useContext, useState, type ReactNode } from 'react';
import type { CartItem, Product } from '@/lib/types';

type CartContextValue = {
  items: CartItem[];
  addItem: (product: Product, quantity: number, size: string, color: string) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = 'azaleya_cart';

function loadInitial(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadInitial);

  const persist = (next: CartItem[]) => {
    setItems(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const addItem = (product: Product, quantity: number, size: string, color: string) => {
    setItems((prev) => {
      const idx = prev.findIndex(
        (i) => i.product.id === product.id && i.size === size && i.color === color,
      );
      let next: CartItem[];
      if (idx >= 0) {
        next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
      } else {
        next = [...prev, { product, quantity, size, color }];
      }
      persist(next);
      return next;
    });
  };

  const removeItem = (productId: string, size: string, color: string) => {
    setItems((prev) => {
      const next = prev.filter(
        (i) => !(i.product.id === productId && i.size === size && i.color === color),
      );
      persist(next);
      return next;
    });
  };

  const updateQuantity = (productId: string, size: string, color: string, quantity: number) => {
    setItems((prev) => {
      const next = prev.map((i) =>
        i.product.id === productId && i.size === size && i.color === color
          ? { ...i, quantity: Math.max(1, quantity) }
          : i,
      );
      persist(next);
      return next;
    });
  };

  const clearCart = () => persist([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.quantity * Number(i.product.price), 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
