const express = require('express');
const Room = require('../models/Room');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// Get all rooms (Public) - with search & filter
router.get('/', async (req, res) => {
    try {
        const { search, minRate, maxRate, amenities, floor } = req.query;
        let query = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        
        if (minRate || maxRate) {
            query.hourlyRate = {};
            if (minRate) query.hourlyRate.$gte = Number(minRate);
            if (maxRate) query.hourlyRate.$lte = Number(maxRate);
        }

        if (amenities) {
            // amenities should be comma separated e.g. "Wi-Fi,Projector"
            const amenityList = amenities.split(',');
            query.amenities = { $in: amenityList };
        }

        if (floor) {
            query.floor = floor;
        }

        const rooms = await Room.find(query).sort({ createdAt: -1 });
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get latest 6 rooms for home page (Public)
router.get('/latest', async (req, res) => {
    try {
        const rooms = await Room.find().sort({ createdAt: -1 }).limit(6);
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single room details (Public)
router.get('/:id', async (req, res) => {
    try {
        const room = await Room.findById(req.params.id).populate('owner', 'name email photoURL');
        if (!room) return res.status(404).json({ message: 'Room not found' });
        res.json(room);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create a room (Private)
router.post('/', verifyToken, async (req, res) => {
    try {
        const newRoom = new Room({
            ...req.body,
            owner: req.user.id
        });
        await newRoom.save();
        res.status(201).json(newRoom);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update a room (Private - Owner only)
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ message: 'Room not found' });

        if (room.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this room' });
        }

        const updatedRoom = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedRoom);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete a room (Private - Owner only)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ message: 'Room not found' });

        if (room.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this room' });
        }

        // We can also delete all bookings for this room, but for now we just delete the room
        await Room.findByIdAndDelete(req.params.id);
        res.json({ message: 'Room deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
