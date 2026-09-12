import { createContext, useContext, useState, useEffect } from "react";
import { normalizeProduct } from "../utils/productData";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("wastrahub_cart");
    if (stored) {
      try {
        const savedItems = JSON.parse(stored);
        setItems(Array.isArray(savedItems) ? savedItems.map(normalizeProduct) : []);
      } catch {
        localStorage.removeItem("wastrahub_cart");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("wastrahub_cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (product, quantity = 1) => {
    const cartProduct = normalizeProduct(product);
    setItems((prev) => {
      const existing = prev.find((i) => i.id === cartProduct.id);
      if (existing) {
        return prev.map((i) =>
          i.id === cartProduct.id
            ? { ...i, ...cartProduct, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { ...cartProduct, quantity }];
    });
  };

  const removeFromCart = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
