import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();
connectDB();

const app = express();

// Enable CORS
// const corsOptions = {
//     origin: 'http://localhost:3000', // Adjust this based on your frontend URL
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//     credentials: true,
// };
//app.use(cors(corsOptions));

app.use(express.json());
app.use(cors());

app.use("/api/users", userRoutes);
 
// app.get('/', (req, res) => {
//     res.send('API is running...');
// });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
