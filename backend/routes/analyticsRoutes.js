import express from 'express';
import { getLibraryStats } from '../controllers/analyticsController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Only Admin can access analytics
router.get('/stats', verifyToken, isAdmin, getLibraryStats);

export default router;