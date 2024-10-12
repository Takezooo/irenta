import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();
connectDB();

const app = express();

// Enable CORS
const corsOptions = {
    origin: 'http://localhost:3000', // Adjust this based on your frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Use the auth routes
app.use('/api/auth', authRoutes); // Corrected route

const PORT = process.env.PORT || 5000; // Ensure a default port is set
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
