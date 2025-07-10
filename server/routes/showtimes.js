const express = require('express');
const Showtime = require('../models/Showtime');

const router = express.Router();

// GET all showtimes, populated with movie and hall details
router.get('/', async (req, res) => {
    try {
        const showtimes = await Showtime.find()
            .populate('movie')
            .populate('hall')
            .sort({ show_date: -1, start_time: 1 });
        res.status(200).json(showtimes);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching showtimes.' });
    }
});

// --- NEW ROUTE: GET /api/showtimes/:id ---
// Fetches a single showtime by its ID
router.get('/:id', async (req, res) => {
    try {
        const showtime = await Showtime.findById(req.params.id)
            .populate('movie')
            .populate('hall');
        if (!showtime) {
            return res.status(404).json({ message: 'Showtime not found' });
        }
        res.status(200).json(showtime);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching showtime.' });
    }
});

// GET all showtimes for a specific movie
router.get('/movie/:movieId', async (req, res) => {
    try {
        const showtimes = await Showtime.find({ movie: req.params.movieId })
            .populate('hall')
            .sort({ show_date: 1, start_time: 1 });
        res.status(200).json(showtimes);
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching showtimes for the movie.' });
    }
});

// POST a new showtime
router.post('/', async (req, res) => {
    try {
        const newShowtime = new Showtime(req.body);
        await newShowtime.save();
        res.status(201).json(newShowtime);
    } catch (error) {
        res.status(400).json({ message: 'Error creating showtime.', error });
    }
});

// DELETE a showtime
router.delete('/:id', async (req, res) => {
    try {
        await Showtime.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Showtime deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting showtime.' });
    }
});

// PUT (Update) a showtime
router.put('/:id', async (req, res) => {
    try {
        const updatedShowtime = await Showtime.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedShowtime);
    } catch (error) {
        res.status(400).json({ message: 'Error updating showtime.' });
    }
});

module.exports = router;