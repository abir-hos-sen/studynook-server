const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const verifyToken = require('../middleware/auth');

const router = express.Router();

const generateTokenAndSetCookie = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    return token;
};

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, photoURL } = req.body;
        
        // Password validation is checked on frontend as per requirements, but good to have basic check
        if (!password || password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword, photoURL });
        await newUser.save();

        res.status(201).json({ message: 'Registration successful' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

        const token = generateTokenAndSetCookie(res, user._id);
        res.json({ message: 'Login successful', token, user: { _id: user._id, name: user.name, email: user.email, photoURL: user.photoURL } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Google Login
router.post('/google', async (req, res) => {
    try {
        const { name, email, photoURL } = req.body; // Sent from frontend after Firebase auth

        let user = await User.findOne({ email });
        if (!user) {
            // Create user without password for google auth
            // We use a dummy random password to satisfy required field
            const dummyPassword = await bcrypt.hash(Math.random().toString(36).slice(-8), 10);
            user = new User({ name, email, password: dummyPassword, photoURL });
            await user.save();
        }

        const token = generateTokenAndSetCookie(res, user._id);
        res.json({ message: 'Google login successful', token, user: { _id: user._id, name: user.name, email: user.email, photoURL: user.photoURL } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Logout
router.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    });
    res.json({ message: 'Logged out successfully' });
});

// Get Current User
router.get('/me', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update Profile
router.put('/update-profile', verifyToken, async (req, res) => {
    try {
        const { name, photoURL } = req.body;
        if (!name) return res.status(400).json({ message: 'Name is required' });

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, photoURL },
            { new: true }
        ).select('-password');

        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
