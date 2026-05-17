const express = require('express');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// Book a room (Private)
router.post('/', verifyToken, async (req, res) => {
    try {
        const { roomId, date, startHour, endHour, specialNote } = req.body;

        if (startHour >= endHour) {
            return res.status(400).json({ message: 'End time must be after start time' });
        }

        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ message: 'Room not found' });

        // Conflict check: check if the selected room and time slot has a confirmed booking
        // Two bookings overlap if: max(start1, start2) < min(end1, end2)
        // Which means: newStart < existingEnd AND newEnd > existingStart
        const conflictingBooking = await Booking.findOne({
            room: roomId,
            date: date,
            status: 'confirmed',
            startHour: { $lt: endHour },
            endHour: { $gt: startHour }
        });

        if (conflictingBooking) {
            return res.status(409).json({ message: 'Room is already booked for this time slot' });
        }

        const totalCost = (endHour - startHour) * room.hourlyRate;

        const newBooking = new Booking({
            user: req.user.id,
            room: roomId,
            date,
            startHour,
            endHour,
            totalCost,
            specialNote
        });

        await newBooking.save();

        // Increment booking count
        await Room.findByIdAndUpdate(roomId, { $inc: { bookingCount: 1 } });

        res.status(201).json({ message: 'Room booked successfully', booking: newBooking });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get user's bookings (Private)
router.get('/my-bookings', verifyToken, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate('room', 'name image')
            .sort({ date: -1, startHour: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Cancel a booking (Private)
router.patch('/:id/cancel', verifyToken, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to cancel this booking' });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({ message: 'Booking is already cancelled' });
        }

        booking.status = 'cancelled';
        await booking.save();

        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
