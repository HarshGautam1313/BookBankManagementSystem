import db from '../config/db.js';
import * as transactionModel from '../models/transactionModel.js';

export const issueBook = (req, res, next) => {
    try {
        const { txnId, bookId, studentId, dueDate } = req.body;

        const issueTxn = db.transaction(() => {

            const result = transactionModel.decreaseBookCopies.run(bookId);

            if (result.changes === 0) {
                throw new Error('Book unavailable');
            }

            transactionModel.createTransaction.run(
                txnId,
                bookId,
                studentId,
                dueDate
            );
        });

        issueTxn();

        res.json({
            success: true,
            message: 'Book issued successfully'
        });

    } catch (err) {
        next(err);
    }
};

export const returnBook = (req, res, next) => {
    try {
        const { txnId } = req.body;

        const txn = transactionModel.findTransactionById.get(txnId);

        if (!txn) {
            throw new Error('Transaction not found');
        }

        if (txn.status === 'returned') {
            throw new Error('Book already returned');
        }

        const returnTxn = db.transaction(() => {

            transactionModel.returnTransaction.run(txnId);

            transactionModel.increaseBookCopies.run(txn.book_id);
        });

        returnTxn();

        res.json({
            success: true,
            message: 'Book returned successfully'
        });

    } catch (err) {
        next(err);
    }
};

export const fetchTransactions = (req, res, next) => {
    try {
        const transactions = transactionModel.getAllTransactions.all();

        res.json({
            success: true,
            transactions
        });

    } catch (err) {
        next(err);
    }
};

export const fetchTransactionById = (req, res, next) => {
    try {
        const { id } = req.params;

        const transaction = transactionModel.getTransactionById.get(id);

        if (!transaction) {
            throw new Error('Transaction not found');
        }

        res.json({
            success: true,
            transaction
        });

    } catch (err) {
        next(err);
    }
};

export const fetchTransactionsByStudent = (req, res, next) => {
    try {
        const { studentId } = req.params;

        const transactions = transactionModel.getTransactionsByStudent.all(studentId);

        res.json({
            success: true,
            transactions
        });

    } catch (err) {
        next(err);
    }
};