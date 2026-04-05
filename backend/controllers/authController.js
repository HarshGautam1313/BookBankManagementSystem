import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';

export const signup = async (req, res) => {
    try {
        const { full_name, email, password, role } = req.body;

        // 1. Check if user already exists
        const userExists = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email.' });
        }

        // 2. Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Insert user into DB
        const stmt = db.prepare('INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)');
        const info = stmt.run(full_name, email, hashedPassword, role);

        res.status(201).json({ message: 'User created successfully', userId: info.lastInsertRowid });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find user by email
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // 2. Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // 3. Generate JWT Token
        const token = jwt.sign(
            { userId: user.user_id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Login successful',
            token,
            role: user.role,
            userName: user.full_name
        });
    } catch (error) {
        res.status(500).json({ message: 'Error during login', error: error.message });
    }
};