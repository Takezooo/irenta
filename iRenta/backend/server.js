import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import connectDB from './global/config/DB.js';
import http from "http";
import socketIO from './global/config/SocketIO.js'; // Import the Socket.io setup
// import SocketIO from './global/config/SocketIO';

import userRoutes from './src/users/users.route.js';
import listingRoutes from './src/listings/listings.route.js';
import chatRoutes from './src/chats/chat.route.js';

dotenv.config();
connectDB();

const app = express();
// const server = SocketIO(app)

// Middleware
app.use(express.json()); 
 
app.use(
    cors({
      origin: "http://localhost:3000", // Frontend URL
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    })
);
app.use((req, res, next) => {
    // res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    // res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    // res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,PATCH");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization"
    );
    console.log(req.path, req.method);
    next();
});

app.use("/api/users", userRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/chats", chatRoutes);

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to iRenta API",
    });
});

mongoose.connection.once("open", () => {
    console.log("Database connected.");

    app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
    // server.listen(process.env.PORT, () =>
    //     console.log(`Server started on port ${process.env.PORT}`)
    // );
});