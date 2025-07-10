const mongoose = require('mongoose');

const ShowtimeSchema = new mongoose.Schema({
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie', // This creates a reference to the Movie model
        required: true,
    },
    hall: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hall', // This creates a reference to the Hall model
        required: true,
    },
    show_date: {
        type: Date,
        required: true,
    },
    start_time: {
        type: String,
        required: true,
    },
    end_time: {
        type: String,
        required: true,
    },
    ticket_price: {
        type: Number,
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Showtime', ShowtimeSchema);