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
    origin: "https://irenta-9hgap1xxb-takezooos-projects.vercel.app",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
})); 

// Import routes
import userRoutes from './src/users/users.route.js';
import tenantRoutes from './src/tenants/tenants.route.js';
import paymentsRoutes from './src/payments/payments.route.js';
import maintenanceRoutes from './src/maintenance/maintenance.route.js';
import rentDatesRoutes from './src/rentdates/rentdates.route.js'
import listingRoutes from './src/listings/listings.route.js';
import termRoutes from './src/terms/terms.route.js';
import leaseRoutes from './src/leases/leases.route.js';
import ocularRoutes from './src/ocular/ocular.route.js';
import reservationsRoutes from './src/reservations/reservations.route.js'
import chatRoutes from './src/chats/chat.route.js';
import notifRoutes from './src/notifications/notifications.route.js'
import mapRoutes from './src/maps/maps.routes.js'

app.use('/api/users', userRoutes);
// anything related to managing tenants
app.use('/api/tenants', tenantRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/rentdates', rentDatesRoutes);

// anything related to litings
app.use('/api/listings', listingRoutes);
app.use('/api/terms', termRoutes);
app.use('/api/leases', leaseRoutes);

// anything related to interactions with owners
app.use('/api/chats', chatRoutes);
app.use('/api/ocular', ocularRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/notifications', notifRoutes);

// map route
app.use("/api/map", mapRoutes);

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to iRenta API",
    });
});

// Initialize Socket.IO
const io = socketIO(server);
// Attach the Socket.IO instance to the app for global access
app.set("socketio", io);

mongoose.connection.once("open", () => {
    console.log("Database connected.");

    server.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
});