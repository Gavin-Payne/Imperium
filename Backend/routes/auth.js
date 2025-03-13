const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/Users');
const router = express.Router();
const { body, validationResult } = require('express-validator');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
if (!JWT_SECRET) {
  console.error('WARNING: JWT_SECRET is not set in environment variables!');
}

// Token blacklist set
const tokenBlacklist = new Set();

router.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Error in /signup:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post(
    '/signin',
    [
      body('username').isString().notEmpty().withMessage('Username is required'),
      body('password').isString().notEmpty().withMessage('Password is required'),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { username, password } = req.body;
  
      try {
        const user = await User.findOne({ username });
        if (!user) {
          console.log(`Sign-in failed: No user found for username: ${username}`);
          return res.status(401).json({ message: 'Invalid credentials' });
        }
  
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          console.log(`Sign-in failed for username: ${username}`);
          return res.status(401).json({ message: 'Invalid credentials' });
        }
  
        const token = jwt.sign(
          { id: user._id },
          JWT_SECRET,
          { expiresIn: '1h' }
        );
  
        console.log(`Sign-in successful for username: ${username}`);
        res.status(200).json({ token, message: 'Signed in successfully' });
      } catch (error) {
        console.error('Error in /signin:', error);
        res.status(500).json({ message: 'An unexpected error occurred' });
      }
    }
  );

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const validPassword = await user.comparePassword(password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/logout', async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (token) {
    tokenBlacklist.add(token);
  }
  
  res.json({ message: 'Logged out successfully' });
});

// Export both router and blacklist
router.tokenBlacklist = tokenBlacklist;
module.exports = router;
