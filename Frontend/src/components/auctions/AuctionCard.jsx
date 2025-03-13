import React, { useState, useMemo, useEffect } from 'react';
import { formatCurrency } from '../../utils/currency';
import { FaClock, FaCheckCircle, FaRegUser, FaRegCheckCircle } from 'react-icons/fa';
import CurrencyDisplay from '../common/CurrencyDisplay';
import { convertCurrencyType } from '../../utils/currency';
import { getCardStyles } from '../../styles/components/auctionCard.styles';
import {
  extractTeams, 
  getTimeRemaining, 
  getTimeColor, 
  getOppositeCondition 
} from '../../utils/teamColors';

const AuctionCard = ({ 
  auction, 
  currentUserId, 
  onBuy, 
  showBuyButton = true,
  userData,
  isPersonal = false 
}) => {
  // State management
  const [isHovered, setIsHovered] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [buyLoading, setBuyLoading] = useState(false);
  
  // Set entrance animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateIn(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  
  // Handle null auction
  if (!auction) {
    return null;
  }
  
  // Extract auction data
  const {
    _id,
    game = "Team A vs Team B",
    player = "Unknown Player",
    condition = "over",
    value = 0,
    metric = "points",
    betSize = 0,
    betType = "CASH",
    multiplier = 1,
    user = null,
    soldTo = null,
    expirationTime = new Date()
  } = auction;
  
  // User ID comparison for determining ownership
  const userIdStr = user ? (typeof user === 'object' ? user._id?.toString() : user.toString()) : 'unknown';
  const currentUserIdStr = currentUserId ? currentUserId.toString() : 'none';
  
  // Calculate values
  const teams = useMemo(() => extractTeams(game), [game]);
  const cost = betSize * (multiplier - 1);
  const total = Number(betSize) + cost;
  
  // Determine states
  const isUserAuction = userIdStr === currentUserIdStr;
  const isSold = soldTo !== null;
  const hasSufficientFunds = userData && (
    betType === 'common' ? userData.silver >= cost : 
    betType === 'premium' ? userData.gold >= cost : 
    false
  );
  
  // Determine the condition to display based on viewer's relationship to the auction
  const displayCondition = isUserAuction ? condition : getOppositeCondition(condition);
  
  // Time info
  const { timeString, percentRemaining } = getTimeRemaining(expirationTime);
  const timeColor = getTimeColor(percentRemaining);
  
  // Get styles based on current state
  const styles = getCardStyles(teams, isUserAuction, isSold, isHovered);
  
  // Button handlers
  const handleBuy = async () => {
    if (isConfirming) {
      if (onBuy) {
        setBuyLoading(true);
        try {
          await onBuy(_id);
        } finally {
          setBuyLoading(false);
          setIsConfirming(false);
        }
      }
    } else {
      setIsConfirming(true);
    }
  };
  
  const cancelBuy = (e) => {
    if (e) e.preventDefault();
    setIsConfirming(false);
  };

  return (
    <div 
      style={{
        ...styles.cardContainer,
        opacity: animateIn ? 1 : 0,
        transform: animateIn 
          ? (isHovered 
              ? 'perspective(1200px) rotateX(3deg) translateY(-4px)' 
              : 'perspective(1200px) rotateX(1.5deg)')
          : 'perspective(1200px) rotateX(1.5deg) translateY(20px)',
        transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        if (!isConfirming) {
          setIsConfirming(false);
        }
      }}
    >
      {/* Color bar at the top of the card */}
      <div style={styles.colorBar} />

      {/* Subtle glow effect based on team colors */}
      <div style={styles.glowAccent} />

      {/* Team banner */}
      <div style={styles.teamBanner}>
        <span style={styles.teamNameLeft}>{teams[0]}</span>
        <span style={styles.vsText}>vs</span>
        <span style={styles.teamNameRight}>{teams[1]}</span>
      </div>
      
      {/* Player name */}
      <h3 style={styles.playerName}>{player}</h3>
      
      {/* Bet condition */}
      <div style={styles.betCondition}>
        <span style={styles.conditionText}>{displayCondition}</span> {value} {metric}
        
        {/* Add a hint if the condition was flipped for buyers */}
        {!isUserAuction && !isSold && (
          <span style={styles.yourPositionTag}>
            <strong>Your position</strong>
          </span>
        )}
      </div>
      
      {/* Stats grid */}
      <div style={styles.statsGrid}>
        <div style={styles.statsRow}>
          <div style={styles.statsLabel}>Bet Size</div>
          <div className="auction-bet-amount">
            <CurrencyDisplay 
              amount={auction.betSize} 
              type={convertCurrencyType(auction.betType)} 
              size="medium"
              showName={true}
            />
          </div>
        </div>
        
        <div style={styles.statsRow}>
          <div style={styles.statsLabel}>Multiplier</div>
          <div style={styles.statsValue}>{multiplier}x</div>
        </div>
        
        <div style={styles.totalPotRow}>
          <div style={styles.statsLabel}>Total Pot</div>
          <div style={styles.totalPotValue}>{formatCurrency(total)}</div>
        </div>
      </div>
      
      {/* Time and action footer */}
      <div style={styles.footerSection}>
        <div style={styles.timeSection}>
          <FaClock style={{ marginRight: '6px', color: timeColor }} />
          <span style={styles.timeLabel}>Time left:</span>
          <span style={styles.getTimeTextStyle(timeColor)}>{timeString}</span>
        </div>
        
        {/* Buy/Sold/Your Auction status */}
        <div>
          {buyLoading ? (
            <div style={{
              display: 'inline-block',
              padding: '6px 12px',
              background: 'rgba(33, 150, 243, 0.2)',
              borderRadius: '6px',
              color: '#2196F3',
            }}>
              Processing...
            </div>
          ) : isSold ? (
            <div style={styles.soldTag}>
              <FaCheckCircle style={{ marginRight: '5px' }} /> SOLD
            </div>
          ) : isUserAuction ? (
            <div style={styles.yourAuctionTag}>
              <FaRegUser style={{ marginRight: '5px' }} /> YOUR AUCTION
            </div>
          ) : showBuyButton ? (
            isConfirming ? (
              <div style={styles.buyButtonContainer}>
                <button 
                  onClick={handleBuy} 
                  style={styles.confirmButton}
                >
                  <FaRegCheckCircle style={{ marginRight: '5px' }} />
                  Confirm
                </button>
                <button 
                  onClick={cancelBuy} 
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button 
                onClick={handleBuy}
                disabled={!hasSufficientFunds} 
                style={styles.buyButton(hasSufficientFunds)}
              >
                Buy Now ({formatCurrency(cost)})
              </button>
            )
          ) : null}
        </div>
      </div>
      
      {/* Loading animation overlay for bought items */}
      {buyLoading && (
        <div style={styles.loadingEffect}></div>
      )}

      {/* Add animations keyframes */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AuctionCard;