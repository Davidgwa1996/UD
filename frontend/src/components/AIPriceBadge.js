import React from 'react';
import './AIPriceBadge.css';

const AIPriceBadge = ({ 
  changePercent, 
  location, 
  updatedAt = '3m ago',
  trend = changePercent >= 0 ? 'up' : 'down'
}) => {
  const formattedChange = `${changePercent > 0 ? '+' : ''}${changePercent}%`;
  
  return (
    <div className="ai-price-badge">
      <div className="badge-header">
        <span className="ai-label">AI-PRICED</span>
        <span className="update-time">Updated {updatedAt}</span>
      </div>
      <div className="badge-body">
        <span className="location">{location}</span>
        <span className={`price-change ${trend}`}>
          {formattedChange}
        </span>
      </div>
    </div>
  );
};

export default AIPriceBadge;