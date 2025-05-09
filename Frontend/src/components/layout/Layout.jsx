import React from 'react';
import PropTypes from 'prop-types';
import Navigation from './Navigation';
import CurrencyDisplay from '../common/CurrencyDisplay';
import { colors } from '../../styles/theme';
import { convertCurrencyType } from '../../utils/currency';

const Layout = ({ children, token, userData, onLogout, currentTab, onTabChange }) => {
  const headerStyle = {
    position: 'sticky',
    top: 0,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: colors.background.elevated,
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    zIndex: 1000
  };

  const logoutButtonStyle = {
    backgroundColor: 'transparent',
    color: colors.text.secondary,
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '0.9em'
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header with logout button and currency display */}
      <header style={headerStyle}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.2em' }}>
            Imperium
          </h3>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {userData && (
            <div className="header-currency-display" style={{ display: 'flex', gap: '15px' }}>
              <CurrencyDisplay 
                amount={userData?.silver || 0} 
                type="common"
                size="small"
                showName={false}
              />
              <CurrencyDisplay 
                amount={userData?.gold || 0} 
                type="premium"
                size="small"
                showName={false}
              />
            </div>
          )}
          <button 
            onClick={onLogout} 
            style={logoutButtonStyle}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main content area */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto',
        padding: '16px',
        paddingBottom: '70px' // Add space for navigation
      }}>
        {children}
      </div>
      
      {/* Add Navigation component here */}
      <Navigation 
        currentTab={currentTab}
        onTabChange={onTabChange}
      />
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  token: PropTypes.string,
  userData: PropTypes.object,
  onLogout: PropTypes.func,
  currentTab: PropTypes.number,
  onTabChange: PropTypes.func
};

export default Layout;