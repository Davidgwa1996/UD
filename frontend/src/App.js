// frontend/src/App.js - FINAL VERSION
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './components/contexts/CartContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CategoryPage from './pages/CategoryPage';
import AutomotivePartsPage from './pages/AutomotivePartsPage';
import ElectronicsPage from './pages/ElectronicsPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentMethodsPage from './pages/PaymentMethodsPage';
import CartPage from './pages/CartPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import ContactPage from './pages/ContactPage';

function App() {
  return (
    <Router>
      <CartProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/product/:category/:id" element={<ProductDetailPage />} />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route path="/automotive-parts" element={<AutomotivePartsPage />} />
            <Route path="/electronics" element={<ElectronicsPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/payment-methods" element={<PaymentMethodsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </Layout>
      </CartProvider>
    </Router>
  );
}

export default App;