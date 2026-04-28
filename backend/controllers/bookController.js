import db from '../config/db.js';

// 1. Get all books (with optional search)
// 1. Get all books (with optional search and current borrower info)
export const getBooks = (req, res) => {
    try {
        const { search } = req.query;
        
        // We add a subquery (SELECT COUNT(*)...) to calculate available copies for each book
        const query = `
            SELECT 
                b.*, 
                u.full_name as current_borrower, 
                u.email as borrower_email,
                (SELECT COUNT(*) FROM books b2 WHERE b2.isbn = b.isbn AND b2.status = 'available') as available_count
            FROM books b
            LEFT JOIN transactions t ON b.book_id = t.book_id AND t.status = 'active'
            LEFT JOIN users u ON t.user_id = u.user_id
            WHERE (b.title LIKE ? OR b.category LIKE ? OR b.author LIKE ?)
        `;

        const searchTerm = `%${search || ''}%`;
        // Note: Added searchTerm three times for title, category, and author
        const books = db.prepare(query).all(searchTerm, searchTerm, searchTerm);

        res.json(books);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching books', error: error.message });
    }
};

// 2. Add a new book (Admin only)
export const addBook = (req, res) => {
    try {
        const { title, author, isbn, category } = req.body;

        const stmt = db.prepare('INSERT INTO books (title, author, isbn, category) VALUES (?, ?, ?, ?)');
        const info = stmt.run(title, author, isbn, category);

        res.status(201).json({ message: 'Book added successfully', bookId: info.lastInsertRowid });
    } catch (error) {
        res.status(400).json({ message: 'Error adding book', error: error.message });
    }
};

// 3. Update book details (Admin only)
export const updateBook = (req, res) => {
    try {
        const { id } = req.params;
        const { title, author, isbn, category, status } = req.body;

        const stmt = db.prepare('UPDATE books SET title = ?, author = ?, isbn = ?, category = ?, status = ? WHERE book_id = ?');
        const info = stmt.run(title, author, isbn, category, status, id);

        if (info.changes === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.json({ message: 'Book updated successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error updating book', error: error.message });
    }
};

// 4. Delete a book (Admin only)
export const deleteBook = (req, res) => {
    try {
        const { id } = req.params;
        const stmt = db.prepare('DELETE FROM books WHERE book_id = ?');
        const info = stmt.run(id);

        if (info.changes === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting book', error: error.message });
    }
};