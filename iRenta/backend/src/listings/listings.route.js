import express from 'express';
import {
    GetAllListings,
    CreateListing,
    UpdateListing,
    DeleteListing,
    DisplayListings,
    GetListingById,
    FetchReservedListings
} from './listings.controller.js';
import authenticate from '../../global/middlewares/RequireAuth.js';
import upload from '../../global/config/Multer.js'

const router = express.Router();

// Route to display the listing
router.get("/", DisplayListings);

// Route to create a listing (only for owners)
router.post('/', authenticate, upload.array("files", 10), CreateListing);

router.get("/user", authenticate, GetAllListings);

// Route to fetch reserved listings
router.get("/reserved", authenticate, FetchReservedListings);

// Route to fetch a specific list
router.get('/:id', GetListingById);

// Route to update a listing (only for owners)
router.put('/:id', authenticate, upload.array("files", 10), UpdateListing);

// Route to delete a listing (only for owners)
router.delete('/:id', authenticate, DeleteListing);

export default router;
