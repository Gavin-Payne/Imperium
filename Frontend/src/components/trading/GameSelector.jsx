import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { modernSelectStyle } from '../../styles/components/forms.styles';

const GameSelector = ({ 
  selectedDate, 
  selectedGame, 
  onGameChange,
  token 
}) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGames = async () => {
      if (!selectedDate) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(
          `http://localhost:5000/api/auctions/games?date=${selectedDate}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch games');
        }

        const data = await response.json();
        setGames(data);
      } catch (err) {
        console.error('Error fetching games:', err);
        setError('Failed to load games');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [selectedDate, token]);

  if (loading) return <p>Loading games...</p>;
  if (error) return <p>{error}</p>;

  return (
    <select
      value={selectedGame}
      onChange={onGameChange}
      style={modernSelectStyle}
      required
      disabled={!selectedDate || games.length === 0}
    >
      <option value="">Select Game</option>
      {games.map((game, index) => (
        <option key={index} value={game}>{game}</option>
      ))}
    </select>
  );
};

GameSelector.propTypes = {
  selectedDate: PropTypes.string,
  selectedGame: PropTypes.string,
  onGameChange: PropTypes.func.isRequired,
  token: PropTypes.string
};

export default GameSelector;