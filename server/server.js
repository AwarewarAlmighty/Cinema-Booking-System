const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import all route handlers
const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies');
const hallRoutes = require('./routes/halls');
const showtimeRoutes = require('./routes/showtimes');
const bookingRoutes = require('./routes/bookings');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// --- NEW, MORE ROBUST CORS CONFIGURATION ---
const allowedOrigins = [
  'http://localhost:5173',
  'https://cinema-booking-system.netlify.app'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', true);
  return next();
});

app.use(express.json());

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Successfully connected to MongoDB'))
  .catch((error) => console.error('❌ Error connecting to MongoDB:', error));

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/halls', hallRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/bookings', bookingRoutes);

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});