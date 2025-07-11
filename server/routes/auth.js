const express = require('express');
const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { EMAIL_USER, EMAIL_PASS } = require('./config'); // Assuming config.js has these
const router = express.Router();

// Initialize the Google client with your Client ID from the .env file
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // If user exists but is not verified, you might want to resend verification email
      if (!existingUser.isVerified) {
        // Option: Resend verification email logic here
        console.log('User exists but not verified, resending email...');
        // For now, just return a message
        return res.status(409).json({ message: 'User with this email already exists but is not verified. Please check your email or try logging in.' });
      }
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const newUser = new User({
      fullName,
      email,
      passwordHash,
      isVerified: false, // User is not verified upon registration
      verificationToken,
    });

    await newUser.save();

    // Set up nodemailer transporter (ensure EMAIL_USER and EMAIL_PASS are loaded from .env)
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: EMAIL_USER, // Loaded from config.js which should get from process.env
        pass: EMAIL_PASS, // Loaded from config.js which should get from process.env
      }
    });

    // Frontend verification URL
    const verificationUrl = `http://localhost:5173/verify-email?token=${verificationToken}&email=${email}`;

    console.log('Sending verification email to:', email);

    try {
      await transporter.sendMail({
        from: '"Cinema App" <no-reply@cinema.com>', // Your sender email
        to: email,
        subject: 'Verify Your Email',
        html: `<p>Hello ${fullName},</p><p>Click <a href="${verificationUrl}">here</a> to verify your account.</p>`,
      });
      console.log('Verification email sent successfully.');
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Consider rolling back user creation or marking user as needing email resend
      // For now, we proceed, but log the error.
    }

    res.status(201).json({ message: 'User created. Please verify your email.' });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// POST /api/auth/login
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


    // If all checks pass, return user information (you might add a JWT token here later)
    const userResponse = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    };

    res.status(200).json({ message: 'Login successful.', user: userResponse });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// POST /api/auth/google-login
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
      const dummyPassword = email + process.env.JWT_SECRET; // Or generate a strong random one
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(dummyPassword, salt);

      user = new User({
        fullName: name,
        email: email,
        passwordHash: passwordHash,
        role: 'user',// Google users are considered verified
        verificationToken: undefined, // No token needed for Google verified users
      });
      await user.save();
    } else if (!user.isVerified) {

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();
        console.log(`User ${email} verified via Google login.`);
    }

    const userResponse = { id: user._id, fullName: user.fullName, email: user.email, role: user.role };
    res.status(200).json({ message: 'Google login successful.', user: userResponse });

  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ message: 'Invalid Google token or login failed.' });
  }
});

// GET /api/auth/verify-email
router.get('/verify-email', async (req, res) => {
  const { token, email } = req.query;

  if (!token || !email) {
    return res.status(400).send('Invalid verification link.');
  }

  try {
    const user = await User.findOne({ email, verificationToken: token });

    if (!user) {
      return res.status(400).send('Verification failed. Token may be invalid or expired.');
    }

    user.isVerified = true;
    user.verificationToken = undefined; // Clear the token after use
    await user.save();

    // Redirect to a frontend page indicating success
    res.redirect('http://localhost:5173/email-verified?verified=true'); // Added query param for frontend toast
  } catch (err) {
    console.error('Email verification error:', err);
    res.status(500).send('Server error during email verification.');
  }
});

module.exports = router;
