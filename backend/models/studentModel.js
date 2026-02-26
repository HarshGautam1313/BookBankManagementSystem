import db from '../config/db.js';

/* CREATE STUDENT */
export const createStudent = db.prepare(`
    INSERT INTO students (
        id, user_id, name,
        branch, year, semester, email
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
`);

/* GET ALL STUDENTS */
export const getAllStudents = db.prepare(`
    SELECT * FROM students
`);

/* GET STUDENT BY ID */
export const getStudentById = db.prepare(`
    SELECT * FROM students WHERE id = ?
`);