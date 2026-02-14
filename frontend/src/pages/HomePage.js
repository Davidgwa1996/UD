import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ProductGrid from '../components/ProductGrid';
import CarouselRow from '../components/CarouselRow';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marketData, setMarketData] = useState({
    usIndex: '+3.2%',
    ukIndex: '+2.8%',
    chinaIndex: '+4.1%',
    japanIndex: '+1.9%',
    lastUpdate: '23:08'
  });

  // ---------- GLOBAL PRODUCTS (FALLBACK) – FULL ARRAY ----------
  const globalProducts = [
    // US Market Products
    { 
      id: 1, 
      name: "Tesla Model Y Performance", 
      category: "Electric Cars", 
      price: 62990,
      originalPrice: 63990,
      market: "US", 
      rating: 4.8, 
      reviews: 445,
      stock: 12,
      image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=250&fit=crop&auto=format",
      description: "Dual Motor All-Wheel Drive, 3.5s 0-60 mph, 303 miles range",
      isAiPriced: true,
      aiChange: -1.56,
      aiLocation: "Liverpool",
      aiUpdated: "3m ago"
    },
    { 
      id: 2, 
      name: "MacBook Pro 16\" M3 Max", 
      category: "Laptops", 
      price: 3445,
      originalPrice: 3599,
      market: "US", 
      rating: 4.9, 
      reviews: 234,
      stock: 45,
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=250&fit=crop&auto=format",
      description: "12-core CPU, 36GB RAM, 1TB SSD, Liquid Retina XDR display",
      isAiPriced: true,
      aiChange: +0.29,
      aiLocation: "Liverpool",
      aiUpdated: "3m ago"
    },
    { 
      id: 3, 
      name: "iPhone 15 Pro Max 1TB", 
      category: "Smartphones", 
      price: 2398,
      originalPrice: 2199,
      market: "US", 
      rating: 4.7, 
      reviews: 567,
      stock: 89,
      image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=250&fit=crop&auto=format",
      description: "Titanium design, A17 Pro chip, 5x Telephoto, Action button",
      isAiPriced: true,
      aiChange: +7.1,
      aiLocation: "Edinburgh",
      aiUpdated: "3m ago"
    },
    { 
      id: 4, 
      name: "NVIDIA RTX 4090 Founders", 
      category: "PC Components", 
      price: 1599,
      originalPrice: 1799,
      market: "US", 
      rating: 4.9, 
      reviews: 128,
      stock: 14,
      image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400&h=250&fit=crop&auto=format",
      description: "24GB GDDR6X, DLSS 3, 4K gaming at 120+ FPS",
      isAiPriced: true,
      isNew: true,
      aiChange: -11.1,
      aiLocation: "Manchester",
      aiUpdated: "3m ago"
    },
    { 
      id: 5, 
      name: "Apple Vision Pro", 
      category: "VR/AR", 
      price: 3499,
      originalPrice: 3499,
      market: "US", 
      rating: 4.6, 
      reviews: 89,
      stock: 31,
      image: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=400&h=250&fit=crop&auto=format",
      description: "Spatial computing, 4K per eye, EyeSight display",
      isAiPriced: true,
      aiChange: 0,
      aiLocation: "London",
      aiUpdated: "3m ago"
    },
    
    // UK Market Products
    { 
      id: 6, 
      name: "Range Rover Sport P550e", 
      category: "Luxury Cars", 
      price: 89000,
      originalPrice: 89995,
      market: "UK", 
      rating: 4.6, 
      reviews: 67,
      stock: 8,
      image: "https://images.unsplash.com/photo-1593941707882-a5bba5338fe2?w=400&h=250&fit=crop&auto=format",
      description: "PHEV, 542 hp, 0-60 in 4.3s, Air suspension",
      isAiPriced: true,
      aiChange: -1.1,
      aiLocation: "Birmingham",
      aiUpdated: "3m ago"
    },
    { 
      id: 7, 
      name: "B&W Formation Wedge", 
      category: "Electronics", 
      price: 2499,
      originalPrice: 2699,
      market: "UK", 
      rating: 4.5, 
      reviews: 34,
      stock: 23,
      image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=250&fit=crop&auto=format",
      description: "Wireless hi-fi speaker, 240W, 360° sound",
      isAiPriced: true,
      aiChange: -7.4,
      aiLocation: "Leeds",
      aiUpdated: "3m ago"
    },
    { 
      id: 8, 
      name: "Alienware m18 R2", 
      category: "Gaming", 
      price: 3299,
      originalPrice: 3499,
      market: "UK", 
      rating: 4.8, 
      reviews: 56,
      stock: 17,
      image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=250&fit=crop&auto=format",
      description: "Intel Core i9-14900HX, RTX 4090, 18\" QHD+",
      isAiPriced: true,
      isNew: true,
      aiChange: -5.7,
      aiLocation: "Glasgow",
      aiUpdated: "3m ago"
    },
    { 
      id: 9, 
      name: "Jaguar I-PACE", 
      category: "Electric Cars", 
      price: 69999,
      originalPrice: 72990,
      market: "UK", 
      rating: 4.4, 
      reviews: 42,
      stock: 15,
      image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=400&h=250&fit=crop&auto=format",
      description: "395 hp, 234 miles range, All-wheel drive",
      isAiPriced: true,
      aiChange: -4.1,
      aiLocation: "Bristol",
      aiUpdated: "3m ago"
    },
    
    // China Market Products
    { 
      id: 10, 
      name: "Xiaomi SU7 Max", 
      category: "Electric Cars", 
      price: 41900,
      originalPrice: 43900,
      market: "China", 
      rating: 4.7, 
      reviews: 178,
      stock: 56,
      image: "https://images.unsplash.com/photo-1617868186608-87ae5c6f422c?w=400&h=250&fit=crop&auto=format",
      description: "495 kW, 0-100 km/h in 2.78s, 800 km range",
      isAiPriced: true,
      isNew: true,
      aiChange: -4.6,
      aiLocation: "Shanghai",
      aiUpdated: "3m ago"
    },
    { 
      id: 11, 
      name: "Huawei Mate 60 Pro+", 
      category: "Smartphones", 
      price: 1299,
      originalPrice: 1399,
      market: "China", 
      rating: 4.8, 
      reviews: 234,
      stock: 120,
      image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=250&fit=crop&auto=format",
      description: "Kunlun glass, HarmonyOS, Satellite calling",
      isAiPriced: true,
      aiChange: -7.1,
      aiLocation: "Beijing",
      aiUpdated: "3m ago"
    },
    { 
      id: 12, 
      name: "DJI Air 3 Fly More", 
      category: "Electronics", 
      price: 1699,
      originalPrice: 1799,
      market: "China", 
      rating: 4.9, 
      reviews: 89,
      stock: 34,
      image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&h=250&fit=crop&auto=format",
      description: "Dual cameras, 46 min flight, 20 km range",
      isAiPriced: true,
      aiChange: -5.6,
      aiLocation: "Shenzhen",
      aiUpdated: "3m ago"
    },
    
    // Japan Market Products
    { 
      id: 13, 
      name: "Toyota Century SUV", 
      category: "Luxury Cars", 
      price: 170000,
      originalPrice: 175000,
      market: "Japan", 
      rating: 4.9, 
      reviews: 23,
      stock: 5,
      image: "https://images.unsplash.com/photo-1555212697-194d092e3b8f?w=400&h=250&fit=crop&auto=format",
      description: "V6 hybrid, Executive seating, Privacy glass",
      isAiPriced: true,
      aiChange: -2.9,
      aiLocation: "Tokyo",
      aiUpdated: "3m ago"
    },
    { 
      id: 14, 
      name: "Sony A7RV Camera", 
      category: "Electronics", 
      price: 3899,
      originalPrice: 3999,
      market: "Japan", 
      rating: 4.8, 
      reviews: 67,
      stock: 28,
      image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=400&h=250&fit=crop&auto=format",
      description: "61MP, 8K video, AI autofocus, 5-axis stabilization",
      isAiPriced: true,
      aiChange: -2.5,
      aiLocation: "Osaka",
      aiUpdated: "3m ago"
    },
    { 
      id: 15, 
      name: "PlayStation 5 Pro", 
      category: "Gaming", 
      price: 699,
      originalPrice: 749,
      market: "Japan", 
      rating: 4.9, 
      reviews: 445,
      stock: 67,
      image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=250&fit=crop&auto=format",
      description: "Disc Edition, 4K/120fps, Ray Tracing, 825GB SSD",
      isAiPriced: true,
      isNew: true,
      aiChange: -6.7,
      aiLocation: "Nagoya",
      aiUpdated: "3m ago"
    }
  ];

  // Prepare items for carousels
  const classicCars = globalProducts
    .filter(p => p.category === "Electric Cars" || p.category === "Luxury Cars")
    .map(p => ({
      image: p.image,
      title: p.name,
      specs: p.description.split(',')[0] + (p.aiChange ? ` • ${p.aiChange > 0 ? '+' : ''}${p.aiChange}%` : ''),
      link: `/product/${p.id}`
    }));

  const electronics = globalProducts
    .filter(p => ["Laptops", "Smartphones", "PC Components", "Gaming", "VR/AR", "Electronics"].includes(p.category))
    .map(p => ({
      image: p.image,
      title: p.name,
      specs: p.description.split(',')[0] + (p.aiChange ? ` • ${p.aiChange > 0 ? '+' : ''}${p.aiChange}%` : ''),
      link: `/product/${p.id}`
    }));

  // 🔥 Combine both into one array for a single carousel
  const combinedItems = [...classicCars, ...electronics];

  // Market data helpers
  const updateMarketTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    setMarketData(prev => ({ ...prev, lastUpdate: `${hours}:${minutes}` }));
  };

  const simulateMarketUpdates = () => {
    const changes = {
      usIndex: (Math.random() * 0.4 - 0.2).toFixed(1),
      ukIndex: (Math.random() * 0.4 - 0.2).toFixed(1),
      chinaIndex: (Math.random() * 0.5 - 0.25).toFixed(1),
      japanIndex: (Math.random() * 0.3 - 0.15).toFixed(1)
    };
    setMarketData(prev => ({
      ...prev,
      usIndex: (parseFloat(prev.usIndex) + parseFloat(changes.usIndex)).toFixed(1) + '%',
      ukIndex: (parseFloat(prev.ukIndex) + parseFloat(changes.ukIndex)).toFixed(1) + '%',
      chinaIndex: (parseFloat(prev.chinaIndex) + parseFloat(changes.chinaIndex)).toFixed(1) + '%',
      japanIndex: (parseFloat(prev.japanIndex) + parseFloat(changes.japanIndex)).toFixed(1) + '%'
    }));
  };

  // Load products
  useEffect(() => {
    setFeaturedProducts(globalProducts);
    setLoading(false);

    const fetchRealProducts = async () => {
      try {
        const data = await api.getProducts({ featured: true, limit: 15 });
        if (data?.products?.length) {
          setFeaturedProducts(data.products);
        }
      } catch (error) {
        console.error('Background fetch failed – keeping fallback');
      }
    };
    fetchRealProducts();

    updateMarketTime();
    const timeInterval = setInterval(updateMarketTime, 60000);
    const marketInterval = setInterval(simulateMarketUpdates, 15000);
    return () => {
      clearInterval(timeInterval);
      clearInterval(marketInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <Layout isHomePage>
        <div className="loading-screen">
          <div className="loading-spinner" />
          <p>Loading global marketplace...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout isHomePage>
      <div className="home-hero">
        <h1>Global Marketplace Products</h1>
        <p>AI-priced deals from US, UK, China, and Japan markets</p>
      </div>

      {/* 🔥 Single full‑width carousel for both categories */}
      <CarouselRow title="Classic Cars & Electronics" items={combinedItems} />

      {/* Product Grid – fallback if featuredProducts empty */}
      <section className="products-section">
        <div className="section-header">
          <h2 className="section-title">Featured Global Products</h2>
          <p className="section-subtitle">
            Curated selection from verified international sellers • AI-powered dynamic pricing
          </p>
        </div>
        <ProductGrid products={featuredProducts.length ? featuredProducts : globalProducts} />
        <div className="view-all-container">
          <button onClick={() => navigate('/products')} className="view-all-btn">
            View All Products →
          </button>
        </div>
      </section>

      {/* Market Features (unchanged) */}
      <section className="market-features">
        <div className="section-header">
          <h2 className="section-title">Market Intelligence Features</h2>
          <p className="section-subtitle">Powered by AI for optimal pricing and insights</p>
        </div>
        <div className="features-grid">
          {[
            { icon: '📈', title: 'Live Market Indicator', desc: 'Real-time pricing trends across US, UK, China, Japan markets' },
            { icon: '🤖', title: 'AI-Priced Classic Cars', desc: 'Machine learning algorithms determine fair market value' },
            { icon: '⚡', title: 'Real-Time Market Prices', desc: 'Updated prices reflecting current market conditions' },
            { icon: '🏷️', title: 'Featured Deals', desc: 'Curated best-value products from global markets' }
          ].map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-description">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Global Market Indices */}
      <section className="market-data-section">
        <div className="section-header">
          <h2 className="section-title">Global Market Indices</h2>
          <p className="update-time">Updated: {marketData.lastUpdate}</p>
        </div>
        <div className="market-indices">
          {[
            { flag: '🇺🇸', name: 'US Market', value: marketData.usIndex },
            { flag: '🇬🇧', name: 'UK Market', value: marketData.ukIndex },
            { flag: '🇨🇳', name: 'China Market', value: marketData.chinaIndex },
            { flag: '🇯🇵', name: 'Japan Market', value: marketData.japanIndex }
          ].map((m, i) => (
            <div key={i} className="market-index">
              <span className="market-flag">{m.flag}</span>
              <span className="market-name">{m.name}</span>
              <span className={`market-value ${m.value.includes('+') ? 'positive' : 'negative'}`}>
                {m.value}
              </span>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;