const mongoose = require('mongoose');

const HallSchema = new mongoose.Schema({
    hall_name: {
        type: String,
        required: true,
    },
    total_seats: {
        type: Number,
        required: true,
    },
    layout_rows: {
        type: Number,
        required: true,
    },
    layout_columns: {
        type: Number,
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Hall', HallSchema);