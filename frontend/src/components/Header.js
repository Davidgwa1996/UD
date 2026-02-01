import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, User, Car, Cpu, Wallet, Search } from 'lucide-react';
import CartSidebar from './CartSidebar';
import { useCart } from './contexts/CartContext';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { cartItems, toggleCart } = useCart();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      alert(`Searching for: "${searchQuery}"`);
      // In future: navigate(`/search?q=${searchQuery}`);
      setSearchQuery('');
    }
  };

  const handleCartClick = () => {
    setShowCart(true);
    toggleCart();
  };

  return (
    <>
      <header className="bg-white shadow-md py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="text-2xl font-bold text-primary flex items-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-2">
                <span className="text-white font-bold">UD</span>
              </div>
              UniDigitalCom
            </Link>
            
            {/* Search Bar - Desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 mx-8 max-w-2xl">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search cars, electronics, parts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary"
                >
                  <Search size={20} />
                </button>
              </div>
            </form>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-gray-700 hover:text-primary transition-colors">Home</Link>
              <Link to="/automotive-parts" className="text-gray-700 hover:text-primary flex items-center transition-colors">
                <Car size={18} className="mr-1" /> Auto Parts
              </Link>
              <Link to="/electronics" className="text-gray-700 hover:text-primary flex items-center transition-colors">
                <Cpu size={18} className="mr-1" /> Electronics
              </Link>
              <Link to="/payment-methods" className="text-gray-700 hover:text-primary flex items-center transition-colors">
                <Wallet size={18} className="mr-1" /> Payments
              </Link>
              <Link to="/contact" className="text-gray-700 hover:text-primary transition-colors">Contact</Link>
              
              {/* Cart Button with Live Count */}
              <button 
                onClick={handleCartClick} 
                className="relative hover:text-primary transition-colors"
              >
                <ShoppingBag size={24} />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-4">
              {/* Mobile Search Button */}
              <button 
                onClick={() => alert('Mobile search coming soon')}
                className="text-gray-700 hover:text-primary"
              >
                <Search size={22} />
              </button>
              
              {/* Mobile Cart Button */}
              <button 
                onClick={handleCartClick} 
                className="relative hover:text-primary"
              >
                <ShoppingBag size={24} />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </button>
              
              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="text-gray-700 hover:text-primary"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {isMenuOpen && (
            <form onSubmit={handleSearch} className="md:hidden mt-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary"
                >
                  <Search size={20} />
                </button>
              </div>
            </form>
          )}

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 space-y-3 border-t pt-4">
              <Link 
                to="/" 
                className="block py-2 text-gray-700 hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/automotive-parts" 
                className="block py-2 text-gray-700 hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Car size={18} className="inline mr-2" /> Auto Parts
              </Link>
              <Link 
                to="/electronics" 
                className="block py-2 text-gray-700 hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Cpu size={18} className="inline mr-2" /> Electronics
              </Link>
              <Link 
                to="/payment-methods" 
                className="block py-2 text-gray-700 hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Wallet size={18} className="inline mr-2" /> Payment Methods
              </Link>
              <Link 
                to="/contact" 
                className="block py-2 text-gray-700 hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <Link 
                to="/cart" 
                className="block py-2 text-gray-700 hover:text-primary transition-colors"
                onClick={() => {
                  setIsMenuOpen(false);
                  setShowCart(true);
                  toggleCart();
                }}
              >
                <ShoppingBag size={18} className="inline mr-2" /> 
                View Cart ({cartItems.length})
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Cart Sidebar */}
      <CartSidebar 
        isOpen={showCart} 
        onClose={() => {
          setShowCart(false);
          toggleCart();
        }}
      />
    </>
  );
}

export default Header;