import React from 'react';
import { formatCurrency } from '../../utils/currency';
import commonIcon from '../../assets/common.png';
import premiumIcon from '../../assets/premium.png';

const CurrencyDisplay = ({ 
  amount, 
  type = 'common',  // 'common' or 'premium'
  size = 'medium',  // 'small', 'medium', or 'large'
  showName = true,
  className = '' 
}) => {
  // Legacy support (convert silver/gold to common/premium)
  const actualType = type === 'silver' ? 'common' : type === 'gold' ? 'premium' : type;
  
  // Determine icon based on currency type
  const icon = actualType === 'premium' ? premiumIcon : commonIcon;
  
  // Determine currency name
  const name = actualType === 'premium' ? 'Imperium' : 'Credits';
  
  // Determine icon size based on component size
  const iconSizes = {
    small: '14px',
    medium: '18px',
    large: '24px'
  };
  
  // Determine text size based on component size
  const textSizes = {
    small: '0.9rem',
    medium: '1rem',
    large: '1.2rem'
  };
  
  return (
    <div 
      className={`currency-display ${className}`}
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center',
        fontWeight: '500'
      }}
    >
      <img 
        src={icon} 
        alt={name}
        style={{ 
          width: iconSizes[size], 
          height: iconSizes[size], 
          marginRight: '4px',
          verticalAlign: 'middle'
        }} 
      />
      <span style={{ fontSize: textSizes[size] }}>
        {formatCurrency(amount)}
        {showName && <span style={{ marginLeft: '4px', opacity: 0.8 }}>{name}</span>}
      </span>
    </div>
  );
};

export default CurrencyDisplay;