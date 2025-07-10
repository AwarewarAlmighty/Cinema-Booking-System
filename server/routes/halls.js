const express = require('express');
const Hall = require('../models/Hall'); // Import the Hall model

const router = express.Router();

// --- ROUTE: GET /api/halls ---
// Fetches all halls
router.get('/', async (req, res) => {
    try {
        const halls = await Hall.find().sort({ hall_name: 1 }); // Sort by name
        res.status(200).json(halls);
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching halls.' });
    }
});

// --- ROUTE: POST /api/halls ---
// Creates a new hall
router.post('/', async (req, res) => {
    try {
        const newHall = new Hall(req.body);
        const savedHall = await newHall.save();
        res.status(201).json(savedHall);
    } catch (error) {
        res.status(400).json({ message: 'Error creating hall.', error });
    }
});

// --- ROUTE: PUT /api/halls/:id ---
// Updates an existing hall
router.put('/:id', async (req, res) => {
    try {
        const updatedHall = await Hall.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedHall);
    } catch (error) {
        res.status(400).json({ message: 'Error updating hall.' });
    }
});

// --- ROUTE: DELETE /api/halls/:id ---
// Deletes a hall
router.delete('/:id', async (req, res) => {
    try {
        await Hall.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Hall deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting hall.' });
    }
});

module.exports = router;