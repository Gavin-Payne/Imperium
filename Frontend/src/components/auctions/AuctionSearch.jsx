import React, { useState } from 'react';
import { modernInputStyle, modernSelectStyle, modernButtonStyle } from '../../styles/components/forms.styles';

const AuctionSearch = ({ onSearch }) => {
  // Add state for search fields
  const [searchDate, setSearchDate] = useState('');
  const [searchTeam, setSearchTeam] = useState('');
  const [searchPlayer, setSearchPlayer] = useState('');
  const [searchMetric, setSearchMetric] = useState('');

  // Add the missing style definition
  const searchContainerStyle = {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px'
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({
      date: searchDate,
      team: searchTeam,
      player: searchPlayer,
      metric: searchMetric
    });
  };

  return (
    <div style={searchContainerStyle}>
      <form onSubmit={handleSubmit}>
        <input 
          type="date" 
          value={searchDate} 
          onChange={(e) => setSearchDate(e.target.value)} 
          style={modernInputStyle}
        />
        <input 
          type="text" 
          placeholder="Team" 
          value={searchTeam} 
          onChange={(e) => setSearchTeam(e.target.value)} 
          style={modernInputStyle}
        />
        <input 
          type="text" 
          placeholder="Player" 
          value={searchPlayer} 
          onChange={(e) => setSearchPlayer(e.target.value)} 
          style={modernInputStyle}
        />
        <select 
          value={searchMetric} 
          onChange={(e) => setSearchMetric(e.target.value)} 
          style={modernSelectStyle}
        >
          <option value="">Select Metric</option>
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
        <button type="submit" style={modernButtonStyle}>
          Search Auctions
        </button>
      </form>
    </div>
  );
};

export default AuctionSearch;