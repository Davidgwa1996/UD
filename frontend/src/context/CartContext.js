import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        };
      }
      return {
        ...state,
        items: [...state.items, action.payload]
      };

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: Math.max(1, action.payload.quantity) } // Ensure at least 1
            : item
        )
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      };

    case 'SET_CURRENCY':
      return {
        ...state,
        currency: action.payload
      };

    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    currency: 'GBP'
  });

  // Calculate totals
  const cartTotal = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = state.items.reduce((count, item) => count + item.quantity, 0);

  const addToCart = (product, quantity = 1) => {
    console.log('Adding to cart:', product.name, 'Quantity:', quantity);
    dispatch({
      type: 'ADD_TO_CART',
      payload: { ...product, quantity }
    });
  };

  const removeFromCart = (productId) => {
    dispatch({
      type: 'REMOVE_FROM_CART',
      payload: productId
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { id: productId, quantity }
    });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const setCurrency = (currency) => {
    dispatch({ type: 'SET_CURRENCY', payload: currency });
  };

  // Save cart to localStorage whenever items change
  useEffect(() => {
    console.log('Saving cart to localStorage:', state.items);
    localStorage.setItem('unidigital_cart', JSON.stringify(state.items));
    localStorage.setItem('unidigital_currency', state.currency);
  }, [state.items, state.currency]);

  // Load cart from localStorage on initial load
  useEffect(() => {
    const savedCart = localStorage.getItem('unidigital_cart');
    const savedCurrency = localStorage.getItem('unidigital_currency');
    
    console.log('Loading from localStorage - Cart:', savedCart, 'Currency:', savedCurrency);
    
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        console.log('Parsed cart:', parsedCart);
        dispatch({
          type: 'LOAD_CART',
          payload: parsedCart
        });
      } catch (error) {
        console.error('Error parsing saved cart:', error);
        localStorage.removeItem('unidigital_cart');
      }
    }
    
    if (savedCurrency) {
      dispatch({ type: 'SET_CURRENCY', payload: savedCurrency });
    }
  }, []);

  const value = {
    items: state.items,
    cartTotal,
    cartCount,
    currency: state.currency,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    setCurrency
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};