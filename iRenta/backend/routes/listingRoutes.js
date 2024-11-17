import express from 'express';
import listingController from '../controllers/listingController.js';
import authenticate from '../middlewares/authenticate.js';

const listingRoutes = express.Router();

// Route to create a listing (only for owners)
listingRoutes.post('/', authenticate, listingController.createListing);

export default listingRoutes;
