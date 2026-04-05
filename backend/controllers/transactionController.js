import db from '../config/db.js';

// 1. Issue a Book (Admin only)
export const issueBook = (req, res) => {
    try {
        const { book_id, user_id } = req.body;

        // A. Check if the book exists and is available
        const book = db.prepare('SELECT * FROM books WHERE book_id = ?').get(book_id);
        
        if (!book) {
            return res.status(404).json({ message: 'Book not found.' });
        }

        if (book.status === 'issued') {
            return res.status(400).json({ message: 'Book is already issued to someone else.' });
        }

        // B. Mark book as issued
        const updateBookStmt = db.prepare('UPDATE books SET status = ? WHERE book_id = ?');
        updateBookStmt.run('issued', book_id);

        // C. Create transaction record
        const issueDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
        const transStmt = db.prepare('INSERT INTO transactions (book_id, user_id, issue_date, status) VALUES (?, ?, ?, ?)');
        const info = transStmt.run(book_id, user_id, issueDate, 'active');

        res.status(201).json({ 
            message: 'Book issued successfully', 
            transactionId: info.lastInsertRowid 
        });
    } catch (error) {
        res.status(500).json({ message: 'Error issuing book', error: error.message });
    }
};

// 2. Return a Book (Admin only)
export const returnBook = (req, res) => {
    try {
        const { id } = req.params; // This is the transaction ID

        // A. Find the transaction and the associated book
        const transaction = db.prepare('SELECT * FROM transactions WHERE trans_id = ?').get(id);
        
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction record not found.' });
        }

        if (transaction.status === 'returned') {
            return res.status(400).json({ message: 'This book has already been returned.' });
        }

        // B. Mark book as available
        const updateBookStmt = db.prepare('UPDATE books SET status = ? WHERE book_id = ?');
        updateBookStmt.run('available', transaction.book_id);

        // C. Update transaction record
        const returnDate = new Date().toISOString().split('T')[0];
        const updateTransStmt = db.prepare('UPDATE transactions SET return_date = ?, status = ? WHERE trans_id = ?');
        updateTransStmt.run(returnDate, 'returned', id);

        res.json({ message: 'Book returned successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error returning book', error: error.message });
    }
};

// 3. Get Borrowing History for a User (Student/Admin)
export const getUserHistory = (req, res) => {
    try {
        const { userId } = req.params;

        // JOIN query to get book titles along with transaction details
        const history = db.prepare(`
            SELECT t.trans_id, b.title, t.issue_date, t.return_date, t.status 
            FROM transactions t 
            JOIN books b ON t.book_id = b.book_id 
            WHERE t.user_id = ?
        `).all(userId);

        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching history', error: error.message });
    }
};