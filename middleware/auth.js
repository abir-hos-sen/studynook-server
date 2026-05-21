const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    let token = req.cookies.token;

    // Check Authorization header if cookie is not present
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.userId };
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};

module.exports = verifyToken;
