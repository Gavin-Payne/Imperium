import React from 'react';
import SilverIcon from '../assets/Silver.png';
import GoldIcon from '../assets/Gold.png';

const currencyContainerStyle = {
  position: 'absolute',
  top: '20px',
  left: '20px',
  display: 'flex',
  gap: '10px',
};

const currencyBoxStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  padding: '5px 10px',
  border: '1px solid #555',
  borderRadius: '5px',
  backgroundColor: '#333',
  color: '#fff',
};

const currencyIconStyle = {
  width: '24px',
  height: '24px',
};

const CurrencyDisplay = ({ silver, gold }) => {
  return (
    <div style={currencyContainerStyle}>
      <div style={currencyBoxStyle}>
        <img src={SilverIcon} alt="Silver" style={currencyIconStyle} />
        <span>{silver}</span>
      </div>
      <div style={currencyBoxStyle}>
        <img src={GoldIcon} alt="Gold" style={currencyIconStyle} />
        <span>{gold}</span>
      </div>
    </div>
  );
};

export default CurrencyDisplay;