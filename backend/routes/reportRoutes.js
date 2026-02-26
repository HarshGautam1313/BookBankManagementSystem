import express from 'express';
import {
    fetchOverdueBooks,
    fetchIssuedBooks,
    fetchBookAvailability
} from '../controllers/reportController.js';

const router = express.Router();

router.get('/overdue', fetchOverdueBooks);
router.get('/issued', fetchIssuedBooks);
router.get('/books', fetchBookAvailability);

export default router;