const express = require('express');
const Booking = require('../models/Booking');

const router = express.Router();

// GET all bookings with populated details
router.get('/', async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate({
                path: 'showtime',
                populate: {
                    path: 'movie hall'
                }
            })
            .populate('user')
            .sort({ booking_date: -1 });
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching bookings.' });
    }
});

// --- NEW ROUTE: GET /api/bookings/user/:userId ---
// Fetches all bookings for a specific user
router.get('/user/:userId', async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.params.userId })
            .populate({
                path: 'showtime',
                populate: {
                    path: 'movie hall'
                }
            })
            .sort({ booking_date: -1 });
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching user bookings.' });
    }
});

// GET a single booking by its ID
router.get('/:id', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate({
                path: 'showtime',
                populate: {
                    path: 'movie hall'
                }
            })
            .populate('user');
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }
        
        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching booking.' });
    }
});

// POST a new booking
router.post('/', async (req, res) => {
    try {
        const newBooking = new Booking(req.body);
        const savedBooking = await newBooking.save();
        res.status(201).json(savedBooking);
    } catch (error) {
        res.status(400).json({ message: 'Error creating booking.', error });
    }
});

// PATCH to update booking status
router.patch('/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const updatedBooking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.status(200).json(updatedBooking);
    } catch (error) {
        res.status(400).json({ message: 'Error updating booking status.' });
    }
});

module.exports = router;