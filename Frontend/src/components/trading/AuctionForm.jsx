import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaUsers, FaUserAlt, FaChartLine, FaClock, FaCoins, FaPercent, FaInfoCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import GameSelector from './GameSelector';
import PlayerSelector from './PlayerSelector';
import BetTypeSelector from './BetTypeSelector';
import { 
  modernInputStyle, 
  modernSelectStyle
} from '../../styles/components/forms.styles';
import {
  enhancedFormStyle,
  formGroupStyle,
  labelStyle,
  iconStyle,
  sectionStyle,
  sectionTitleStyle,
  formTitleStyle,
  betAmountContainerStyle,
  betAmountLabelStyle,
  betAmountIconStyle,
  betInputContainerStyle,
  betInputWrapperStyle,
  betInputStyle,
  currencyDropdownContainerStyle,
  currencyDropdownStyle,
  dropdownArrowStyle,
  balanceContainerStyle,
  balanceLabelStyle,
  balanceAmountContainerStyle,
  currencyIconStyle,
  quickAmountButtonsContainerStyle,
  quickAmountButtonStyle,
  potentialWinningsContainerStyle,
  potentialWinningsAmountStyle,
  betSummaryContainerStyle,
  betSummaryTitleStyle,
  betSummaryTextStyle,
  errorContainerStyle,
  submitButtonStyle,
  submitButtonDisabledStyle,
  metricsGridStyle,
  metricsLabelStyle
} from '../../styles/components/auctionForm.styles';
// Import the currency icons
import commonIcon from '../../assets/common.png';
import premiumIcon from '../../assets/premium.png';

// Define colors object for use within the component
const colors = {
  primary: '#6366F1',
  success: '#4CAF50',
  warning: '#FFC107',
  danger: '#F44336',
  text: {
    primary: '#FFFFFF',
    secondary: '#AAAAAA',
    disabled: '#777777'
  },
  background: {
    main: '#121212',
    elevated: '#1E1E1E',
    hover: '#2A2A2A'
  }
};

const CURRENCY_NAMES = {
  common: 'Credits',
  premium: 'Imperium'
};

const AuctionForm = ({ onSubmit, userData, token }) => {
  // Form state
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedGame, setSelectedGame] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [selectedMetric, setSelectedMetric] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('over');
  const [metricValue, setMetricValue] = useState('');
  const [betType, setBetType] = useState('common');
  const [betSize, setBetSize] = useState('');
  const [multiplier, setMultiplier] = useState(2.0);
  const [duration, setDuration] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableGames, setAvailableGames] = useState([]);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [potentialWinnings, setPotentialWinnings] = useState(0);
  const [activeSection, setActiveSection] = useState(1);
  const [multiplierInputFocused, setMultiplierInputFocused] = useState(false);
  
  // Calculate potential winnings when bet size or multiplier changes
  useEffect(() => {
    if (betSize && multiplier) {
      const winnings = betSize * multiplier;
      setPotentialWinnings(winnings);
    } else {
      setPotentialWinnings(0);
    }
  }, [betSize, multiplier]);
  
  // Helper function to convert old currency types to new ones
  const convertCurrencyType = (oldType) => {
    if (oldType === 'gold') return 'premium';
    if (oldType === 'silver') return 'common';
    return oldType;
  };
  
  // Helper function to get currency property from userData
  const getCurrencyBalance = (currencyType) => {
    if (!userData) return 0;
    
    // Handle legacy currency types
    if (currencyType === 'common' || currencyType === 'silver') {
      return userData.silver || 0;
    }
    if (currencyType === 'premium' || currencyType === 'gold') {
      return userData.gold || 0;
    }
    
    return 0;
  };

  // Helper function to validate available funds
  const validateFunds = () => {
    if (!userData) return false;
    
    // Check based on currency type
    if (betType === 'premium' && betSize > userData.gold) {
      setFormError('You do not have enough Imperium for this bet.');
      return false;
    }
    
    if (betType === 'common' && betSize > userData.silver) {
      setFormError('You do not have enough Credits for this bet.');
      return false;
    }
    
    return true;
  };

  // Fetch games when date changes
  useEffect(() => {
    if (selectedDate) {
      fetchGames(selectedDate);
    }
  }, [selectedDate]);

  // Fetch players when game changes
  useEffect(() => {
    if (selectedGame) {
      fetchPlayers(selectedGame);
    }
  }, [selectedGame]);

  // Function to fetch games from API
  const fetchGames = async (date) => {
    // Existing code...
    try {
      setLoading(true);
      setFormError('');
      console.log('Fetching games for date:', date);
      
      const response = await fetch(
        `http://localhost:5000/api/auctions/games?date=${date}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch games (${response.status}): ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Games fetched:', data);
      
      if (Array.isArray(data) && data.length > 0) {
        setAvailableGames(data);
      } else {
        setFormError('No games found for this date');
        setAvailableGames([]);
      }
    } catch (error) {
      console.error('Error fetching games:', error);
      setFormError(`Failed to load games: ${error.message}`);
      setAvailableGames([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch players from API
  const fetchPlayers = async (game) => {
    // Existing code...
    try {
      setLoading(true);
      setFormError('');
      const teams = game.split(' vs ');
      
      console.log('Game selected:', game);
      console.log('Teams extracted:', teams);
      
      if (teams.length !== 2) {
        console.error('Invalid game format:', game);
        setFormError('Invalid game format');
        setAvailablePlayers([]);
        setLoading(false);
        return;
      }
      
      console.log('Fetching players for teams:', teams);
      
      const [team1Response, team2Response] = await Promise.all([
        fetch(`http://localhost:5000/api/players/${encodeURIComponent(teams[0])}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`http://localhost:5000/api/players/${encodeURIComponent(teams[1])}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (!team1Response.ok) {
        throw new Error(`Failed to fetch players for ${teams[0]}: ${team1Response.statusText}`);
      }
      if (!team2Response.ok) {
        throw new Error(`Failed to fetch players for ${teams[1]}: ${team2Response.statusText}`);
      }

      const team1Players = await team1Response.json();
      const team2Players = await team2Response.json();
      
      if (Array.isArray(team1Players) && Array.isArray(team2Players)) {
        setAvailablePlayers([...team1Players, ...team2Players]);
      } else {
        setFormError('Invalid player data received');
        setAvailablePlayers([]);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
      setFormError(`Failed to load players: ${error.message}`);
      setAvailablePlayers([]);
    } finally {
      setLoading(false);
    }
  };

  // Update the handleSubmit function to correct the date timezone issue
  const handleSubmit = (e) => {
    // Existing code...
    e.preventDefault();
    setFormError('');
    
    // Check if userData exists before checking currency balances
    if (!userData) {
      setFormError('User data not available. Please try again or reload the page.');
      return;
    }
    
    // Check if onSubmit is a function
    if (typeof onSubmit !== 'function') {
      console.error('onSubmit is not a function:', onSubmit);
      setFormError('Internal error: form submission handler is not available.');
      return;
    }
    
    // Validate form
    if (betType === 'gold' && betSize > userData.gold) {
      setFormError('You do not have enough gold for this bet.');
      return;
    }
    
    if (betType === 'silver' && betSize > userData.silver) {
      setFormError('You do not have enough silver for this bet.');
      return;
    }
    
    setLoading(true);
    
    // Fix date timezone issue by creating a proper date object
    // and adjusting it to ensure it represents the selected date correctly
    const correctedDate = new Date(selectedDate + 'T12:00:00');
    
    // Adding logging to verify correct date
    console.log('Date submitted:', {
      selectedDate,
      correctedDate,
      correctedDateISO: correctedDate.toISOString(),
      localDate: correctedDate.toLocaleDateString()
    });

    // Submit the form with the corrected date
    onSubmit({
      date: correctedDate.toISOString(),
      gameDate: correctedDate.toISOString(),
      game: selectedGame,
      player: selectedPlayer,
      condition: selectedCondition,
      value: metricValue,
      metric: selectedMetric,
      betSize: betSize,
      betType: betType,
      multiplier: multiplier,
      duration: duration
    })
    .then(() => {
      // Reset form on success
      setSelectedDate('');
      setSelectedGame('');
      setSelectedPlayer('');
      setSelectedMetric('');
      setMetricValue('');
      setBetSize('');
      setMultiplier(2.0);
      setDuration('');
    })
    .catch(err => {
      setFormError(err.message || 'Failed to create auction. Please try again.');
    })
    .finally(() => {
      setLoading(false);
    });
  };

  const formatCurrency = (value) => {
    return value ? value.toFixed(2) : "0.00";
  };

  // Convert multiplier to American odds
  const getAmericanOdds = (multiplier) => {
    const mult = parseFloat(multiplier);
    if (isNaN(mult) || mult <= 1) return "N/A";
    
    if (mult >= 2) {
      // For multipliers 2 or higher, American odds are positive (e.g., 2.0x = +100)
      return `+${Math.round((mult - 1) * 100)}`;
    } else {
      // For multipliers below 2, American odds are negative (e.g., 1.5x = -200)
      return `-${Math.round(100 / (mult - 1))}`;
    }
  };
  
  // Get text color based on odds value
  const getOddsColor = (odds) => {
    if (odds === "N/A") return colors.text.secondary;
    return odds.startsWith('+') ? colors.success : colors.danger;
  };

  // Helper function to get date boundaries
  const getDateBoundaries = () => {
    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayFormatted = today.toISOString().split('T')[0];
    
    // Get date 7 days from today
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);
    const maxDateFormatted = maxDate.toISOString().split('T')[0];
    
    return { min: todayFormatted, max: maxDateFormatted };
  };

  return (
    <form onSubmit={handleSubmit} style={enhancedFormStyle}>
      <h2 style={formTitleStyle}>
        Create New Auction
      </h2>
      
      {/* Game Selection Section */}
      <div 
        style={{
          ...sectionStyle,
          border: activeSection === 1 ? `1px solid ${colors.primary}` : '1px solid rgba(255,255,255,0.05)',
          boxShadow: activeSection === 1 ? `0 0 15px rgba(99, 102, 241, 0.15)` : 'none',
          transition: 'all 0.3s ease'
        }}
        onClick={() => setActiveSection(1)}
      >
        <h3 style={sectionTitleStyle}>
          <span style={{
            display: 'inline-block', 
            width: '24px',
            height: '24px',
            lineHeight: '24px',
            textAlign: 'center',
            borderRadius: '50%',
            background: activeSection === 1 ? colors.primary : 'rgba(255,255,255,0.1)',
            marginRight: '10px',
            fontSize: '0.9rem',
            transition: 'all 0.3s ease'
          }}>1</span>
          Game Selection
        </h3>
        
        <div style={formGroupStyle}>
          <label htmlFor="date" style={labelStyle}>
            <FaCalendarAlt style={iconStyle} />
            Game Date
          </label>
          <input
            id="date" 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={getDateBoundaries().min}
            max={getDateBoundaries().max}
            style={{
              ...modernInputStyle,
              height: '46px',
              fontSize: '1rem',
              // Add visual feedback for invalid dates
              border: selectedDate && 
                (selectedDate < getDateBoundaries().min || 
                 selectedDate > getDateBoundaries().max) 
                ? '1px solid #F44336' : undefined,
            }}
            required
          />
          <div style={{ 
            fontSize: '0.8rem', 
            color: colors.text.secondary, 
            marginTop: '5px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <FaInfoCircle size={12} />
            <span>Select a date between today and {new Date(getDateBoundaries().max).toLocaleDateString()}</span>
          </div>
        </div>

        <div style={formGroupStyle}>
          <label htmlFor="game" style={labelStyle}>
            <FaUsers style={iconStyle} />
            Game
          </label>
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            style={{
              ...modernSelectStyle,
              height: '46px',
              fontSize: '1rem',
            }}
            required
            disabled={!selectedDate || availableGames.length === 0}
          >
            <option value="">Select Game</option>
            {availableGames.map((game, index) => (
              <option key={index} value={game}>{game}</option>
            ))}
          </select>
          {loading && selectedDate && !selectedGame && (
            <p style={{ color: colors.text.secondary, fontSize: '0.9rem', marginTop: '5px' }}>Loading games...</p>
          )}
        </div>

        <div style={formGroupStyle}>
          <label htmlFor="player" style={labelStyle}>
            <FaUserAlt style={iconStyle} />
            Player
          </label>
          <select
            value={selectedPlayer}
            onChange={(e) => setSelectedPlayer(e.target.value)}
            style={{
              ...modernSelectStyle,
              height: '46px',
              fontSize: '1rem',
            }}
            required
            disabled={!selectedGame || availablePlayers.length === 0}
          >
            <option value="">Select Player</option>
            {availablePlayers.map((player, index) => (
              <option key={index} value={player}>{player}</option>
            ))}
          </select>
          {loading && selectedGame && !selectedPlayer && (
            <p style={{ color: colors.text.secondary, fontSize: '0.9rem', marginTop: '5px' }}>Loading players...</p>
          )}
        </div>
      </div>
      
      {/* Performance Metrics Section */}
      <div 
        style={{
          ...sectionStyle,
          border: activeSection === 2 ? `1px solid ${colors.primary}` : '1px solid rgba(255,255,255,0.05)',
          boxShadow: activeSection === 2 ? `0 0 15px rgba(99, 102, 241, 0.15)` : 'none',
          transition: 'all 0.3s ease'
        }}
        onClick={() => setActiveSection(2)}
      >
        <h3 style={sectionTitleStyle}>
          <span style={{
            display: 'inline-block', 
            width: '24px',
            height: '24px',
            lineHeight: '24px',
            textAlign: 'center',
            borderRadius: '50%',
            background: activeSection === 2 ? colors.primary : 'rgba(255,255,255,0.1)',
            marginRight: '10px',
            fontSize: '0.9rem',
            transition: 'all 0.3s ease'
          }}>2</span>
          Performance Metrics
        </h3>
        
        <div style={formGroupStyle}>
          <label style={labelStyle}>
            <FaChartLine style={iconStyle} />
            Performance Prediction
          </label>
          <div style={metricsGridStyle}>
            <div>
              <label style={metricsLabelStyle}>Condition</label>
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                style={{
                  ...modernSelectStyle,
                  height: '46px',
                  fontSize: '1rem',
                }}
                required
              >
                <option value="">Select</option>
                <option value="Over">Over</option>
                <option value="Under">Under</option>
                <option value="Exactly">Exactly</option>
                <option value="Not Exactly">Not Exactly</option>
              </select>
            </div>

            <div>
              <label style={metricsLabelStyle}>Value</label>
              <input
                type="number"
                placeholder="Value"
                value={metricValue}
                onChange={(e) => setMetricValue(e.target.value)}
                style={{
                  ...modernInputStyle,
                  height: '46px',
                  fontSize: '1rem',
                }}
                required
              />
            </div>

            <div>
              <label style={metricsLabelStyle}>Metric</label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                style={{
                  ...modernSelectStyle,
                  height: '46px',
                  fontSize: '1rem',
                }}
                required
              >
                <option value="">Select</option>
                <option value="points">Points</option>
                <option value="rebounds">Rebounds</option>
                <option value="assists">Assists</option>
                <option value="steals">Steals</option>
                <option value="blocks">Blocks</option>
                <option value="points + rebounds">Points + Rebounds</option>
                <option value="points + assists">Points + Assists</option>
                <option value="points + assists + rebounds">P+A+R</option>
                <option value="assists + rebounds">Assists + Rebounds</option>
                <option value="blocks + steals">Blocks + Steals</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Betting Details Section */}
      <div 
        style={{
          ...sectionStyle,
          border: activeSection === 3 ? `1px solid ${colors.primary}` : '1px solid rgba(255,255,255,0.05)',
          boxShadow: activeSection === 3 ? `0 0 15px rgba(99, 102, 241, 0.15)` : 'none',
          transition: 'all 0.3s ease'
        }}
        onClick={() => setActiveSection(3)}
      >
        <h3 style={sectionTitleStyle}>
          <span style={{
            display: 'inline-block', 
            width: '24px',
            height: '24px',
            lineHeight: '24px',
            textAlign: 'center',
            borderRadius: '50%',
            background: activeSection === 3 ? colors.primary : 'rgba(255,255,255,0.1)',
            marginRight: '10px',
            fontSize: '0.9rem',
            transition: 'all 0.3s ease'
          }}>3</span>
          Betting Details
        </h3>
        
        {/* Bet Amount - ENHANCED */}
        <div style={{...formGroupStyle, ...betAmountContainerStyle}}>
          <label style={{...labelStyle, ...betAmountLabelStyle}}>
            <FaCoins style={{...iconStyle, ...betAmountIconStyle}} />
            Bet Amount
          </label>
          
          <div style={betInputContainerStyle}>
            {/* Input Field with Larger Size */}
            <div style={betInputWrapperStyle}>
              <input
                type="number"
                placeholder="Enter bet amount"
                value={betSize}
                onChange={(e) => setBetSize(Number(e.target.value))}
                style={{
                  ...modernInputStyle,
                  ...betInputStyle
                }}
                required
              />
              
              {/* Currency Dropdown - Positioned Within Input */}
              <div style={currencyDropdownContainerStyle}>
                <select
                  value={betType}
                  onChange={(e) => setBetType(e.target.value)}
                  style={currencyDropdownStyle}
                >
                  <option value="common">Credits</option>
                  <option value="premium">Imperium</option>
                </select>
                <div style={dropdownArrowStyle}>▸</div>
              </div>
            </div>
            
            {/* Available Balance with Better Styling */}
            <div style={balanceContainerStyle}>
              <span style={balanceLabelStyle}>Available:</span> 
              <div style={balanceAmountContainerStyle}>
                <img 
                  src={betType === 'premium' ? premiumIcon : commonIcon}
                  alt={betType === 'premium' ? 'Imperium' : 'Credits'}
                  style={currencyIconStyle}
                />
                <span>
                  {userData && userData[betType === 'premium' ? 'gold' : 'silver'] !== undefined ? 
                    userData[betType === 'premium' ? 'gold' : 'silver']?.toLocaleString() : 
                    'Loading...'} {CURRENCY_NAMES[betType]}
                </span>
              </div>
            </div>
          </div>
          
          {/* Quick Amount Buttons */}
          <div style={quickAmountButtonsContainerStyle}>
            {[10, 25, 50, 100].map(amount => (
              <button 
                key={amount}
                type="button"
                onClick={() => setBetSize(amount)}
                style={quickAmountButtonStyle}
              >
                {amount}
              </button>
            ))}
          </div>
        </div>

        {/* Multiplier Section with American Odds - ENHANCED */}
        <div style={formGroupStyle}>
          <label htmlFor="multiplier" style={labelStyle}>
            <FaPercent style={iconStyle} />
            Multiplier
          </label>
          <div style={{position: 'relative'}}>
            <input
              type="number"
              id="multiplier"
              placeholder="Multiplier (1.01x-100x)"
              value={multiplier}
              onChange={(e) => setMultiplier(e.target.value)}
              onFocus={() => setMultiplierInputFocused(true)}
              onBlur={() => setMultiplierInputFocused(false)}
              style={{
                ...modernInputStyle,
                height: '46px',
                fontSize: '1rem',
                borderColor: multiplierInputFocused ? colors.primary : 'rgba(255, 255, 255, 0.1)',
                boxShadow: multiplierInputFocused ? `0 0 0 2px ${colors.primary}30` : 'none',
                transition: 'all 0.2s ease',
              }}
              min="1.01"
              max="100"
              step="0.01"
              required
            />
            
            {/* Multiplier slider for visual control */}
            <div style={{
              marginTop: '10px',
              padding: '0 2px',
              position: 'relative'
            }}>
              <input
                type="range"
                min="1.01"
                max="10"  // Changed from 5 to 10 for a better slider range
                step="0.01"
                value={multiplier > 10 ? 10 : multiplier < 1.01 ? 1.01 : multiplier}
                onChange={(e) => setMultiplier(parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  height: '5px',
                  WebkitAppearance: 'none',
                  appearance: 'none',
                  background: `linear-gradient(90deg, 
                    ${colors.primary} 0%, 
                    ${colors.primary} ${(multiplier - 1.01) / (10 - 1.01) * 100}%, 
                    rgba(255,255,255,0.1) ${(multiplier - 1.01) / (10 - 1.01) * 100}%, 
                    rgba(255,255,255,0.1) 100%)`,
                  borderRadius: '10px',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '4px',
                fontSize: '0.75rem',
                color: colors.text.secondary,
              }}>
                <span>1x</span>
                <span>3x</span>
                <span>5x</span>
                <span>7x</span>
                <span>10x+</span>
              </div>
            </div>
            
            {/* American Odds Display */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '12px',
              padding: '8px 12px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.2s ease'
            }}>
              <div>
                <span style={{
                  fontSize: '0.8rem',
                  color: colors.text.secondary,
                  marginRight: '6px'
                }}>
                  American Odds:
                </span>
                <span style={{
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: getOddsColor(getAmericanOdds(multiplier))
                }}>
                  {getAmericanOdds(multiplier)}
                </span>
              </div>
              
              <div style={{
                fontSize: '0.75rem',
                color: colors.text.secondary,
                cursor: 'help',
                position: 'relative'
              }} 
              title="American odds show your potential profit. +200 means bet 100 to win 200; -200 means bet 200 to win 100.">
                <FaInfoCircle />
              </div>
            </div>

            {parseFloat(multiplier) > 10 && (
              <div style={{
                marginTop: '8px',
                padding: '6px 10px',
                backgroundColor: 'rgba(255, 99, 71, 0.1)',
                borderRadius: '4px',
                border: '1px solid rgba(255, 99, 71, 0.2)',
                fontSize: '0.85rem',
                color: '#ff6347',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FaInfoCircle size={12} />
                <span>High multipliers represent very unlikely outcomes</span>
              </div>
            )}
          </div>
          
          <div style={{
            ...potentialWinningsContainerStyle,
            opacity: betSize ? '1' : '0.5',
            transform: betSize ? 'translateY(0)' : 'translateY(5px)',
            transition: 'all 0.3s ease'
          }}>
            <span>Potential Winnings:</span>
            <span style={{
              ...potentialWinningsAmountStyle,
              fontSize: betSize > 100 ? '1.2rem' : '1.1rem',
              transition: 'font-size 0.3s ease'
            }}>
              {formatCurrency(potentialWinnings)} {CURRENCY_NAMES[betType]}
            </span>
          </div>
        </div>

        {/* Duration section remains the same */}
        <div style={formGroupStyle}>
          <label htmlFor="duration" style={labelStyle}>
            <FaClock style={iconStyle} />
            Auction Duration
          </label>
          <select
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            style={{
              ...modernSelectStyle,
              height: '46px',
              fontSize: '1rem',
            }}
            required
          >
            <option value="">Select Duration</option>
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
            <option value="60">1 hour</option>
            <option value="120">2 hours</option>
            <option value="180">3 hours</option>
            <option value="240">4 hours</option>
            <option value="300">5 hours</option>
            <option value="360">6 hours</option>
            <option value="420">7 hours</option>
            <option value="480">8 hours</option>
            <option value="540">9 hours</option>
            <option value="600">10 hours</option>
            <option value="660">11 hours</option>
            <option value="720">12 hours</option>
          </select>
        </div>
      </div>

      {/* Bet Summary - with fade in animation */}
      <AnimatePresence>
        {selectedPlayer && selectedMetric && metricValue && selectedCondition && betSize && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            style={betSummaryContainerStyle}
          >
            <h4 style={betSummaryTitleStyle}>Bet Summary</h4>
            <p style={betSummaryTextStyle}>
              You're betting <strong>{formatCurrency(betSize)} {CURRENCY_NAMES[betType]}</strong> that{' '}
              <strong>{selectedPlayer}</strong> will score{' '}
              <strong>{selectedCondition.toLowerCase()} {metricValue} {selectedMetric}</strong>.
            </p>
            <p style={betSummaryTextStyle}>
              If you win, you'll receive <strong>{formatCurrency(potentialWinnings)} {CURRENCY_NAMES[betType]}</strong> (a profit of {formatCurrency(potentialWinnings - betSize)} {CURRENCY_NAMES[betType]}).
            </p>
            <div style={{
              marginTop: '15px',
              padding: '10px',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              fontSize: '0.9rem',
              color: colors.text.secondary,
              display: 'flex',
              alignItems: 'center'
            }}>
              <div style={{
                marginRight: '10px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.primary
              }}>
                <FaInfoCircle size={12} />
              </div>
              <div>
                <strong>Odds Conversion:</strong> {multiplier}x multiplier = <span style={{
                  color: getOddsColor(getAmericanOdds(multiplier)),
                  fontWeight: 'bold'
                }}>{getAmericanOdds(multiplier)}</span> in American odds
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {formError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={errorContainerStyle}
          >
            <strong>Error:</strong> {formError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Button with hover effect */}
      <button 
        type="submit" 
        style={{
          ...(!loading ? submitButtonStyle : submitButtonDisabledStyle),
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(99, 102, 241, 0.3)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.2)';
        }}
        disabled={loading}
      >
        {loading ? 'Creating Auction...' : 'Post Auction'}
      </button>
      
      {/* Odds conversion guide */}
      <div style={{
        marginTop: '20px',
        padding: '15px',
        borderRadius: '8px',
        backgroundColor: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.05)',
        fontSize: '0.9rem'
      }}>
        <h4 style={{
          margin: '0 0 10px 0',
          fontSize: '1rem',
          color: colors.text.primary,
          display: 'flex',
          alignItems: 'center'
        }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: colors.primary,
            marginRight: '8px',
            fontSize: '0.7rem'
          }}>i</span>
          Multiplier to American Odds Conversion
        </h4>
        <p style={{
          margin: '0 0 10px 0',
          color: colors.text.secondary
        }}>
          American odds show how much you win relative to a $100 bet. Positive odds (+) show profit on a $100 bet, while negative odds (-) show how much you need to bet to win $100.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: '10px',
          marginTop: '10px'
        }}>
          <div style={{
            padding: '8px',
            borderRadius: '6px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            textAlign: 'center'
          }}>
            <div style={{fontSize: '0.8rem', color: colors.text.secondary}}>2.0x Multiplier</div>
            <div style={{color: colors.success, fontWeight: 'bold'}}>+100</div>
          </div>
          <div style={{
            padding: '8px',
            borderRadius: '6px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            textAlign: 'center'
          }}>
            <div style={{fontSize: '0.8rem', color: colors.text.secondary}}>3.0x Multiplier</div>
            <div style={{color: colors.success, fontWeight: 'bold'}}>+200</div>
          </div>
          <div style={{
            padding: '8px',
            borderRadius: '6px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            textAlign: 'center'
          }}>
            <div style={{fontSize: '0.8rem', color: colors.text.secondary}}>1.5x Multiplier</div>
            <div style={{color: colors.danger, fontWeight: 'bold'}}>-200</div>
          </div>
          <div style={{
            padding: '8px',
            borderRadius: '6px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            textAlign: 'center'
          }}>
            <div style={{fontSize: '0.8rem', color: colors.text.secondary}}>10x Multiplier</div>
            <div style={{color: colors.success, fontWeight: 'bold'}}>+900</div>
          </div>
          <div style={{
            padding: '8px',
            borderRadius: '6px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            textAlign: 'center'
          }}>
            <div style={{fontSize: '0.8rem', color: colors.text.secondary}}>50x Multiplier</div>
            <div style={{color: colors.success, fontWeight: 'bold'}}>+4900</div>
          </div>
          <div style={{
            padding: '8px',
            borderRadius: '6px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            textAlign: 'center'
          }}>
            <div style={{fontSize: '0.8rem', color: colors.text.secondary}}>100x Multiplier</div>
            <div style={{color: colors.success, fontWeight: 'bold'}}>+9900</div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default AuctionForm;