const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    startHour: { type: Number, required: true }, // e.g., 9 for 09:00
    endHour: { type: Number, required: true }, // e.g., 11 for 11:00
    totalCost: { type: Number, required: true },
    specialNote: { type: String },
    status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
