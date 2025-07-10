const express = require('express');
const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const router = express.Router();

// Initialize the Google client with your Client ID from the .env file
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const newUser = new User({ fullName, email, passwordHash });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully.' });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    const userResponse = { id: user._id, fullName: user.fullName, email: user.email, role: user.role };
    res.status(200).json({ message: 'Login successful.', user: userResponse });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// ROUTE for Google Sign-In
router.post('/google-login', async (req, res) => {
    const { credential } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { name, email } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            const dummyPassword = email + process.env.JWT_SECRET;
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(dummyPassword, salt);
            
            user = new User({
                fullName: name,
                email: email,
                passwordHash: passwordHash,
                role: 'user',
            });
            await user.save();
        }
        
        const userResponse = { id: user._id, fullName: user.fullName, email: user.email, role: user.role };
        res.status(200).json({ message: 'Google login successful.', user: userResponse });

    } catch (error) {
        console.error('Google login error:', error);
        res.status(401).json({ message: 'Invalid Google token or login failed.' });
    }
});

router.post('/admin-login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user || user.role !== 'admin') {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        const userResponse = {
            id: user._id,
            fullName: user.fullName,
            username: user.username,
            role: user.role,
        };
        
        res.status(200).json({
            message: 'Admin login successful.',
            user: userResponse,
        });

    } catch (error) {
        console.error('Admin Login Error:', error);
        res.status(500).json({ message: 'Server error during admin login.' });
    }
});

module.exports = router;