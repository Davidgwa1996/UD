import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard'; // AI-priced card component
import axios from 'axios';

function AutomotivePartsPage() {
  const [autoParts, setAutoParts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch AI-priced automotive parts from backend or AI API
  useEffect(() => {
    const fetchAutomotiveParts = async () => {
      try {
        const response = await axios.get('/api/ai-pricing/automotive'); // Replace with your real API endpoint
        setAutoParts(response.data);
      } catch (error) {
        console.error('Error fetching automotive parts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAutomotiveParts();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow py-10 px-4 sm:px-8 lg:px-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
          Live AI-Priced Automotive Parts Marketplace
        </h1>
        <p className="text-gray-600 mb-8">
          Real-time prices analyzed from trusted UK & US sources like AutoTrader, eBay Motors, Amazon, CEX, and others. Updated every 5 minutes with dynamic AI algorithms.
        </p>

        {loading ? (
          <div className="text-center text-gray-500">Loading real-time parts and prices...</div>
        ) : autoParts.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {autoParts.map((product) => (
              <ProductCard key={product.id} product={product} aiPriced={true} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">No automotive parts available at the moment.</div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default AutomotivePartsPage;
