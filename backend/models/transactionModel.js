import db from '../config/db.js';

/* CREATE TRANSACTION */
export const createTransaction = db.prepare(`
    INSERT INTO transactions (
        id, book_id, student_id,
        issue_date, due_date, status
    )
    VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?, 'issued')
`);

/* RETURN BOOK */
export const returnTransaction = db.prepare(`
    UPDATE transactions
    SET return_date = CURRENT_TIMESTAMP,
        status = 'returned'
    WHERE id = ?
`);

/* FIND ACTIVE TRANSACTION */
export const findTransactionById = db.prepare(`
    SELECT * FROM transactions WHERE id = ?
`);

/* DECREASE BOOK COPIES */
export const decreaseBookCopies = db.prepare(`
    UPDATE books
    SET available_copies = available_copies - 1
    WHERE id = ? AND available_copies > 0
`);

/* INCREASE BOOK COPIES */
export const increaseBookCopies = db.prepare(`
    UPDATE books
    SET available_copies = available_copies + 1
    WHERE id = ?
`);

/* GET ALL TRANSACTIONS */
export const getAllTransactions = db.prepare(`
    SELECT * FROM transactions
`);

/* GET TRANSACTION BY ID */
export const getTransactionById = db.prepare(`
    SELECT * FROM transactions WHERE id = ?
`);

/* GET TRANSACTIONS BY STUDENT */
export const getTransactionsByStudent = db.prepare(`
    SELECT * FROM transactions WHERE student_id = ?
`);