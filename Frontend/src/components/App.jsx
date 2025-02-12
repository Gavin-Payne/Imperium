import React, { useState, useEffect } from 'react';
import moment from 'moment-timezone';
import SignUp from './SignUp';
import SignIn from './SignIn';
import { jwtDecode } from 'jwt-decode';
import CurrencyDisplay from './Currency';
import SilverIcon from '../assets/Silver.png';
import GoldIcon from '../assets/Gold.png';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isSignUp, setIsSignUp] = useState(false);
  const handleTabClick = (index) => {
    console.log('Changing to tab:', index);
    setCurrentTab(index);
  };
  const [currentTab, setCurrentTab] = useState(0);
  const [userData, setUserData] = useState(null);
  const [auction, setAuction] = useState({
    date: '',
    game: '',
    player: '',
    condition: '',
    value: '',
    metric: '',
    betSize: '',
    betType: '',
    multiplier: '',
    duration: ''
  });
  const [activeAuctions, setActiveAuctions] = useState([]);
  const [allAuctions, setAllAuctions] = useState([]);
  const [dailyCollected, setDailyCollected] = useState(false);
  const [games, setGames] = useState([]);
  const [players, setPlayers] = useState([]);
  const [successfulAuctions, setSuccessfulAuctions] = useState([]);

  const handleAuctionSubmit = async (e) => {
    e.preventDefault();
    
    // Parse betSize as a number and extract the currency type from auction.betType
    const betSize = Number(auction.betSize);
    const currencyType = auction.betType;

    // Check if the user's balance for that currency is sufficient before submitting
    if (betSize > userData[currencyType]) {
      alert("You don't have enough currency to post this auction.");
      return;
    }
    
    try {
      const response = await fetch('http://localhost:5000/api/auctions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(auction)
      });
      if (!response.ok) {
        throw new Error('Failed to post auction');
      }
      const newAuction = await response.json();
      // Update active auctions state and refresh Auction House
      setActiveAuctions([...activeAuctions, newAuction]);
      fetchAllAuctions();
      alert('Auction posted successfully');
    } catch (error) {
      console.error('Error posting auction:', error);
      alert('Error posting auction');
    }
  };

  const fetchActiveAuctions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auctions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch auctions');
      }
      
      const auctions = await response.json();
      setActiveAuctions(auctions);
    } catch (error) {
      console.error('Error fetching auctions:', error);
    }
  };

  const fetchAllAuctions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auctions/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch all auctions');
      }
      
      const auctions = await response.json();
      setAllAuctions(auctions);
    } catch (error) {
      console.error('Error fetching all auctions:', error);
    }
  };

  const fetchSuccessfulAuctions = async () => {
    try {
      if (!userData || (!userData._id && !userData.id)) {
        console.log("User data missing, skipping fetchSuccessfulAuctions", userData);
        return;
      }
      const response = await fetch('http://localhost:5000/api/auctions/successful', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch successful auctions');
      }
      
      const auctions = await response.json();
  
      const currentUserId = (userData._id || userData.id)?.toString() || "";
  
      const filtered = auctions.filter(a => {
        if (!a) {
          console.log("Skipping auction, auction is null");
          return false;
        }
        if (!a.soldTo) {
          console.log(`Auction ${a._id} does not have soldTo, skipping.`);
          return false;
        }
        
        const sellerId = a.user ? a.user.toString() : "";
        const buyerId = a.soldTo ? a.soldTo.toString() : "";
        
        return sellerId === currentUserId || buyerId === currentUserId;
      });
      
      setSuccessfulAuctions(filtered);
    } catch (error) {
      console.error('Error fetching successful auctions:', error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchActiveAuctions();
      const interval = setInterval(fetchActiveAuctions, 60000);
      return () => clearInterval(interval);
    }
  }, [token]);

  useEffect(() => {
    const processExpiredAuctions = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auctions/processExpired', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        console.log(data.message);
        // Optionally, refresh the user profile to update currency amounts
        fetchUserData();
      } catch (error) {
        console.error('Error processing expired auctions:', error);
      }
    };
  
    if (token) {
      processExpiredAuctions();
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      const decodedToken = jwtDecode(token);
      const expirationTime = decodedToken.exp * 1000;
      
      if (Date.now() >= expirationTime) {
        handleLogout();
      } else {
        const timeoutId = setTimeout(handleLogout, expirationTime - Date.now());
        return () => clearTimeout(timeoutId);
      }
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      const fetchUserData = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/user/profile', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          });
          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }
          const data = await response.json();
          setUserData(data);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
      fetchUserData();
      const intervalId = setInterval(fetchUserData, 1000);
      return () => clearInterval(intervalId);
    }
  }, [token]);

  useEffect(() => {
    if (token && userData) {
      fetchSuccessfulAuctions();
    }
  }, [token, userData]);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      localStorage.removeItem('token');
      setToken(null);
      // Redirect to login
      setCurrentTab(0);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    if (currentTab === 4) {
      const fetchUserData = async (token) => {
        try {
          console.log("Starting fetchUserData...");
          console.log("Authorization Token:", token);
      
          const response = await fetch('http://localhost:5000/api/user/profile', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
      
          console.log("Response Status:", response.status, response.statusText);
      
          if (!response.ok) {
            const errorText = await response.text();
            console.error("Response Error:", errorText);
            throw new Error(`Error fetching data: ${response.statusText}`);
          }
      
          const textData = await response.text();
          console.log("Raw Response Text:", textData);
      
          const data = JSON.parse(textData);
          console.log("Parsed Data:", data);
          setUserData(data);
      
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      
      const token = localStorage.getItem('token');
      fetchUserData(token);

    }
  }, [currentTab]);

  useEffect(() => {
    if (token && currentTab === 3) {
      fetchAllAuctions();
    }
  }, [token, currentTab]);
  
  const handleDailyAllowance = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/user/dailyAllowance', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.message);
      } else {
        alert(data.message);
        // Update currency values in userData
        setUserData(prev => ({ ...prev, silver: data.silver, gold: data.gold }));
        setDailyCollected(true);

        const decoded = jwtDecode(token);
        const userId = decoded.id;
        const storageKey = `dailyCollectedTimestamp_${userId}`;
        localStorage.setItem(storageKey, new Date().toISOString());
      }
    } catch (error) {
      console.error('Daily allowance error:', error);
    }
  };

  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      const userId = decoded.id;
      const storageKey = `dailyCollectedTimestamp_${userId}`;

      const storedTimestamp = localStorage.getItem(storageKey);
      if (storedTimestamp) {
        const lastCollection = moment.tz(storedTimestamp, "America/New_York");
        const currentEastern = moment().tz("America/New_York");
        let threshold;
        if (currentEastern.hour() < 4) {
          // Before 4 AM, the cycle started yesterday at 4 AM
          threshold = moment(currentEastern)
            .subtract(1, 'day')
            .set({ hour: 4, minute: 0, second: 0, millisecond: 0 });
        } else {
          // 4 AM or later means the cycle started today at 4 AM
          threshold = moment(currentEastern).set({ hour: 4, minute: 0, second: 0, millisecond: 0 });
        }
        if (lastCollection.isAfter(threshold)) {
          setDailyCollected(true);
        } else {
          setDailyCollected(false);
          localStorage.removeItem(storageKey);
        }
      } else {
        setDailyCollected(false);
      }
    }
  }, [token]);

  useEffect(() => {
    if (auction.date) {
      // Calling a backend endpoint that returns a JSON array of games for the given date.
      // The backend should run retrieve.py's get_games_on_date and return games in a structured format.
      fetch(`http://localhost:5000/api/auctions/games?date=${auction.date}`)
        .then(res => res.json())
        .then(data => {
          // Assuming each game has home_team and away_team properties.
          setGames(data);
        })
        .catch(err => console.error(err));
    }
  }, [auction.date]);

  const handleGameChange = (e) => {
    const selectedGame = e.target.value;
    setAuction({ ...auction, game: selectedGame });
    
    // Expecting format: "TeamA vs TeamB"
    const teams = selectedGame.split(' vs ');
    if (teams.length === 2) {
      const [teamA, teamB] = teams;
      // Fetch players from both teams in parallel.
      Promise.all([
        fetch(`http://localhost:5000/api/players?team=${encodeURIComponent(teamA)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json()),
        fetch(`http://localhost:5000/api/players?team=${encodeURIComponent(teamB)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json())
      ]).then(([playersA, playersB]) => {
        setPlayers([...playersA, ...playersB]);
      }).catch(error => {
        console.error('Error fetching players:', error);
      });
    }
  };

  const renderInterface = () => {
    switch (currentTab) {
      case 0: // Dashboard
        return (
          <div style={{ ...tabContentStyle, position: 'relative' }}>
            {/* Place the Dashboard title at the top center */}
            <h2 style={{ textAlign: 'center', marginTop: '100px' }}>Dashboard</h2>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginTop: '20px',
              }}
            >
              <div style={{ width: '45%' }}>
                {/* Daily allowance popup moved into left column */}
                <div style={dailyAllowanceBoxStyle}>
                  <p style={{ color: '#fff', fontSize: '0.9em', textAlign: 'center', marginBottom: '10px' }}>
                    Collect your daily allowance:<br />
                    <img src={SilverIcon} alt="Silver" style={smallIconStyle} /> 100 Silver and{' '}
                    <img src={GoldIcon} alt="Gold" style={smallIconStyle} /> 100 Gold<br />
                    <span style={{ fontSize: '.8em', color: '#ccc' }}>
                      (Resets at 4 AM Eastern)
                    </span>
                  </p>
                  <button onClick={handleDailyAllowance} disabled={dailyCollected} style={popupButtonStyle}>
                    {dailyCollected ? "Already Collected" : "Collect Daily Allowance"}
                  </button>
                </div>
                {/* Add any additional account overview components here */}
              </div>
              <div style={{ width: '50%' }}>
                <div style={auctionsBoxStyle}>
                  <h3 style={{ textAlign: 'center' }}>Successful Auctions</h3>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '10px',
                      justifyContent: 'center'
                    }}
                  >
                    {successfulAuctions.length === 0 ? (
                      <p>No successful auctions.</p>
                    ) : (
                      successfulAuctions.map((auction, index) => {
                        const rawDate = auction.date;
                        const mLocal = moment(auction.date);
                        const mEastern = moment.tz(auction.date, "America/New_York");
                        return (
                          <div key={index} style={stickyNoteStyle}>
                            <h4>{auction.game}</h4>
                            <p>
                              <strong>Player:</strong> {auction.player}
                            </p>
                            <p>
                              <strong>Date:</strong>{" "}
                              {mEastern.format("MM/DD/YYYY")}
                            </p>
                            <p>
                              <strong>Condition:</strong> {auction.condition}
                            </p>
                            <p>
                              <strong>Value:</strong> {auction.value}
                            </p>
                            <p>
                              <strong>Metric:</strong> {auction.metric}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 1: // Trading Interface
        return (
          <div style={{ ...tradingContainerStyle, textAlign: 'center' }}>
            <h2 style={modernHeadingStyle}>Trading Interface</h2>
            <p style={modernSubtextStyle}>
              Access live market data, execute trades, and monitor your portfolio in real-time.
            </p>
            <button style={modernButtonStyle}>Start Trading</button>
            <form onSubmit={handleAuctionSubmit} style={modernFormStyle}>
              <input
                type="date"
                placeholder="Date"
                value={auction.date}
                onChange={(e) => setAuction({ ...auction, date: e.target.value })}
                style={{ ...modernInputStyle, width: '60%' }}
                required
              />
              <select
                onChange={handleGameChange}
                style={{ ...modernSelectStyle, maxHeight: '70px', overflowY: 'auto', width: '60%' }}
                required
                size="5"
                value={auction.game}
              >
                {games.map((game, index) => (
                  <option key={index} value={`${game.home_team} vs ${game.away_team}`}>
                    {`${game.home_team} vs ${game.away_team}`}
                  </option>
                ))}
              </select>
              <select
                value={auction.player}
                onChange={(e) => setAuction({ ...auction, player: e.target.value })}
                style={{ ...modernSelectStyle, width: '60%' }}
                required
              >
                <option value="" disabled>Select a player</option>
                {players.map((player, index) => (
                  <option key={index} value={player}>{player}</option>
                ))}
              </select>
              <div style={{ display: 'flex', gap: '10px', width: '60%' }}>
                <select
                  value={auction.condition}
                  onChange={(e) => setAuction({ ...auction, condition: e.target.value })}
                  style={{ ...modernSelectStyle, flex: '1' }}
                  required
                >
                  <option value="">Condition</option>
                  <option value="Over">Over</option>
                  <option value="Under">Under</option>
                  <option value="Exactly">Exactly</option>
                </select>
                <input
                  type="number"
                  placeholder="Value"
                  value={auction.value}
                  onChange={(e) => setAuction({ ...auction, value: e.target.value })}
                  style={{ ...modernInputStyle, flex: '1' }}
                  required
                />
                <select
                  value={auction.metric}
                  onChange={(e) => setAuction({ ...auction, metric: e.target.value })}
                  style={{ ...modernSelectStyle, flex: '1' }}
                  required
                >
                  <option value="">Metric</option>
                  <option value="points">Points</option>
                  <option value="rebounds">Rebounds</option>
                  <option value="assists">Assists</option>
                  <option value="steals">Steals</option>
                  <option value="blocks">Blocks</option>
                  <option value="points + rebounds">Points + Rebounds</option>
                  <option value="points + assists">Points + Assists</option>
                  <option value="points + assists + rebounds">Points + Assists + Rebounds</option>
                  <option value="assists + rebounds">Assists + Rebounds</option>
                  <option value="blocks + steals">Blocks + Steals</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', width: '60%' }}>
                <div style={{ display: 'flex', flex: '1', gap: '10px' }}>
                  <input
                    type="number"
                    placeholder="Bet Size"
                    value={auction.betSize || ''}
                    onChange={(e) => setAuction({ ...auction, betSize: Number(e.target.value) })}
                    style={{ ...modernInputStyle, flex: '2' }}
                    required
                  />
                  <select
                    value={auction.betType || ''}
                    onChange={(e) => setAuction({ ...auction, betType: e.target.value })}
                    style={{ ...modernSelectStyle, flex: '1' }}
                    required
                  >
                    <option value="">Select Currency</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                  </select>
                </div>
                <input
                  type="number"
                  placeholder="Multiplier (1.01x-5x)"
                  value={auction.multiplier || ''}
                  onChange={(e) => setAuction({ ...auction, multiplier: e.target.value })}
                  style={{ ...modernInputStyle, flex: '1' }}
                  min="1.01"
                  max="5"
                  step="0.01"
                  required
                />
              </div>
              <select
                value={auction.duration}
                onChange={(e) => setAuction({ ...auction, duration: e.target.value })}
                style={{ ...modernSelectStyle, width: '60%' }}
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
              <button type="submit" style={modernSubmitButtonStyle}>Post Auction</button>
            </form>
          </div>
        );
      case 2: // Active Auctions (Personal)
        return (
          <div style={tabContentStyle}>
            <h2>Active Auctions</h2>
            <div style={{ ...gridContainerStyle, justifyContent: 'center' }}>
              {activeAuctions.map((auction, index) => (
                <div key={index} style={stickyNoteStyle}>
                  <h3>{auction.game}</h3>
                  <p><strong>Player:</strong> {auction.player}</p>
                  <p><strong>Date:</strong> {new Date(auction.date).toLocaleDateString()}</p>
                  <p><strong>Condition:</strong> {auction.condition}</p>
                  <p><strong>Value:</strong> {auction.value}</p>
                  <p><strong>Metric:</strong> {auction.metric}</p>
                  <p><strong>Expires:</strong> {new Date(auction.expirationTime).toLocaleTimeString()}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 3: // Auction House
        const currentUserId = userData && userData._id ? userData._id : null;
        return (
          <div style={tabContentStyle}>
            <h2>Auction House</h2>
            <div style={{ ...gridContainerStyle, justifyContent: 'center' }}>
              {allAuctions.map((auction, index) => {
                const valueNum = Number(auction.betSize);
                const multiplierNum = Number(auction.multiplier);
                // Calculate cost using auction.value rather than betSize
                const cost = (!isNaN(valueNum) && !isNaN(multiplierNum))
                  ? valueNum * (multiplierNum - 1)
                  : 0;
                return (
                  <div key={index} style={stickyNoteStyle}>
                    <h3>{auction.game}</h3>
                    <p><strong>Player:</strong> {auction.player}</p>
                    <p><strong>Date:</strong> {new Date(auction.date).toLocaleDateString()}</p>
                    <p><strong>Condition:</strong> {auction.condition}</p>
                    <p><strong>Value:</strong> {auction.value}</p>
                    <p><strong>Metric:</strong> {auction.metric}</p>
                    {auction.user !== currentUserId && !auction.soldTo && (
                      <button
                        onClick={() => {
                          if (userData[auction.betType] < cost) {
                            alert("You don't have enough currency to buy this auction.");
                            return;
                          }
                          fetch('http://localhost:5000/api/auctions/buy', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ auctionId: auction._id })
                          })
                            .then(res => res.json())
                            .then(data => {
                              if (data.message === "Auction bought successfully") {
                                alert("Auction bought successfully");
                                fetchAllAuctions();
                                fetchSuccessfulAuctions();
                              } else {
                                alert(data.message);
                              }
                            })
                            .catch(error => {
                              console.error('Error buying auction:', error);
                              alert('Error buying auction');
                            });
                        }}
                      >
                        Buy Auction (Cost: {cost})
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      case 4: // Settings
        return (
          <div style={{ ...tabContentStyle, textAlign: 'center' }}>
            <h2>Settings</h2>
            <p>Find out if you're a fraud or not</p>
            {userData ? (
              <div style={{ display: 'inline-block', textAlign: 'left' }}>
                <h3>Stats</h3>
                <p><strong>Transactions:</strong> {userData.transactions}</p>
                <p><strong>Win Rate:</strong> {userData.winRate}%</p>
                <p><strong>Winnings:</strong> ${userData.winnings}</p>
              </div>
            ) : (
              <p>Loading your data...</p>
            )}
            <button style={actionButtonStyle}>Update Settings</button>
          </div>
        );
      default:
        return null;
    }
  };

  const handleLogin = async (credentials) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) {
        throw new Error('Login failed');
      }
      
      const data = await response.json();
      localStorage.setItem('token', data.token);
      setToken(data.token);
      fetchActiveAuctions();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div style={darkAppStyle}>
      <h1 style={darkHeaderStyle}>Imperium</h1>
      {token && userData && <CurrencyDisplay silver={userData.silver} gold={userData.gold} />}
      {!token ? (
        <div style={darkContainerStyle}>
          {isSignUp ? (
            <SignUp setToken={setToken} />
          ) : (
            <SignIn setToken={setToken} />
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
      ) : (
        <>
          <div style={headerStyle}>
            <button onClick={handleLogout} style={logoutButtonStyle}>
              <span style={logoutIconStyle}>⎋</span>
            </button>
          </div>
          <div style={interfaceContainerStyle}>{renderInterface()}</div>
          <nav style={navBarStyle}>
            {['Dashboard', 'Trading Interface', 'Active Auctions', 'Auction House', 'Settings'].map((tab, index) => (
              <button 
                key={index}
                onClick={() => setCurrentTab(index)}
                style={{
                  ...navButtonStyle,
                  backgroundColor: currentTab === index ? '#2c3e50' : '#4caf50'
                }}
              >
                {tab}
              </button>
            ))}
          </nav>
        </>
      )}
    </div>
  );
}

// Styles
const darkAppStyle = {
  backgroundColor: '#121212',
  color: '#ffffff',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  fontFamily: 'Arial, sans-serif',
};

const darkHeaderStyle = {
  textAlign: 'center',
  color: '#ffffff',
  margin: '20px 0',
};

const darkContainerStyle = {
  backgroundColor: '#1e1e1e',
  padding: '20px',
  borderRadius: '10px',
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
  maxWidth: '400px',
  margin: 'auto',
};

const darkSubscriptButtonStyle = {
  border: 'none',
  background: 'none',
  color: '#4caf50',
  cursor: 'pointer',
  textDecoration: 'underline',
  fontSize: '0.9em',
};

const interfaceContainerStyle = {
  padding: '20px',
  marginBottom: '80px',
  backgroundColor: '#1a1a1a',
  minHeight: '100vh',
  width: '100%',
  textAlign: 'center'
};

const actionButtonStyle = {
  padding: '10px',
  backgroundColor: '#4caf50',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  fontSize: '1em',
  cursor: 'pointer'
};

const navBarStyle = {
  display: 'flex',
  justifyContent: 'center',
  gap: '10px',
  padding: '10px',
  backgroundColor: '#1a1a1a',
  borderTop: '1px solid #444',
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0
};

const navButtonStyle = {
  padding: '10px',
  backgroundColor: '#4caf50',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  fontSize: '1em',
  cursor: 'pointer',
  transition: 'all 0.3s ease'
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginTop: '20px',
};

const modernInputStyle = {
  padding: '10px',
  border: '1px solid #444',
  borderRadius: '5px',
  fontSize: '1em',
  backgroundColor: '#1a1a1a',
  color: '#fff',
  marginBottom: '10px',
  width: '60%' // decreased width for input fields
};

const textareaStyle = {
  padding: '10px',
  margin: '10px 0',
  borderRadius: '5px',
  border: '1px solid #ccc',
  width: '80%',
  height: '100px',
};

const modernSelectStyle = {
  padding: '10px',
  border: '1px solid #444',
  borderRadius: '5px',
  fontSize: '1em',
  backgroundColor: '#1a1a1a',
  color: '#fff',
  marginBottom: '10px',
  width: '100%', // will be contained by parent width
};

const modernButtonStyle = {
  padding: '10px 20px',
  backgroundColor: '#4caf50',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  fontSize: '1em',
  cursor: 'pointer',
  marginBottom: '20px',
};

const modernFormStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const modernSubmitButtonStyle = {
  padding: '10px 20px',
  backgroundColor: '#4caf50',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  fontSize: '1em',
  cursor: 'pointer',
};

const modernHeadingStyle = {
  fontSize: '2em',
  color: '#4caf50',
  marginBottom: '10px',
};

const modernSubtextStyle = {
  fontSize: '1.2em',
  color: '#ccc',
  marginBottom: '20px',
};

const stickyNoteStyle = {
  backgroundColor: '#1a1a1a',
  color: '#fff',
  padding: '12px',
  borderRadius: '5px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  fontFamily: 'Arial, sans-serif',
  fontSize: '0.9em',
  lineHeight: '1.4',
  border: '1px solid #444',
  width: '200px',
  margin: '5px'
};

const gridContainerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '10px',
  padding: '10px',
  justifyContent: 'center'
};

const headerStyle = {
  position: 'absolute',
  top: '20px',
  right: '20px',
  zIndex: 1000
};

const logoutButtonStyle = {
  width: '45px',
  height: '45px',
  borderRadius: '50%',
  backgroundColor: '#1a1a1a',
  color: '#ffffff',
  border: '1px solid #444',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s ease',
  fontSize: '1em'
};

const logoutIconStyle = {
  fontSize: '22px',
  lineHeight: '1',
  color: '#ecf0f1'
};

const tradingContainerStyle = {
  padding: '20px',
  backgroundColor: '#1a1a1a',
  borderRadius: '10px',
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
  maxWidth: '600px',
  margin: 'auto',
  textAlign: 'center'
};

const popupButtonStyle = {
  padding: '10px',
  backgroundColor: '#4caf50',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  width: '100%'
};

const smallIconStyle = {
  width: '16px',
  height: '16px',
  verticalAlign: 'middle'
};

const dailyAllowanceBoxStyle = {
  backgroundColor: '#1a1a1a',
  border: '1px solid #4caf50',
  borderRadius: '10px',
  padding: '10px',
  width: '280px',
  boxShadow: '0px 0px 10px rgba(0,0,0,0.5)',
  margin: '20px auto' // centers horizontally within its container
};

const tabContentStyle = {
  padding: '20px',
  marginBottom: '80px',
  backgroundColor: '#1a1a1a',
  color: '#ffffff',
};

const auctionsBoxStyle = {
  border: '1px solid #4caf50',
  borderRadius: '10px',
  padding: '20px',
  marginTop: '20px',
  backgroundColor: '#1a1a1a',
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
  maxHeight: '400px',
  overflowY: 'auto'
};

export default App;
