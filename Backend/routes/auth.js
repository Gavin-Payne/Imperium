const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/Users');
const router = express.Router();

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// User registration (Sign-Up)
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

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save the new user
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Error in /signup:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/signin', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        console.log('Sign-in failed: Missing username or password');
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            console.log(`Sign-in failed: No user found for username: ${username}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log(`Sign-in failed: Password mismatch for username: ${username}`);
            console.log(`Input password: ${password}`);
            console.log(`Stored hashed password: ${user.password}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, {
            expiresIn: '1h',
        });

        console.log(`Sign-in successful for username: ${username}`);
        res.status(200).json({ token, message: 'Signed in successfully' });
    } catch (error) {
        console.error('Error in /signin:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = router;
