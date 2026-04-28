import db from '../config/db.js';

export const getUsers = (req, res) => {
    try {
        const { search } = req.query;
        let users;

        if (search) {
            // Search by name or email, but only return students
            users = db.prepare(`
                SELECT user_id, full_name, email 
                FROM users 
                WHERE role = 'student' 
                AND (full_name LIKE ? OR email LIKE ?)
            `).all(`%${search}%`, `%${search}%`);
        } else {
            // Default: Get all students
            users = db.prepare("SELECT user_id, full_name, email FROM users WHERE role = 'student'").all();
        }

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};