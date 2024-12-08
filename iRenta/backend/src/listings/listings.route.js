import express from 'express';
import listingController from '../controllers/listingController.js';
import authenticate from '../global/middlewares/authenticate.js';

const listingRoutes = express.Router();

listingRoutes.get("/", authenticate, listingController.getAllListings);

// Route to create a listing (only for owners)
listingRoutes.post('/', authenticate, listingController.createListing);

// Route to update a listing (only for owners)
listingRoutes.put('/:id', authenticate, listingController.updateListing);

// Route to delete a listing (only for owners)
listingRoutes.delete('/:id', authenticate, listingController.deleteListing);


export default listingRoutes;
