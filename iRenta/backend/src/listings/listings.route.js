import express from 'express';
import {
    GetAllListings,
    CreateListing,
    UpdateListing,
    DeleteListing,
    DisplayListings,
    GetListingById
} from './listings.controller.js';
import authenticate from '../../global/middlewares/RequireAuth.js';

const router = express.Router();

// Route to display the listing
router.get("/", DisplayListings);

router.get("/user", authenticate, GetAllListings);

// Route to fetch a specific list
router.delete('/:id', GetListingById);

// Route to create a listing (only for owners)
router.post('/', authenticate, CreateListing);

// Route to update a listing (only for owners)
router.put('/:id', authenticate, UpdateListing);

// Route to delete a listing (only for owners)
router.delete('/:id', authenticate, DeleteListing);



export default router;
