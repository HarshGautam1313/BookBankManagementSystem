import express from 'express';
import {
    issueBook,
    returnBook,
    fetchTransactions,
    fetchTransactionById,
    fetchTransactionsByStudent
} from '../controllers/transactionController.js';
const router = express.Router();

router.get('/', fetchTransactions);
router.get('/:id', fetchTransactionById);
router.get('/student/:studentId', fetchTransactionsByStudent);
router.post('/issue', issueBook);
router.post('/return', returnBook);

export default router;


