import express from 'express';
import listingController from '../controllers/listingController.js';
import authenticate from '../middlewares/authenticate.js';

const listingRoutes = express.Router();

listingRoutes.get("/", listingController.getAllListings);

// Route to create a listing (only for owners)
listingRoutes.post('/', authenticate, listingController.createListing);

// Route to update a listing (only for owners)
listingRoutes.put('/:id', authenticate, listingController.updateListing);

// Route to delete a listing (only for owners)
listingRoutes.delete('/:id', authenticate, listingController.deleteListing);


export default listingRoutes;
