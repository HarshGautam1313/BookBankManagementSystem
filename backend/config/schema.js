import db from './db.js';

db.exec(`
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CHECK (role IN ('Admin', 'Student'))
);

CREATE TABLE IF NOT EXISTS books (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT,
    subject TEXT,
    edition INTEGER,
    publisher TEXT,
    year_of_publication INTEGER,
    total_copies INTEGER NOT NULL,
    available_copies INTEGER NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CHECK (available_copies <= total_copies)
);

CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE,
    name TEXT NOT NULL,
    branch TEXT,
    year INTEGER,
    semester INTEGER,
    email TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    book_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    issue_date TIMESTAMP,
    due_date TIMESTAMP,
    return_date TIMESTAMP,
    status TEXT NOT NULL,

    FOREIGN KEY (book_id) REFERENCES books(id),
    FOREIGN KEY (student_id) REFERENCES students(id),

    CHECK (status IN ('issued', 'returned', 'overdue'))
);

CREATE TABLE IF NOT EXISTS book_feedback (
    id TEXT PRIMARY KEY,
    book_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    rating INTEGER NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (book_id) REFERENCES books(id),
    FOREIGN KEY (student_id) REFERENCES students(id),

    CHECK (rating BETWEEN 1 AND 5),
    UNIQUE (book_id, student_id)
);
`);

console.log("✅ Database Schema Ready");