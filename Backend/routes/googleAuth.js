const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/Users');

// Check if Google account exists
router.post('/google-signin/check', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    res.json({ exists: !!user });
  } catch (error) {
    console.error('Google sign-in check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Handle Google sign-in/sign-up
router.post('/google-signin', async (req, res) => {
  try {
    const { credential, username } = req.body;
    const decoded = jwt.decode(credential);

    if (!decoded) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user exists
    let user = await User.findOne({ email: decoded.email });

    if (user) {
      // Existing user - just return token
      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      return res.json({ token });
    }

    // New user - check if username is provided
    if (!username) {
      return res.status(400).json({ message: 'Username required for new accounts' });
    }

    // Check if username is taken
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: 'username_taken' });
    }

    // Create new user
    user = new User({
      username,
      email: decoded.email,
      silver: 1000,
      gold: 1000
    });
    await user.save();

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Google sign-in error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;