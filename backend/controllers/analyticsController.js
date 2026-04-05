import db from '../config/db.js';

export const getLibraryStats = (req, res) => {
    try {
        // 1. Overall Totals
        // Use single quotes 'issued' and 'available' for string values
        const totalBooks = db.prepare('SELECT COUNT(*) as count FROM books').get().count;
        const issuedBooks = db.prepare("SELECT COUNT(*) as count FROM books WHERE status = 'issued'").get().count;
        const availableBooks = db.prepare("SELECT COUNT(*) as count FROM books WHERE status = 'available'").get().count;

        // 2. Most Popular Books (Top 5)
        const topBooks = db.prepare(`
            SELECT b.title, COUNT(t.trans_id) as borrow_count 
            FROM books b 
            JOIN transactions t ON b.book_id = t.book_id 
            GROUP BY b.book_id 
            ORDER BY borrow_count DESC 
            LIMIT 5
        `).all();

        // 3. Most Popular Categories (Top 5)
        const topCategories = db.prepare(`
            SELECT b.category, COUNT(t.trans_id) as borrow_count 
            FROM books b 
            JOIN transactions t ON b.book_id = t.book_id 
            GROUP BY b.category 
            ORDER BY borrow_count DESC 
            LIMIT 5
        `).all();

        // 4. Recent Activity (Last 5 transactions)
        const recentActivity = db.prepare(`
            SELECT t.trans_id, b.title, u.full_name, t.issue_date, t.status 
            FROM transactions t 
            JOIN books b ON t.book_id = b.book_id 
            JOIN users u ON t.user_id = u.user_id 
            ORDER BY t.trans_id DESC 
            LIMIT 5
        `).all();

        res.json({
            summary: {
                totalBooks,
                issuedBooks,
                availableBooks,
                utilizationRate: totalBooks > 0 ? ((issuedBooks / totalBooks) * 100).toFixed(2) + '%' : '0%'
            },
            topBooks,
            topCategories,
            recentActivity
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching analytics', error: error.message });
    }
};