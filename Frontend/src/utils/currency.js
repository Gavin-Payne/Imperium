// Import the icons as image assets
import commonIcon from '../assets/common.png';  // PNG file
import premiumIcon from '../assets/premium.png'; // PNG file

// Define currency names directly in this file
const COMMON_CURRENCY_NAME = 'SBM';
const PREMIUM_CURRENCY_NAME = 'ALF';

// Format number to 2 decimal places
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '0.00';
  return parseFloat(Number(amount).toFixed(2));
};

// Calculate cost to buy an auction
export const calculateAuctionCost = (betSize, multiplier) => {
  const rawCost = betSize * (multiplier - 1);
  return formatCurrency(rawCost);
};

// Calculate total payout (bet size + cost)
export const calculateTotalPayout = (betSize, cost) => {
  return formatCurrency(betSize + cost);
};

// Check if user has enough funds
export const hasSufficientFunds = (userBalance, cost) => {
  return userBalance >= cost;
};

// Get currency icon URL based on type
export const getCurrencyIcon = (type) => {
  return type === 'premium' ? premiumIcon : commonIcon;
};

// Create a React component to display currency with icon
export const CurrencyDisplay = ({ amount, type, className }) => {
  const icon = getCurrencyIcon(type);
  const formattedAmount = formatCurrency(amount);
  
  return (
    <span className={className || ''}>
      <img 
        src={icon} 
        alt={type === 'premium' ? 'Premium' : 'Common'} 
        style={{ 
          height: '1em', 
          width: 'auto', 
          marginRight: '0.25em',
          verticalAlign: 'middle' 
        }} 
      />
      {formattedAmount}
    </span>
  );
};

// Format amount with symbol (for text displays)
export const formatWithSymbol = (amount, type) => {
  const formatted = formatCurrency(amount);
  // Use Unicode symbols instead of requiring icons for text
  return `${type === 'premium' ? '✦' : '○'} ${formatted}`;
};

// Format amount with full name (for more formal displays)
export const formatWithName = (amount, type) => {
  const formatted = formatCurrency(amount);
  const name = type === 'premium' ? PREMIUM_CURRENCY_NAME : COMMON_CURRENCY_NAME;
  return `${formatted} ${name}`;
};

// Convert between old and new currency types (for backward compatibility)
export const convertCurrencyType = (oldType) => {
  if (oldType === 'gold') return 'premium';
  if (oldType === 'silver') return 'common';
  return oldType; // Return as-is if already using new system
};

// Get display name for a currency type
export const getCurrencyName = (type) => {
  return type === 'premium' ? PREMIUM_CURRENCY_NAME : COMMON_CURRENCY_NAME;
};