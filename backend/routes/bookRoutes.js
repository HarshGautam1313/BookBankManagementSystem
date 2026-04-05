import express from 'express';
import { getBooks, addBook, updateBook, deleteBook } from '../controllers/bookController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// PUBLIC/STUDENT: Can view and search books
router.get('/', getBooks);

// ADMIN ONLY: Protect these routes with verifyToken AND isAdmin
router.post('/', verifyToken, isAdmin, addBook);
router.put('/:id', verifyToken, isAdmin, updateBook);
router.delete('/:id', verifyToken, isAdmin, deleteBook);

export default router;