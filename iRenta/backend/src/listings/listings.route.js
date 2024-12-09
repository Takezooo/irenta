import express from 'express';
import {
    GetAllListings,
    CreateListing,
    UpdateListing,
    DeleteListing
} from '../controllers/listingController.js';
import authenticate from '../global/middlewares/authenticate.js';

const router = express.Router();

router.get("/", authenticate, GetAllListings);

// Route to create a listing (only for owners)
router.post('/', authenticate, CreateListing);

// Route to update a listing (only for owners)
router.put('/:id', authenticate, UpdateListing);

// Route to delete a listing (only for owners)
router.delete('/:id', authenticate, DeleteListing);


export default router;
