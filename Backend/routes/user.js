const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/Users');
const router = express.Router();
const moment = require('moment-timezone');
const verifyToken = require('../middleware/verifyToken');

// Profile route to fetch user data
router.get('/profile', verifyToken, async (req, res) => {
  try {
    console.log("Profile request received for user ID:", req.user.id);
    
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      console.log("User not found in database for ID:", req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log("User found:", user.username);

    // Add last claim date for daily allowance if available
    const lastClaimDate = user.lastDailyAllowance ? 
      new Date(user.lastDailyAllowance) : null;
      
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if daily allowance was already collected today
    const dailyCollected = lastClaimDate && 
      lastClaimDate.getDate() === today.getDate() &&
      lastClaimDate.getMonth() === today.getMonth() &&
      lastClaimDate.getFullYear() === today.getFullYear();

    // Return the user profile with additional data
    res.json({
      ...user._doc,  // Use _doc to get the raw document
      dailyCollected
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
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
