import React from 'react';
import PropTypes from 'prop-types';
import { colors } from '../../styles/theme';

const Navigation = ({ currentTab, onTabChange }) => {
  const navStyle = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background.elevated,
    display: 'flex',
    justifyContent: 'space-around',
    padding: '10px',
    zIndex: 1000
  };

  const tabStyle = {
    padding: '10px 20px',
    border: 'none',
    backgroundColor: 'transparent',
    color: colors.text.secondary,
    cursor: 'pointer',
    fontSize: '1em',
    transition: 'all 0.3s ease'
  };

  const activeTabStyle = {
    ...tabStyle,
    color: colors.primary,
    borderBottom: `2px solid ${colors.primary}`
  };

  return (
    <nav style={navStyle}>
      <button 
        onClick={() => onTabChange(0)}
        style={currentTab === 0 ? activeTabStyle : tabStyle}
      >
        Dashboard
      </button>
      <button 
        onClick={() => onTabChange(1)}
        style={currentTab === 1 ? activeTabStyle : tabStyle}
      >
        Trade
      </button>
      <button 
        onClick={() => onTabChange(2)}
        style={currentTab === 2 ? activeTabStyle : tabStyle}
      >
        Active
      </button>
      <button 
        onClick={() => onTabChange(3)}
        style={currentTab === 3 ? activeTabStyle : tabStyle}
      >
        Market
      </button>
      <button 
        onClick={() => onTabChange(4)}
        style={currentTab === 4 ? activeTabStyle : tabStyle}
      >
        Settings
      </button>
    </nav>
  );
};

Navigation.propTypes = {
  currentTab: PropTypes.number.isRequired,
  onTabChange: PropTypes.func.isRequired
};

export default Navigation;