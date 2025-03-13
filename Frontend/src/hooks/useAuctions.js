import { useState, useEffect } from 'react';
import api from '../services/api';
import moment from 'moment';

export const useAuctions = (token) => {
  const [allAuctions, setAllAuctions] = useState([]);
  const [allAuctionsMaster, setAllAuctionsMaster] = useState([]);
  const [activeAuctions, setActiveAuctions] = useState([]);
  const [successfulAuctions, setSuccessfulAuctions] = useState([]);

  useEffect(() => {
    if (token) {
      fetchAllAuctions();
      fetchActiveAuctions();
      fetchSuccessfulAuctions();
    }
  }, [token]);

  const fetchAllAuctions = async () => {
    try {
      const response = await api.get('/auctions/all');
      const auctions = response.data;
      const validAuctions = auctions.filter(auction => 
        new Date(auction.expirationTime).getTime() > Date.now()
      );
      setAllAuctions(validAuctions);
      setAllAuctionsMaster(validAuctions);
    } catch (error) {
      console.error('Error fetching all auctions:', error);
    }
  };

  const fetchActiveAuctions = async () => {
    try {
      const response = await api.get('/auctions/active');
      setActiveAuctions(response.data);
    } catch (error) {
      console.error('Error fetching active auctions:', error);
      setActiveAuctions([]);
    }
  };

  const fetchSuccessfulAuctions = async () => {
    try {
      const response = await api.get('/auctions/successful');
      setSuccessfulAuctions(response.data);
    } catch (error) {
      console.error('Error fetching successful auctions:', error);
      setSuccessfulAuctions([]);
    }
  };

  const handleSearch = (searchParams) => {
    let filtered = allAuctionsMaster;
    const { date, team, player, metric } = searchParams;

    if (date) {
      filtered = filtered.filter(a => 
        moment(a.date).format("YYYY-MM-DD") === date
      );
    }
    if (team) {
      filtered = filtered.filter(a =>
        removeDiacritics(a.game.toLowerCase()).includes(removeDiacritics(team.toLowerCase()))
      );
    }
    if (player) {
      filtered = filtered.filter(a =>
        removeDiacritics(a.player.toLowerCase()).includes(removeDiacritics(player.toLowerCase()))
      );
    }
    if (metric) {
      filtered = filtered.filter(a =>
        removeDiacritics(a.metric.toLowerCase()) === removeDiacritics(metric.toLowerCase())
      );
    }
    setAllAuctions(filtered);
  };

  const handleCreateAuction = async (auctionData) => {
    try {
      console.log('Creating auction with data:', auctionData);
      const response = await api.post('/auctions', auctionData);
      console.log('Auction created:', response.data);
      
      // Refresh auctions after creation
      fetchAllAuctions();
      fetchActiveAuctions();
      
      return response.data;
    } catch (error) {
      console.error('Error creating auction:', error);
      throw error;
    }
  };

  const handleBuyAuction = async (auctionId) => {
    try {
      console.log(`Attempting to buy auction: ${auctionId}`);
      const response = await api.post('/auctions/buy', { auctionId });
      console.log('Buy response:', response.data);
      
      // Refresh auctions after buying
      fetchAllAuctions();
      fetchActiveAuctions();
      fetchSuccessfulAuctions();
      
      return response.data;
    } catch (error) {
      console.error('Error buying auction:', error);
      throw error;
    }
  };

  return {
    allAuctions,
    activeAuctions,
    successfulAuctions,
    allAuctionsMaster,
    handleSearch,
    fetchAllAuctions,
    fetchActiveAuctions,
    fetchSuccessfulAuctions,
    handleCreateAuction,
    handleBuyAuction
  };
};