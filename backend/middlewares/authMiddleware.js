const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes
const protect = async (req, res, next) => {
    let token;

    // Check if token is present in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]; // Get token
    }

    // If no token, return unauthorized error
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ message: 'Not authorized, Token failed', error: error.message });
    }
};

// Middleware for Admin-only access
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next(); // User is admin, proceed
    } else {
        return res.status(403).json({ message: 'Forbidden: Admins only' });
    }
};

module.exports = {protect, adminOnly,};
