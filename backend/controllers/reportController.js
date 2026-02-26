import * as reportModel from '../models/reportModel.js';

export const fetchOverdueBooks = (req, res, next) => {
    try {
        const overdue = reportModel.getOverdueBooks.all();

        res.json({
            success: true,
            overdue
        });

    } catch (err) {
        next(err);
    }
};

export const fetchIssuedBooks = (req, res, next) => {
    try {
        const issued = reportModel.getIssuedBooks.all();

        res.json({
            success: true,
            issued
        });

    } catch (err) {
        next(err);
    }
};

export const fetchBookAvailability = (req, res, next) => {
    try {
        const books = reportModel.getBookAvailability.all();

        res.json({
            success: true,
            books
        });

    } catch (err) {
        next(err);
    }
};