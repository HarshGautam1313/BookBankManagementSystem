import express from 'express';
import {
    addBook,
    fetchBooks,
    fetchBookById
} from '../controllers/bookController.js';

const router = express.Router();

router.post('/', addBook);
router.get('/', fetchBooks);
router.get('/:id', fetchBookById);

export default router;