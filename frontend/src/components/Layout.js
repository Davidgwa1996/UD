import React, { useState } from 'react';
import Header from './ModernHeader';
import Footer from './ModernFooter';
import './Layout.css';

function Layout({ 
  children, 
  showHeader = true, 
  showFooter = true,
  // Optional mobile menu props
  isMobileMenuOpen: externalMobileMenuOpen,
  onMobileMenuToggle: externalOnMobileMenuToggle
}) {
  // Internal state for mobile menu if not controlled externally
  const [internalMobileMenuOpen, setInternalMobileMenuOpen] = useState(false);
  
  // Use external props if provided, otherwise use internal state
  const isMobileMenuOpen = externalMobileMenuOpen !== undefined 
    ? externalMobileMenuOpen 
    : internalMobileMenuOpen;
    
  const handleMobileMenuToggle = externalOnMobileMenuToggle || 
    (() => setInternalMobileMenuOpen(!isMobileMenuOpen));

  // Close mobile menu when clicking outside (if internally controlled)
  const handleCloseMobileMenu = () => {
    if (externalMobileMenuOpen === undefined) {
      setInternalMobileMenuOpen(false);
    }
  };

  return (
    <div className="layout">
      {showHeader && (
        <Header 
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenuToggle={handleMobileMenuToggle}
        />
      )}
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-menu-overlay"
          onClick={handleCloseMobileMenu}
        />
      )}
      
      <main className="main-content">
        <div className="container">
          {children}
        </div>
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
}

export default Layout;