const express = require('express');
const router = express.Router();
const Auction = require('../models/Auction');
const User = require('../models/Users');
const verifyToken = require('../middleware/verifyToken');
const sqlite3 = require('sqlite3').verbose();
const moment = require('moment');
const path = require('path');

router.post('/', verifyToken, async (req, res) => {
  try {
    const { game, player, date, gameDate, condition, value, metric, duration, betSize, betType, multiplier } = req.body;
    const expirationTime = new Date(Date.now() + duration * 60000);

    // Set auction creation date
    const auctionDate = new Date();
    
    // Use the provided gameDate or fall back to the date field
    const actualGameDate = gameDate ? new Date(gameDate) : new Date(date);
    
    console.log('Creating auction with dates:', {
      creationDate: auctionDate,
      gameDate: actualGameDate,
      expirationTime
    });

    const newAuction = new Auction({
      user: req.user.id,
      game,
      player,
      date: auctionDate,
      gameDate: actualGameDate,
      condition,
      value,
      metric,
      duration,
      betSize,
      betType,
      multiplier,
      expirationTime
    });

    const auction = await newAuction.save();
    res.json(auction);
  } catch (err) {
    console.error('Error creating auction:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/buy', verifyToken, async (req, res) => {
  const { auctionId } = req.body;
  try {
    const auction = await Auction.findById(auctionId);
    if (!auction) return res.status(404).json({ message: 'Auction not found' });
    if (auction.soldTo) {
      return res.status(400).json({ message: 'Auction already sold' });
    }
    
    // Prevent the seller from buying their own auction.
    if (auction.user.toString() === req.user.id.toString()) {
      return res.status(400).json({ message: "Seller cannot buy their own auction." });
    }

    // Fetch buyer and seller user objects.
    const buyer = await User.findById(req.user.id);
    if (!buyer) return res.status(404).json({ message: 'Buyer not found' });
    const seller = await User.findById(auction.user);

    // Calculate the cost and round to two decimals.
    const rawCost = auction.betSize * (auction.multiplier - 1);
    const cost = parseFloat(rawCost.toFixed(2));

    if (buyer[auction.betType] < cost) {
      return res.status(400).json({ message: "You don't have enough currency to buy this auction." });
    }

    // Deduct cost from buyer's account.
    buyer[auction.betType] -= cost;
    await buyer.save();

    auction.soldTo = req.user.id;
    const updatedAuction = await auction.save();

    res.json({ message: "Auction bought successfully", auction: updatedAuction });
  } catch (error) {
    console.error('Error buying auction:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', verifyToken, async (req, res) => {
  try {
    const now = new Date();
    const auctions = await Auction.find({
      user: req.user.id,
      expirationTime: { $gt: now },
      soldTo: null  // Only include unsold auctions
    });
    res.json(auctions);
  } catch (error) {
    console.error('Error fetching auctions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/all', verifyToken, async (req, res) => {
  try {
    const now = new Date();
    const auctions = await Auction.find({
      expirationTime: { $gt: now },
      soldTo: null  // Only include unsold auctions
    });
    res.json(auctions);
  } catch (error) {
    console.error('Error fetching active auctions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add this route for active auctions
router.get('/active', verifyToken, async (req, res) => {
  try {
    const now = new Date();
    const auctions = await Auction.find({
      user: req.user.id,
      expirationTime: { $gt: now },
      soldTo: null
    });
    res.json(auctions);
  } catch (error) {
    console.error('Error fetching active auctions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Backend/routes/auction.js - Fix the games route
router.get('/games', async (req, res) => {
  const date = req.query.date;
  if (!date) {
    return res.status(400).json({ error: 'Missing date parameter' });
  }
  
  // Use 'D' instead of 'DD' to avoid leading zeros in day numbers
  const formattedDate = moment(date).format('ddd, MMM D, YYYY');
  console.log('Looking for games with date:', formattedDate);
  
  // Use an absolute path to the database file
  const dbPath = path.join(__dirname, '../../nba_schedule.db');
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
      return res.status(500).json({ error: 'Database connection error' });
    }
  });
  
  db.all("SELECT * FROM games WHERE date = ?", [formattedDate], (err, rows) => {
    if (err) {
      console.error("Error fetching games:", err.message);
      res.status(500).json({ error: err.message });
    } else {
      // Transform the SQLite data into formatted game strings
      const gameStrings = rows.map(row => `${row["visitor_team"]} vs ${row["home_team"]}`);
      
      console.log('Games found for date', formattedDate, ':', gameStrings);
      res.json(gameStrings);
    }
    
    db.close();
  });
});

router.get('/successful', verifyToken, async (req, res) => {
  try {
    // Log the request
    console.log('Fetching successful auctions for user ID:', req.user.id);
    
    // Find auctions with proper population
    const auctions = await Auction.find({
      soldTo: { $ne: null }, // Must be sold
      $or: [
        { user: req.user.id },  // User is seller
        { soldTo: req.user.id } // User is buyer
      ]
    })
    .populate('user', 'username _id') // Make sure to include _id
    .populate('soldTo', 'username _id'); // Make sure to include _id
    
    console.log(`Found ${auctions.length} successful auctions for user`);
    
    // Send a properly structured response
    res.json(auctions);
  } catch (error) {
    console.error('Error fetching successful auctions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/processExpired', verifyToken, async (req, res) => {
  try {
    const now = new Date();
    // Find all expired auctions that belong to the current user, unsold, and not yet refunded.
    const expiredAuctions = await Auction.find({
      user: req.user.id,
      expirationTime: { $lt: now },
      soldTo: null,
      refunded: { $ne: true }
    });
    
    for (const auction of expiredAuctions) {
      // Refund the seller by adding the betSize back to their currency (using the specified betType)
      const seller = await User.findById(auction.user);
      if (seller) {
        seller[auction.betType] += auction.betSize;
        await seller.save();
      }
      // Mark auction as refunded so it won't be processed again.
      auction.refunded = true;
      await auction.save();
    }
    
    res.json({
      message: "Expired auctions processed and refunded",
      refundedAuctions: expiredAuctions.length
    });
  } catch (error) {
    console.error('Error processing expired auctions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;