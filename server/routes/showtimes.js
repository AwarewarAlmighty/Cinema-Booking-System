const express = require('express');
const Showtime = require('../models/Showtime');

const router = express.Router();

// GET all showtimes, populated with movie and hall details
router.get('/', async (req, res) => {
    try {
        const showtimes = await Showtime.find()
            .populate('movie') // Replaces the movie ID with the full movie document
            .populate('hall')   // Replaces the hall ID with the full hall document
            .sort({ show_date: -1, start_time: 1 });
        res.status(200).json(showtimes);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching showtimes.' });
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