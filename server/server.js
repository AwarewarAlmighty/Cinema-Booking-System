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

// --- CORS Configuration ---
const allowedOrigins = [
  'http://localhost:5173',
  'https://cinema-booking-system.netlify.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

// --- Middleware ---

// 1. Enable CORS for all routes and handle preflight requests
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // This is crucial for preflight requests

// 2. Simple request logger to see what's hitting the server
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.path}`);
  next();
});

// 3. Body parser
app.use(express.json());


// --- Database Connection ---
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Successfully connected to MongoDB'))
  .catch((error) => console.error('❌ Error connecting to MongoDB:', error));

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/halls', hallRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/bookings', bookingRoutes);

// --- Server Listener ---
app.listen(PORT, () => {
  console.log(`✅ Backend server is running on http://localhost:${PORT}`);
});