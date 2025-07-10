const express = require('express');
const Movie = require('../models/Movie'); // Import the Movie model

const router = express.Router();

// --- ROUTE: GET /api/movies ---
// Fetches all movies from the database
router.get('/', async (req, res) => {
    try {
        const movies = await Movie.find().sort({ createdAt: -1 });
        res.status(200).json(movies);
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching movies.' });
    }
});

// --- ROUTE: POST /api/movies ---
// Creates a new movie
router.post('/', async (req, res) => {
    try {
        const newMovie = new Movie(req.body);
        const savedMovie = await newMovie.save();
        res.status(201).json(savedMovie);
    } catch (error) {
        console.error("Error creating movie:", error);
        res.status(400).json({ message: 'Error creating movie.', error });
    }
});

// --- ROUTE: PUT /api/movies/:id ---
// Updates an existing movie
router.put('/:id', async (req, res) => {
    try {
        const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedMovie);
    } catch (error) {
        res.status(400).json({ message: 'Error updating movie.' });
    }
});

// --- ROUTE: DELETE /api/movies/:id ---
// Deletes a movie
router.delete('/:id', async (req, res) => {
    try {
        await Movie.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Movie deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting movie.' });
    }
});

module.exports = router;