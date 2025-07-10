const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = express.Router();

// ... (The existing '/register' route remains the same) ...
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


// ROUTE for REGULAR user login (by email)
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


// --- ✅ NEW: Route for ADMIN login (by username) ---
router.post('/admin-login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Find the user by their username
        const user = await User.findOne({ username });
        if (!user || user.role !== 'admin') {
            // User not found or is not an admin
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        // 2. Compare the password with the stored hash
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        // 3. Admin login is successful
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