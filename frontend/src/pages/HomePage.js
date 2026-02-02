import React from 'react';
import Hero from '../components/Hero';
import ProductGrid from '../components/ProductGrid';

function HomePage() {
  return (
    <div className="flex-grow">
      <Hero />
      <ProductGrid />
      {/* Additional sections can be added here */}
    </div>
  );
}

export default HomePage;
