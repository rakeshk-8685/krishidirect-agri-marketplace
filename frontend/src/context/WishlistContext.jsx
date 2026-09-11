import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNotification } from './NotificationContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const saved = localStorage.getItem('agri_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { showToast } = useNotification();

  useEffect(() => {
    try {
      localStorage.setItem('agri_wishlist', JSON.stringify(wishlistItems));
    } catch (e) {
      console.error('Error saving wishlist to localStorage:', e);
    }
  }, [wishlistItems]);

  const isWishlisted = useCallback((productId) => {
    if (!productId) return false;
    return wishlistItems.some(item => (item._id || item.id) === productId);
  }, [wishlistItems]);

  const toggleWishlist = useCallback((product) => {
    if (!product || (!product._id && !product.id)) return;
    const prodId = product._id || product.id;

    setWishlistItems(prev => {
      const exists = prev.some(item => (item._id || item.id) === prodId);
      if (exists) {
        setTimeout(() => showToast(`Removed ${product.title} from Wishlist`, 'info'), 0);
        return prev.filter(item => (item._id || item.id) !== prodId);
      } else {
        setTimeout(() => showToast(`Saved ${product.title} to Wishlist ❤️`, 'success'), 0);
        return [...prev, product];
      }
    });
  }, [showToast]);

  const removeFromWishlist = useCallback((productId) => {
    setWishlistItems(prev => {
      const item = prev.find(i => (i._id || i.id) === productId);
      if (item) {
        setTimeout(() => showToast(`Removed ${item.title} from Wishlist`, 'info'), 0);
      }
      return prev.filter(i => (i._id || i.id) !== productId);
    });
  }, [showToast]);

  const clearWishlist = useCallback(() => {
    setWishlistItems([]);
  }, []);

  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      wishlistCount,
      isWishlisted,
      toggleWishlist,
      removeFromWishlist,
      clearWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
