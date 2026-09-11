import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNotification } from './NotificationContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('agri_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const { showToast } = useNotification();

  useEffect(() => {
    localStorage.setItem('agri_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = useCallback((product, quantity = 1) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item._id === product._id);
      if (existingIndex > -1) {
        const newQty = prev[existingIndex].quantity + quantity;
        if (newQty > product.availableQuantity) {
          // Schedule toast outside the render cycle
          setTimeout(() => showToast(`Cannot add more than ${product.availableQuantity} ${product.unit} of ${product.title}`, 'error'), 0);
          return prev;
        }
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], quantity: newQty };
        setTimeout(() => showToast(`Updated ${product.title} quantity to ${newQty} ${product.unit}`, 'success'), 0);
        return updated;
      } else {
        if (quantity > product.availableQuantity) {
          setTimeout(() => showToast(`Only ${product.availableQuantity} ${product.unit} available`, 'error'), 0);
          return prev;
        }
        setTimeout(() => showToast(`Added ${product.title} to cart`, 'success'), 0);
        return [...prev, { ...product, quantity }];
      }
    });
  }, [showToast]);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev => {
      return prev.map(item => {
        if (item._id === productId) {
          if (quantity > item.availableQuantity) {
            setTimeout(() => showToast(`Max available stock is ${item.availableQuantity} ${item.unit}`, 'error'), 0);
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      });
    });
  }, [showToast]);

  const removeFromCart = useCallback((productId) => {
    setCartItems(prev => {
      const item = prev.find(i => i._id === productId);
      if (item) {
        setTimeout(() => showToast(`Removed ${item.title} from cart`, 'info'), 0);
      }
      return prev.filter(i => i._id !== productId);
    });
  }, [showToast]);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const cartSubtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateQuantity, removeFromCart, clearCart, cartSubtotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
