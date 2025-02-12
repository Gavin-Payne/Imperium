const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/Users');
const router = express.Router();
const moment = require('moment-timezone');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];  // Extract token from Authorization header

  if (!token) {
    return res.status(401).json({ message: 'Access Denied' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;  // Attach user data to request
    next();  // Move to the next middleware/route handler
  } catch (err) {
    res.status(400).json({ message: 'Invalid Token' });
  }
};

// Profile route to fetch user data
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);  // Find user by ID stored in the token
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user._id,  // Include the unique user identifier
      transactions: user.numberOfTransactions,
      winRate: user.winRate,
      winnings: user.winnings,
      loss: user.LargestLoss,
      win: user.LargestWin,
      silver: user.silver,
      gold: user.gold
    });
  } catch (err) {
    console.error('Error fetching user data:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/dailyAllowance', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const currentEastern = moment().tz("America/New_York");
    let threshold;
    if (currentEastern.hour() < 4) {
      // Before 4 AM, the current cycle started at 4 AM yesterday
      threshold = moment(currentEastern).subtract(1, 'day').set({ hour: 4, minute: 0, second: 0, millisecond: 0 });
    } else {
      // 4 AM or later today means the cycle started today at 4 AM
      threshold = moment(currentEastern).set({ hour: 4, minute: 0, second: 0, millisecond: 0 });
    }

    if (user.lastDailyAllowance && moment(user.lastDailyAllowance).isAfter(threshold)) {
      return res.status(400).json({ message: 'The daily allowance has already been collected' });
    }

    // Add 100 silver and 100 gold
    user.silver += 100;
    user.gold += 100;
    user.lastDailyAllowance = new Date();
    await user.save();

    res.json({
      message: 'Daily allowance collected',
      silver: user.silver,
      gold: user.gold
    });
  } catch (err) {
    console.error('Error collecting daily allowance:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
