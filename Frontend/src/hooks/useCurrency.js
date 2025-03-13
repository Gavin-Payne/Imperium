import { useState } from 'react';
import { userService } from '../services/userService';

export const useCurrency = (token) => {
  const [dailyCollected, setDailyCollected] = useState(false);

  const handleDailyAllowance = async () => {
    try {
      // Use the userService instead of making a direct API call
      const response = await userService.claimDailyAllowance();
      
      // Update state to show allowance was collected
      setDailyCollected(true);
      
      // Return the response data for use in components
      return {
        success: true,
        message: 'Daily allowance collected!',
        silver: response.silver,
        gold: response.gold
      };
    } catch (error) {
      console.error('Error collecting daily allowance:', error);
      
      // If the error says user already collected, set state accordingly
      if (error && error.message && error.message.includes('already been collected')) {
        setDailyCollected(true);
        return {
          success: false,
          collected: true,
          message: 'Already collected today'
        };
      }
      
      return {
        success: false,
        collected: false,
        message: 'Failed to collect daily allowance'
      };
    }
  };

  return {
    dailyCollected,
    handleDailyAllowance
  };
};