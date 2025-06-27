import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_CART':
      return { ...state, cart: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_CART':
      return { ...state, cart: null };
    default:
      return state;
  }
};

const initialState = {
  cart: null,
  isLoading: false,
  error: null,
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    } else {
      dispatch({ type: 'CLEAR_CART' });
    }
  }, [isAuthenticated]);

  const loadCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await cartAPI.getCart();
      dispatch({ type: 'SET_CART', payload: response.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load cart' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      await cartAPI.addItem(productId, quantity);
      await loadCart();
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add item to cart' });
      return { success: false, error: 'Failed to add item to cart' };
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      await cartAPI.updateItem(itemId, quantity);
      await loadCart();
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update cart item' });
      return { success: false, error: 'Failed to update cart item' };
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await cartAPI.removeItem(itemId);
      await loadCart();
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove item from cart' });
      return { success: false, error: 'Failed to remove item from cart' };
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clearCart();
      dispatch({ type: 'CLEAR_CART' });
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to clear cart' });
      return { success: false, error: 'Failed to clear cart' };
    }
  };

  const getCartItemCount = () => {
    if (!state.cart?.items) return 0;
    return state.cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    ...state,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    loadCart,
    getCartItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
