import db from '../config/db.js';

/* OVERDUE BOOKS */
export const getOverdueBooks = db.prepare(`
    SELECT * FROM transactions
    WHERE status = 'issued'
    AND due_date < CURRENT_TIMESTAMP
`);

/* CURRENTLY ISSUED BOOKS */
export const getIssuedBooks = db.prepare(`
    SELECT * FROM transactions
    WHERE status = 'issued'
`);

/* BOOK AVAILABILITY */
export const getBookAvailability = db.prepare(`
    SELECT id, title, total_copies, available_copies
    FROM books
`);