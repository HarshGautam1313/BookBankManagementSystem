import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import db from './config/db.js';
import authRoutes from './routes/authRoutes.js'; // Import auth routes
import bookRoutes from './routes/bookRoutes.js'; // Import book routes
import transactionRoutes from './routes/transactionRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import smartRoutes from './routes/smartRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes); // Mount auth routes
app.use('/api/books', bookRoutes); // Mount book routes
app.use('/api/transactions', transactionRoutes); // Mount transaction routes
app.use('/api/analytics', analyticsRoutes); // Mount analytics routes
app.use('/api/smart', smartRoutes); // Mount smart routes
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
    res.send('S-BBMS Backend is running!');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something broke on the server!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});