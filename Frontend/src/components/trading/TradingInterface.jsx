import React from 'react';
import AuctionForm from './AuctionForm';
import { interfaceContainerStyle } from '../../styles/components/app.styles';

const TradingInterface = ({ onSubmit, userData }) => {
  // Get token from localStorage
  const token = localStorage.getItem('token');
  
  console.log('TradingInterface props:', { 
    hasOnSubmit: typeof onSubmit === 'function',
    hasUserData: !!userData
  });
  
  return (
    <div style={interfaceContainerStyle}>
      <h2>Create Auction</h2>
      <AuctionForm 
        onSubmit={onSubmit} 
        userData={userData}
        token={token}
      />
    </div>
  );
};

export default TradingInterface;