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
const MONGODB_URI = "mongodb+srv://zephylariuszl:8l7PZ4BY7RhcX6n5@cluster0.zlkr8jn.mongodb.net/cinema_booking";

app.use(cors());
app.use(express.json());

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Successfully connected to MongoDB [database: cinema_booking]'))
  .catch((error) => console.error('❌ Error connecting to MongoDB:', error));

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/halls', hallRoutes);
app.use('/api/showtimes', showtimeRoutes); // --- Use showtime routes
app.use('/api/bookings', bookingRoutes);   // --- Use booking routes

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});