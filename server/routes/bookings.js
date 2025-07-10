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