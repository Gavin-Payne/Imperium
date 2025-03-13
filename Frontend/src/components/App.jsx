import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

// Layout Components
import Layout from './layout/Layout';
import Navigation from './layout/Navigation';
import Dashboard from './dashboard/Dashboard';
import CurrencyDisplay from './common/CurrencyDisplay';
import TradingInterface from './trading/TradingInterface';
import AuctionHouse from './auctions/AuctionHouse';
import ActiveAuctions from './auctions/ActiveAuctions';
import SignIn from './auth/SignIn';
import SignUp from './auth/SignUp';
import Settings from './settings/Settings';

// Custom Hooks
import { useAuth } from '../hooks/useAuth';
import { useAuctions } from '../hooks/useAuctions';
import { useCurrency } from '../hooks/useCurrency';

import {
  darkAppStyle,
  darkHeaderStyle,
  darkContainerStyle,
  darkSubscriptButtonStyle,
  interfaceContainerStyle
} from '../styles/components/app.styles';

function App() {
  const { 
    token, 
    userData, 
    login, 
    logout 
  } = useAuth();

  const {
    allAuctions,
    activeAuctions,
    successfulAuctions,
    handleSearch,
    handleBuyAuction,
    handleCreateAuction
  } = useAuctions(token);

  const {
    dailyCollected,
    handleDailyAllowance
  } = useCurrency(token);

  const [activeTab, setActiveTab] = useState(0);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const handleTabChange = (tab) => {
    if (typeof tab === 'number' && tab >= 0 && tab <= 4) {
      setActiveTab(tab);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <Dashboard 
            userData={userData}
            successfulAuctions={successfulAuctions}
            dailyCollected={dailyCollected}
            onDailyCollect={handleDailyAllowance}
          />
        );
      case 1:
        return (
          <TradingInterface 
            onSubmit={handleCreateAuction}
            userData={userData}
            token={token}
          />
        );
      case 2:
        return (
          <ActiveAuctions 
            auctions={activeAuctions}
            currentUserId={userData?._id}
            token={token}
          />
        );
      case 3:
        return (
          <AuctionHouse
            auctions={allAuctions}
            currentUserId={userData?._id}
            onBuy={handleBuyAuction}
            onSearch={handleSearch}
            userData={userData}
            token={token}
          />
        );
      case 4:
        return (
          <Settings 
            userData={userData}
          />
        );
      default:
        return null;
    }
  };

  if (!token) {
    return (
      <div style={darkAppStyle}>
        <h1 style={darkHeaderStyle}>Imperium</h1>
        <div style={darkContainerStyle}>
          {isSignUp ? (
            <SignUp setToken={login} />
          ) : (
            <SignIn setToken={login} />
          )}
          <p style={{ textAlign: 'center', marginTop: '10px', color: '#ccc' }}>
            {isSignUp ? (
              <span>
                Already have an account?{' '}
                <button onClick={() => setIsSignUp(false)} style={darkSubscriptButtonStyle}>
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                Don't have an account?{' '}
                <button onClick={() => setIsSignUp(true)} style={darkSubscriptButtonStyle}>
                  Sign Up
                </button>
              </span>
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Layout
      token={token}
      userData={userData}
      onLogout={logout}
      currentTab={activeTab}
      onTabChange={setActiveTab}
    >
      <div style={interfaceContainerStyle}>
        {renderTabContent()}
      </div>
    </Layout>
  );
}

export default App;
