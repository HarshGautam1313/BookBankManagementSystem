import * as bookModel from '../models/bookModel.js';

export const addBook = (req, res, next) => {
    try {
        const {
            id,
            title,
            author,
            subject,
            edition,
            publisher,
            year_of_publication,
            total_copies
        } = req.body;

        bookModel.createBook.run(
            id,
            title,
            author,
            subject,
            edition,
            publisher,
            year_of_publication,
            total_copies,
            total_copies   // available = total initially
        );

        res.json({
            success: true,
            message: 'Book added successfully'
        });

    } catch (err) {
        next(err);
    }
};

export const fetchBooks = (req, res, next) => {
    try {
        const books = bookModel.getAllBooks.all();

        res.json({
            success: true,
            books
        });

    } catch (err) {
        next(err);
    }
};

export const fetchBookById = (req, res, next) => {
    try {
        const { id } = req.params;

        const book = bookModel.getBookById.get(id);

        if (!book) {
            throw new Error('Book not found');
        }

        res.json({
            success: true,
            book
        });

    } catch (err) {
        next(err);
    }
};