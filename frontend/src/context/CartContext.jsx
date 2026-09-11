import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNotification } from './NotificationContext';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const getStorageKey = useCallback(() => {
    return user ? `agri_cart_${user._id || user.id}` : null;
  }, [user]);

  const [cartItems, setCartItems] = useState([]);

  // Sync cart whenever the logged in user changes
  useEffect(() => {
    const key = getStorageKey();
    if (key) {
      try {
        const saved = localStorage.getItem(key);
        setCartItems(saved ? JSON.parse(saved) : []);
      } catch {
        setCartItems([]);
      }
    } else {
      // When not logged in, no cart items are shown
      setCartItems([]);
    }
  }, [user, getStorageKey]);

  // Persist cart to user-specific localStorage key
  useEffect(() => {
    const key = getStorageKey();
    if (key) {
      try {
        localStorage.setItem(key, JSON.stringify(cartItems));
      } catch (e) {
        console.error('Error saving cart to storage:', e);
      }
    }
  }, [cartItems, getStorageKey]);

  const addToCart = useCallback((product, quantity = 1) => {
    if (!user) {
      setTimeout(() => showToast('Please sign in to add items to your cart', 'error'), 0);
      return false;
    }
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
