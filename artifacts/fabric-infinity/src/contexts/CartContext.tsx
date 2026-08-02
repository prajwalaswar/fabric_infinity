import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  productId: number;
  name: string;
  image?: string | null;
  price: number;
  quantity: number;
  variant?: string | null;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: number, variant?: string | null) => void;
  updateQuantity: (productId: number, quantity: number, variant?: string | null) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('fabric_infinity_cart');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('fabric_infinity_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.productId === newItem.productId && i.variant === newItem.variant
      );
      if (existing) {
        return prev.map((i) =>
          i.productId === newItem.productId && i.variant === newItem.variant
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i
        );
      }
      return [...prev, newItem];
    });
  };

  const removeItem = (productId: number, variant?: string | null) => {
    setItems((prev) => prev.filter((i) => !(i.productId === productId && i.variant === variant)));
  };

  const updateQuantity = (productId: number, quantity: number, variant?: string | null) => {
    if (quantity <= 0) {
      removeItem(productId, variant);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId && i.variant === variant ? { ...i, quantity } : i
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const cartCount = items.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, cartCount, cartTotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
