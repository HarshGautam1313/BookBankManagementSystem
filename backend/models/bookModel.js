import db from '../config/db.js';

/* CREATE BOOK */
export const createBook = db.prepare(`
    INSERT INTO books (
        id, title, author, subject,
        edition, publisher, year_of_publication,
        total_copies, available_copies
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

/* GET ALL BOOKS */
export const getAllBooks = db.prepare(`
    SELECT * FROM books
`);

/* GET BOOK BY ID */
export const getBookById = db.prepare(`
    SELECT * FROM books WHERE id = ?
`);