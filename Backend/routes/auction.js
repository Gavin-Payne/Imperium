const express = require('express');
const router = express.Router();
const Auction = require('../models/Auction');
const User = require('../models/Users');
const verifyToken = require('../middleware/verifyToken');
const sqlite3 = require('sqlite3').verbose();
const moment = require('moment');
const path = require('path');

router.post('/', verifyToken, async (req, res) => {
  const { game, player, date, condition, value, metric, duration, betSize, betType, multiplier } = req.body;
  const expirationTime = new Date(Date.now() + duration * 60000);

  // Log the raw date input from the client (if needed)
  console.log('Raw date input from client:', date);
  
  // Instead of using the user input date to create a specific time,
  // we store the auction date as the current time (UTC) when the auction is posted.
  const auctionDate = new Date();
  console.log('Auction date set to time posted (UTC):', auctionDate);

  console.log('Creating auction with betSize:', req.body.betSize);

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user[betType] -= Number(betSize);
    await user.save();

    const newAuction = new Auction({
      user: req.user.id,
      game,
      player,
      date: auctionDate,
      condition,
      value,
      metric,
      duration,
      betSize,
      betType,
      multiplier,
      expirationTime
    });

    const savedAuction = await newAuction.save();
    console.log("Auction saved. Date from DB:", savedAuction.date);
    res.status(201).json(savedAuction);
  } catch (error) {
    console.error('Error posting auction:', error);
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

    // Calculate the cost.
    const cost = auction.betSize * (auction.multiplier - 1);

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

// New endpoint to retrieve games for a given date from the SQLite database
router.get('/games', async (req, res) => {
  const date = req.query.date;
  if (!date) {
    return res.status(400).json({ error: 'Missing date parameter' });
  }
  // Format the date similarly to retrieve.py: '%a, %b %d, %Y'
  const formattedDate = moment(date, 'YYYY-MM-DD').format('ddd, MMM DD, YYYY');
  
  // Use an absolute path to the database file
  const dbPath = path.join(__dirname, '../../nba_schedule.db');
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    }
  });
  
  db.all("SELECT * FROM games WHERE date = ?", [formattedDate], (err, rows) => {
    if (err) {
      console.error("Error fetching games:", err.message);
      res.status(500).json({ error: err.message });
    } else {
      // Use bracket notation to correctly access columns with slashes in their names
      const games = rows.map(row => ({
        home_team: row["visitor_team"],
        away_team: row["home_team"]
      }));
      res.json(games);
    }
  });
  
  db.close();
});

router.get('/successful', verifyToken, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Return only successful auctions for which the current user is either the seller or the buyer,
    // and that have a date from today onwards.
    const auctions = await Auction.find({
      soldTo: { $ne: null },
      date: { $gte: today },
      $or: [
        { user: req.user.id },
        { soldTo: req.user.id }
      ]
    });
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