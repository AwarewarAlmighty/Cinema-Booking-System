const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    genre: { type: String, required: true },
    duration: { type: Number, required: true },
    release_date: { type: Date, required: true },
    poster_url: { type: String, required: true },
    trailer_url: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Movie', MovieSchema);