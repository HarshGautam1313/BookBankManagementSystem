import express from 'express';
import { getUsers } from '../controllers/userController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Only the Admin should be able to see the list of students
router.get('/', verifyToken, isAdmin, getUsers);

export default router;