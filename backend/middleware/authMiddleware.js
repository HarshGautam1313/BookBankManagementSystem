import jwt from 'jsonwebtoken';

// Middleware to verify if the user is logged in
export const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Expects "Bearer TOKEN"

    if (!token) {
        return res.status(403).json({ message: 'No token provided. Access denied.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Adds userId and role to the request object
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized! Invalid token.' });
    }
};

// Middleware to check if the user is an Admin
export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Require Admin Role!' });
    }
};