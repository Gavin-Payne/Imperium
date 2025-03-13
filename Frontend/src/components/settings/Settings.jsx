import React from 'react';
import { colors, spacing } from '../../styles/theme';
import { modernHeadingStyle } from '../../styles/components/text.styles';

const Settings = ({ userData }) => {
  if (!userData) return <div>Loading...</div>;

  const statStyle = {
    backgroundColor: colors.background.elevated,
    padding: spacing.lg,
    borderRadius: '8px',
    marginBottom: spacing.md
  };

  const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: spacing.lg,
    marginTop: spacing.xl
  };

  const calculateWinRate = () => {
    if (!userData.transactions) return '0%';
    return `${((userData.winRate / userData.transactions) * 100).toFixed(1)}%`;
  };

  return (
    <div style={{ padding: spacing.lg }}>
      <h2 style={modernHeadingStyle}>Settings & Statistics</h2>

      <div style={statsGridStyle}>
        {/* Currency Statistics */}
        <div style={statStyle}>
          <h3 style={{ color: colors.text.highlight }}>Currency</h3>
          <p>Silver: ⚪ {userData.silver.toFixed(2)}</p>
          <p>Gold: 🌟 {userData.gold.toFixed(2)}</p>
        </div>

        {/* Trading Statistics */}
        <div style={statStyle}>
          <h3 style={{ color: colors.text.highlight }}>Trading Stats</h3>
          <p>Total Transactions: {userData.transactions}</p>
          <p>Win Rate: {calculateWinRate()}</p>
          <p>Total Winnings: {userData.winnings.toFixed(2)}</p>
        </div>

        {/* Account Information */}
        <div style={statStyle}>
          <h3 style={{ color: colors.text.highlight }}>Account Info</h3>
          <p>Username: {userData.username}</p>
          <p>Email: {userData.email || 'Not set'}</p>
          <p>Member Since: {new Date(userData.createdAt).toLocaleDateString()}</p>
        </div>

        {/* Daily Allowance Status */}
        <div style={statStyle}>
          <h3 style={{ color: colors.text.highlight }}>Daily Allowance</h3>
          <p>Status: {userData.dailyCollected ? 'Collected' : 'Available'}</p>
          {userData.dailyCollected && (
            <p>Next Reset: {new Date(userData.nextDailyAllowance).toLocaleTimeString()}</p>
          )}
        </div>
      </div>

      {/* Future Features Section */}
      <div style={{ 
        ...statStyle, 
        marginTop: spacing.xl,
        textAlign: 'center',
        color: colors.text.secondary 
      }}>
        <h3 style={{ color: colors.text.accent }}>Coming Soon</h3>
        <p>• Customizable Theme Settings</p>
        <p>• Notification Preferences</p>
        <p>• Advanced Trading Statistics</p>
        <p>• Achievement System</p>
      </div>
    </div>
  );
};

export default Settings;