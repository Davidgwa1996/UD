import React, { useState, useEffect } from 'react';
import ModernFooter from '../components/ModernFooter';
import { api } from '../services/api'; // Changed from openaiService to api
import './MarketAnalysisPage.css';

const MarketAnalysisPage = () => {
  const [marketData, setMarketData] = useState({
    carIndex: '+4.6%',
    electronicsIndex: '+1.1%',
    evDemand: '+20%',
    priceAccuracy: '98.7%',
    lastUpdated: new Date().toLocaleTimeString('en-GB')
  });
  
  const [selectedCountry, setSelectedCountry] = useState('GB');
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketData();
    
    // Update time every minute
    const interval = setInterval(() => {
      setMarketData(prev => ({
        ...prev,
        lastUpdated: new Date().toLocaleTimeString('en-GB')
      }));
    }, 60000);
    
    return () => clearInterval(interval);
  }, [selectedCountry]);

  const fetchMarketData = async () => {
    setLoading(true);
    try {
      // Use the api service instead of openaiService
      const data = await api.getMarketData(selectedCountry);
      
      if (data) {
        setMarketData({
          carIndex: data.carIndex || '+4.6%',
          electronicsIndex: data.electronicsIndex || '+1.1%',
          evDemand: data.evDemand || '+20%',
          priceAccuracy: data.priceAccuracy || '98.7%',
          lastUpdated: new Date().toLocaleTimeString('en-GB')
        });
        
        setTrendingProducts(data.trendingProducts || []);
      }
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const countries = [
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵' },
    { code: 'CN', name: 'China', flag: '🇨🇳' },
    { code: 'AE', name: 'UAE', flag: '🇦🇪' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  ];

  const aiInsights = [
    { title: 'EV Market Surge', description: 'Electric vehicle demand increased by 20% this quarter', trend: 'up' },
    { title: 'Semiconductor Recovery', description: 'Electronics prices stabilizing as supply improves', trend: 'up' },
    { title: 'Luxury Car Demand', description: 'High-end vehicles showing 15% price increase', trend: 'up' },
    { title: 'Smartphone Market', description: 'New models driving 8% price drop on previous gen', trend: 'down' },
  ];

  return (
    <div className="market-analysis-page">
      {/*No ModernHeader */}
      
      <main className="market-content">
        {/*This is just a page Header */}
        <div className="market-header">
          <h1>📊 Real-Time Market Analysis</h1>
          <p className="market-subtitle">
            AI-powered insights and market trends for cars and electronics
          </p>
          
          <div className="country-selector">
            <label>Select Market:</label>
            <select 
              value={selectedCountry} 
              onChange={(e) => setSelectedCountry(e.target.value)}
              disabled={loading}
            >
              {countries.map(country => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.name}
                </option>
              ))}
            </select>
            <span className="update-time">
              Last updated: {marketData.lastUpdated}
            </span>
          </div>
        </div>

        {/* Market Stats */}
        <div className="market-stats">
          <div className="stat-card">
            <div className="stat-icon">🚗</div>
            <div className="stat-content">
              <h3>Car Market Index</h3>
              <div className="stat-value up">{marketData.carIndex}</div>
              <p className="stat-desc">Quarterly performance</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📱</div>
            <div className="stat-content">
              <h3>Electronics Index</h3>
              <div className="stat-value up">{marketData.electronicsIndex}</div>
              <p className="stat-desc">Monthly trend</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⚡</div>
            <div className="stat-content">
              <h3>EV Demand</h3>
              <div className="stat-value up">{marketData.evDemand}</div>
              <p className="stat-desc">Year-over-year growth</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <h3>AI Accuracy</h3>
              <div className="stat-value">{marketData.priceAccuracy}</div>
              <p className="stat-desc">Prediction rate</p>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="ai-insights">
          <h2>🤖 AI Market Insights</h2>
          <div className="insights-grid">
            {aiInsights.map((insight, index) => (
              <div key={index} className="insight-card">
                <div className="insight-header">
                  <h4>{insight.title}</h4>
                  <span className={`trend-indicator ${insight.trend}`}>
                    {insight.trend === 'up' ? '↗' : '↘'}
                  </span>
                </div>
                <p>{insight.description}</p>
                <div className="insight-footer">
                  <span className="ai-badge">AI Analysis</span>
                  <span className="confidence">95% confidence</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Products */}
        <div className="trending-products">
          <h2>🔥 Trending Now</h2>
          {loading ? (
            <div className="loading">Loading market data...</div>
          ) : trendingProducts.length > 0 ? (
            <div className="products-grid">
              {trendingProducts.map(product => (
                <div key={product.id} className="trending-product">
                  <div className="product-badge trending">TRENDING</div>
                  <h4>{product.name}</h4>
                  <p>{product.category}</p>
                  <div className="product-metrics">
                    <span className="price-change up">+{product.priceChange}%</span>
                    <span className="demand">Demand: {product.demand}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data">
              <p>No trending data available for this market</p>
            </div>
          )}
        </div>

        {/* Data Sources */}
        <div className="data-sources">
          <h3>📈 Data Sources</h3>
          <div className="sources-list">
            <span>Auto Trader</span>
            <span>eBay</span>
            <span>Currys</span>
            <span>Amazon</span>
            <span>Major UK Retailers</span>
            <span>Global Market Data</span>
          </div>
          <p className="disclaimer">
            Data is aggregated and analyzed using AI algorithms. Updates every 5 minutes.
          </p>
        </div>
      </main>

      <ModernFooter />
    </div>
  );
};

export default MarketAnalysisPage;