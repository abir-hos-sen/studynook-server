const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
// Trust the first proxy (Vercel) so secure cookies are set correctly in production
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];
if (process.env.CLIENT_URL) {
    allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const isAllowed = allowedOrigins.includes(origin) || origin.endsWith('.vercel.app');
        if (isAllowed) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

const seedDatabase = require('./seed');

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        seedDatabase();
    })
    .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/bookings', require('./routes/bookings'));

app.get('/', (req, res) => {
    res.send('StudyNook API is running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on: http://localhost:${PORT}`);
});

module.exports = app;
