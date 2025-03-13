import React from 'react';
import { formatWithSymbol } from '../../utils/currency';

const DailyAllowance = ({ dailyCollected, onCollect }) => {
  return (
    <div style={{
      backgroundColor: '#2c2c2c',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '20px'
    }}>
      <h3>Daily Allowance</h3>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '10px'
      }}>
        <div>
          <p>Collect your daily: {formatWithSymbol(100, 'silver')} & {formatWithSymbol(100, 'gold')}</p>
        </div>
        <button
          onClick={onCollect}
          disabled={dailyCollected}
          style={{
            backgroundColor: dailyCollected ? '#666' : '#4caf50',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: dailyCollected ? 'not-allowed' : 'pointer'
          }}
        >
          {dailyCollected ? 'Already Collected' : 'Collect'}
        </button>
      </div>
    </div>
  );
};

export default DailyAllowance;