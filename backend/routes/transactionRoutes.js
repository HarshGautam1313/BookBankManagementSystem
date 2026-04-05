import express from 'express';
import { issueBook, returnBook, getUserHistory } from '../controllers/transactionController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin only: Issue and Return
router.post('/issue', verifyToken, isAdmin, issueBook);
router.put('/return/:id', verifyToken, isAdmin, returnBook);

// Authenticated: View history
router.get('/user/:userId', verifyToken, getUserHistory);

export default router;