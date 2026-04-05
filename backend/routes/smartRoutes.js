import express from 'express';
import { predictDemand, recommendBooks } from '../controllers/smartController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Only Admin can predict future demand
router.get('/predict', verifyToken, isAdmin, predictDemand);

// Students can get their own recommendations
router.get('/recommend/:userId', verifyToken, recommendBooks);

export default router;