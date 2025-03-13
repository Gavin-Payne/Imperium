import React from 'react';
import { formatWithSymbol, formatCurrency } from '../../utils/currency';
import commonIcon from '../../assets/common.png';
import premiumIcon from '../../assets/premium.png';

const SuccessfulAuctions = ({ successfulAuctions, userId }) => {
  // Add detailed logging for debugging
  console.log('SuccessfulAuctions component rendered with:', {
    auctionsCount: successfulAuctions?.length || 0,
    userId: userId,
    firstAuction: successfulAuctions?.[0] || 'None'
  });

  // Safety check to prevent errors with missing data
  if (!successfulAuctions || !Array.isArray(successfulAuctions) || !userId) {
    console.warn('Missing required props:', {
      hasAuctions: !!successfulAuctions,
      isArray: Array.isArray(successfulAuctions),
      hasUserId: !!userId
    });
    return (
      <div style={{
        backgroundColor: '#2c2c2c',
        padding: '20px',
        borderRadius: '8px'
      }}>
        <h3>Successful Auctions</h3>
        <p>No successful auctions available.</p>
      </div>
    );
  }
  
  // Helper function to safely compare MongoDB IDs
  const isSameId = (id1, id2) => {
    if (!id1 || !id2) return false;
    
    // Convert to string if they're objects
    const str1 = typeof id1 === 'object' ? id1._id?.toString() || id1.toString() : id1.toString();
    const str2 = typeof id2 === 'object' ? id2._id?.toString() || id2.toString() : id2.toString();
    
    return str1 === str2;
  };
  
  // Get today's date at start of day in local timezone
  const today = new Date();
  today.setHours(0, 0, 0, 0); 
  
  // Modified filter function to handle date comparison correctly and exclude auctions without game dates
  const filteredAuctions = successfulAuctions.filter(auction => {
    // First check gameDate field
    if (auction.gameDate) {
      const gameDate = new Date(auction.gameDate);
      gameDate.setHours(0, 0, 0, 0); // Reset hours to compare just the dates
      
      const isAfterOrToday = gameDate >= today;
      return isAfterOrToday;
    }
    
    // No gameDate field - don't include these auctions
    return false;
  });
  
  console.log(`Filtered ${successfulAuctions.length} auctions down to ${filteredAuctions.length} with game dates today or later`);
  
  // Process auctions to determine user's role and financial stakes
  const processedAuctions = filteredAuctions.map(auction => {
    // Determine if the user is seller or buyer
    const isSeller = isSameId(auction.user, userId);
    const isBuyer = isSameId(auction.soldTo, userId);
    
    // Calculate the total pot
    const totalPot = auction.betSize * auction.multiplier;
    
    // Calculate the user's stake (what they could lose)
    const userStake = isSeller 
      ? auction.betSize 
      : auction.betSize * (auction.multiplier - 1);
    
    // Process the condition to show opposite if user is buyer
    const displayCondition = isBuyer ? getOppositeCondition(auction.condition) : auction.condition;
    
    // Get formatted game date
    const gameDateObj = auction.gameDate ? new Date(auction.gameDate) : new Date(auction.date);
    const formattedGameDate = gameDateObj.toLocaleDateString(undefined, { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
    
    return {
      ...auction,
      totalPot,
      userStake,
      currency: auction.betType,
      role: isSeller ? 'seller' : 'buyer',
      displayCondition,
      formattedGameDate
    };
  });

  // Function to get opposite condition for buyers
  function getOppositeCondition(condition) {
    if (!condition) return '';
    
    const lowerCondition = condition.toLowerCase();
    
    if (lowerCondition === 'over') return 'under';
    if (lowerCondition === 'under') return 'over';
    if (lowerCondition === 'exactly') return 'not exactly';
    if (lowerCondition === 'not exactly') return 'exactly';
    
    return condition; // Return original if no match
  }

  return (
    <div style={{
      backgroundColor: '#2c2c2c',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
    }}>
      <h3 style={{
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        paddingBottom: '10px',
        marginTop: '0'
      }}>Successful Auctions</h3>
      
      {processedAuctions.length === 0 ? (
        <p>No successful auctions yet.</p>
      ) : (
        <div style={{
          display: 'grid',
          gap: '15px',
          marginTop: '15px'
        }}>
          {processedAuctions.map((auction, index) => (
            <div 
              key={auction._id || index}
              style={{
                backgroundColor: '#1a1a1a',
                padding: '15px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              {/* Game header with date */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                paddingBottom: '8px'
              }}>
                <p style={{
                  fontWeight: 'bold', 
                  margin: '0',
                  fontSize: '1.05rem',
                  color: '#ffffff'
                }}>
                  {auction.game}
                </p>
                <span style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  color: '#bbb'
                }}>
                  {auction.formattedGameDate}
                </span>
              </div>
              
              {/* Bet details */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <div>
                  <p style={{margin: '0 0 6px 0', fontSize: '0.95rem'}}>
                    <span style={{opacity: '0.7'}}>Player:</span> {auction.player}
                  </p>
                  <p style={{
                    margin: '0', 
                    padding: '5px 10px', 
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '4px',
                    display: 'inline-block',
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>
                    <span style={{textTransform: 'capitalize'}}>{auction.displayCondition}</span> {auction.value} {auction.metric}
                  </p>
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  opacity: '0.7',
                  textAlign: 'right',
                  alignSelf: 'flex-start'
                }}>
                  {auction.role === 'seller' ? 'You created this auction' : 'You bought this auction'}
                </div>
              </div>
              
              {/* Financial stakes */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                padding: '12px',
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: '8px',
                marginTop: '12px'
              }}>
                {/* Potential Winnings */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px',
                  backgroundColor: 'rgba(76,175,80,0.1)',
                  borderRadius: '6px',
                  border: '1px solid rgba(76,175,80,0.2)',
                }}>
                  <span style={{fontSize: '0.8rem', marginBottom: '4px', color: '#7cb342'}}>
                    Potential Winnings
                  </span>
                  <span style={{
                    fontSize: '1.2rem', 
                    fontWeight: 'bold',
                    color: '#4caf50',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <img 
                      src={auction.currency === 'premium' || auction.currency === 'gold' ? premiumIcon : commonIcon}
                      alt={auction.currency === 'premium' || auction.currency === 'gold' ? 'Imperium' : 'Credits'}
                      style={{ width: '18px', height: '18px', marginRight: '6px' }}
                    />
                    {formatCurrency(auction.totalPot)}
                  </span>
                </div>
                
                {/* Your Stake */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px',
                  backgroundColor: 'rgba(244,67,54,0.1)',
                  borderRadius: '6px',
                  border: '1px solid rgba(244,67,54,0.2)',
                }}>
                  <span style={{fontSize: '0.8rem', marginBottom: '4px', color: '#e57373'}}>
                    Your Stake
                  </span>
                  <span style={{
                    fontSize: '1.2rem', 
                    fontWeight: 'bold',
                    color: '#f44336',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <img 
                      src={auction.currency === 'premium' || auction.currency === 'gold' ? premiumIcon : commonIcon}
                      alt={auction.currency === 'premium' || auction.currency === 'gold' ? 'Imperium' : 'Credits'}
                      style={{ width: '18px', height: '18px', marginRight: '6px' }}
                    />
                    {formatCurrency(auction.userStake)}
                  </span>
                </div>
              </div>
              
              {/* Odds */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '10px',
                padding: '5px',
                fontSize: '0.8rem',
                color: '#bbb'
              }}>
                <span>Multiplier: <strong>{auction.multiplier}x</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SuccessfulAuctions;