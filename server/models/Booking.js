const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    showtime: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Showtime',
        required: true,
    },
    booking_date: {
        type: Date,
        default: Date.now,
    },
    total_seats: {
        type: Number,
        required: true,
    },
    total_amount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending',
    },
    selected_seats: [{
        type: String,
        required: true,
    }],
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);