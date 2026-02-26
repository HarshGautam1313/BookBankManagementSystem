import express from 'express';
import {
    addStudent,
    fetchStudents,
    fetchStudentById
} from '../controllers/studentController.js';

const router = express.Router();

router.post('/', addStudent);
router.get('/', fetchStudents);
router.get('/:id', fetchStudentById);

export default router;