import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartVisible, setCartVisible] = useState(false);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('unidigital-cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
        localStorage.removeItem('unidigital-cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('unidigital-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Ensure product has all required fields
        const cartProduct = {
          id: product.id || Date.now(),
          name: product.name || 'Product',
          price: product.price || 0,
          image: product.image || '',
          category: product.category || 'general',
          quantity: 1
        };
        return [...prevCart, cartProduct];
      }
    });
    
    // Show cart sidebar when adding items
    setCartVisible(true);
    
    // Show feedback
    alert(`✓ ${product.name || 'Item'} added to cart!`);
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('unidigital-cart');
    alert('Cart cleared successfully!');
  };

  const toggleCart = () => {
    setCartVisible(!cartVisible);
  };

  const showCart = () => {
    setCartVisible(true);
  };

  const hideCart = () => {
    setCartVisible(false);
  };

  const getCartItemCount = (productId) => {
    const item = cart.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  // Sample products for testing (can be removed later)
  const testProducts = [
    { id: 1, name: 'Car Battery', price: 149.99, category: 'automotive', image: '' },
    { id: 2, name: 'iPhone 15 Pro', price: 999.99, category: 'electronics', image: '' },
    { id: 3, name: 'Brake Pads', price: 89.99, category: 'automotive', image: '' },
    { id: 4, name: 'Samsung TV', price: 799.99, category: 'electronics', image: '' },
  ];

  // Quick add function for testing
  const quickAddToCart = (productId) => {
    const product = testProducts.find(p => p.id === productId);
    if (product) {
      addToCart(product);
    }
  };

  return (
    <CartContext.Provider
      value={{
        // Cart data
        cart,
        cartVisible,
        
        // Cart actions
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleCart,
        showCart,
        hideCart,
        getCartItemCount,
        
        // Cart calculations
        totalItems,
        totalPrice,
        formatCurrency,
        
        // Testing utilities (can be removed in production)
        testProducts,
        quickAddToCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};