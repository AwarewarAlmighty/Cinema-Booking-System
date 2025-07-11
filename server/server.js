const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Ensure cors is imported
require('dotenv').config();

// Import all route handlers
const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies');
const hallRoutes = require('./routes/halls');
const showtimeRoutes = require('./routes/showtimes'); 
const bookingRoutes = require('./routes/bookings');   

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI; // Use the URI from your .env file

// --- CORS Configuration ---
// Define the allowed origins. This tells the server to accept requests
// from your local development server and your live Netlify site.
const allowedOrigins = [
  'http://localhost:5173', // Your local frontend
  'https://cinema-booking-system.netlify.app' // Your deployed frontend
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

// --- Middleware ---
app.use(cors(corsOptions)); // Use the new cors options
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