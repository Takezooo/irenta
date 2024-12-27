import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import connectDB from './global/config/DB.js';
import http from "http";
import socketIO from './global/config/SocketIO.js';

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app); // Create the HTTP server

// Middleware
app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
})); 

// Import routes
import userRoutes from './src/users/users.route.js';
import listingRoutes from './src/listings/listings.route.js';
import contractRoutes from './src/contracts/contracts.route.js';
import ocularRoutes from './src/ocular/ocular.route.js';
import chatRoutes from './src/chats/chat.route.js';
import mapRoutes from './src/maps/maps.routes.js'

app.use("/api/users", userRoutes);

// anything related to litings
app.use("/api/listings", listingRoutes);
app.use("/api/contracts", contractRoutes);

// anything related to interactions with owners
app.use("/api/chats", chatRoutes);
app.use('/api/ocular', ocularRoutes);

// map route
app.use("/api/map", mapRoutes);

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to iRenta API",
    });
});

// Initialize Socket.IO
const io = socketIO(server);

mongoose.connection.once("open", () => {
    console.log("Database connected.");

    server.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
});
