import React from 'react';
import Header from './Header';
import Footer from './Footer';
import SearchBar from './SearchBar';
import CartSidebar from './CartSidebar';

function Layout({ children }) {
  return (
    <div className="app">
      <Header />
      <SearchBar /> {/* Add search bar here */}
      <main className="main-content">
        {children}
      </main>
      <CartSidebar />
      <Footer />
    </div>
  );
}

export default Layout;