import { spawn } from 'child_process';
import db from '../config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Helper function to execute Python scripts
const runPythonScript = (scriptName, args) => {
    return new Promise((resolve, reject) => {
        const scriptPath = path.resolve(__dirname, `../ml/${scriptName}`);
        const pyProcess = spawn('python', [scriptPath, ...args]);

        let result = '';
        pyProcess.stdout.on('data', (data) => {
            result += data.toString();
        });

        pyProcess.stderr.on('data', (data) => {
            console.error(`Python Error: ${data}`);
        });

        pyProcess.on('close', (code) => {
            if (code === 0) resolve(result);
            else reject(new Error(`Python script exited with code ${code}`));
        });
    });
};

export const predictDemand = async (req, res) => {
    try {
        // 1. Get all transaction data from DB to pass to Python
        const transactions = db.prepare('SELECT * FROM transactions').all();
        
        // 2. Run Python prediction script
        const output = await runPythonScript('predict.py', [JSON.stringify(transactions)]);
        
        res.json({ 
            message: 'Demand predictions generated', 
            predictions: JSON.parse(output) 
        });
    } catch (error) {
        res.status(500).json({ message: 'Error in prediction service', error: error.message });
    }
};

export const recommendBooks = async (req, res) => {
    try {
        const { userId } = req.params;

        // 1. Get this user's borrowing history with categories
        const userHistory = db.prepare(`
            SELECT b.book_id, b.category 
            FROM transactions t 
            JOIN books b ON t.book_id = b.book_id 
            WHERE t.user_id = ?
        `).all(userId);

        // 2. Get all books in the system
        const allBooks = db.prepare('SELECT book_id, category FROM books').all();

        // 3. Run Python recommendation script
        const output = await runPythonScript('recommend.py', [
            JSON.stringify(userHistory), 
            JSON.stringify(allBooks)
        ]);

        const recommendedIds = JSON.parse(output);
        
        // 4. Fetch the full details of the recommended books to show the user
        const placeholders = recommendedIds.map(() => '?').join(',');
        const finalBooks = db.prepare(`SELECT * FROM books WHERE book_id IN (${placeholders})`).all(...recommendedIds);

        res.json({ 
            message: 'Personalized recommendations', 
            books: finalBooks 
        });
    } catch (error) {
        res.status(500).json({ message: 'Error in recommendation service', error: error.message });
    }
};