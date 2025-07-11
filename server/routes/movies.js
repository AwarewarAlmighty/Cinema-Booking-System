const express = require('express');
const Movie = require('../models/Movie'); // Import the Movie model

const router = express.Router();

// --- ROUTE: GET /api/movies ---
// Fetches all movies from the database
router.get('/', async (req, res) => {
    try {
        const page = Number(req.query.page) || 1; // Default to page 1
        const perPage = Number(req.query.perPage) || 10; 
        const [total, movies] = await Promise.all([
            Movie.countDocuments(), // Count total movies  
             Movie.find()
            .skip((page - 1) * perPage)
            .limit(perPage) // Fetch movies with pagination
            .sort({ createdAt: -1 }) // Sort by creation date, newest first
        ]);

        const totalPages = Math.ceil(total / perPage);
        res.status(200).json(movies);
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching movies.' });
    }
});

// --- NEW ROUTE: GET /api/movies/:id ---
// Fetches a single movie by its ID
router.get('/:id', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found.' });
        }
        res.status(200).json(movie);
    } catch (error) {
        // This will catch invalid ID formats and other potential errors
        res.status(500).json({ message: 'Server error while fetching the movie.' });
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