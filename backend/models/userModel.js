import db from '../config/db.js';

/* FIND USER */
export const findUserById = db.prepare(`
    SELECT * FROM users WHERE id = ?
`);

/* CREATE USER */
export const createUser = db.prepare(`
    INSERT INTO users (id, password_hash, role)
    VALUES (?, ?, ?)
`);