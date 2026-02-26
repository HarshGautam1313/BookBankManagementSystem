import * as studentModel from '../models/studentModel.js';

export const addStudent = (req, res, next) => {
    try {
        const {
            id,
            user_id,
            name,
            branch,
            year,
            semester,
            email
        } = req.body;

        studentModel.createStudent.run(
            id,
            user_id,
            name,
            branch,
            year,
            semester,
            email
        );

        res.json({
            success: true,
            message: 'Student added successfully'
        });

    } catch (err) {
        next(err);
    }
};

export const fetchStudents = (req, res, next) => {
    try {
        const students = studentModel.getAllStudents.all();

        res.json({
            success: true,
            students
        });

    } catch (err) {
        next(err);
    }
};

export const fetchStudentById = (req, res, next) => {
    try {
        const { id } = req.params;

        const student = studentModel.getStudentById.get(id);

        if (!student) {
            throw new Error('Student not found');
        }

        res.json({
            success: true,
            student
        });

    } catch (err) {
        next(err);
    }
};