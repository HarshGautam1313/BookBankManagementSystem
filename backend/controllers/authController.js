import bcrypt from 'bcrypt';
import * as userModel from '../models/userModel.js';

export const register = (req, res, next) => {
    try {
        const { id, password, role } = req.body;

        const existingUser = userModel.findUserById.get(id);

        if (existingUser) {
            throw new Error('User already exists');
        }

        const password_hash = bcrypt.hashSync(password, 10);

        userModel.createUser.run(id, password_hash, role);

        res.json({
            success: true,
            message: 'User registered successfully'
        });

    } catch (err) {
        next(err);
    }
};

export const login = (req, res, next) => {
    try {
        const { id, password } = req.body;

        const user = userModel.findUserById.get(id);

        if (!user) {
            throw new Error('Invalid credentials');
        }

        const validPassword = bcrypt.compareSync(password, user.password_hash);

        if (!validPassword) {
            throw new Error('Invalid credentials');
        }

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                role: user.role
            }
        });

    } catch (err) {
        next(err);
    }
};