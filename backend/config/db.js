import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create/Connect to the database file
const dbPath = path.resolve(__dirname, '../bookbank.db');
const db = new Database(dbPath);

console.log('Connected to the SQLite database via better-sqlite3.');

// Initialize Tables
const initDb = () => {
    const schema = `
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS books (
            book_id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            isbn TEXT UNIQUE,
            category TEXT NOT NULL,
            status TEXT DEFAULT 'available'
        );

        CREATE TABLE IF NOT EXISTS transactions (
            trans_id INTEGER PRIMARY KEY AUTOINCREMENT,
            book_id INTEGER,
            user_id INTEGER,
            issue_date TEXT NOT NULL,
            return_date TEXT,
            status TEXT NOT NULL,
            FOREIGN KEY (book_id) REFERENCES books(book_id),
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        );
    `;
    
    db.exec(schema);
    console.log('Database tables initialized.');
};

initDb();

export default db;