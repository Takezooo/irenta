import Listing from './listings.model.js';

export const GetAllListings = async (req, res) => {
  try {
    const ownerId = req.user.id; // Get the owner's ID from the decoded token (authenticate middleware)
    
    // Fetch only listings created by this owner
    const listings = await Listing.find({ userId: ownerId });

    res.status(200).json(listings);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const DisplayListings = async (req, res) => {
  try {
    // Fetch all listings (no authentication required)
    const listings = await Listing.find({}); // Optionally, add filters like `{ status: 'public' }` if needed
    res.status(200).json(listings);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


export const CreateListing = async (req, res) => {
  try {
    // Check if the logged-in user is an "owner"
    if (req.user.userType !== 'Owner') {
      return res.status(403).json({ message: "Only owners can create listings." });
    }

    const { title, description, price } = req.body;

    // Create the listing with the logged-in user's ID
    const newListing = await Listing.create({
      title,
      description,
      price,
      userId: req.user.id, // Associate with the logged-in owner
    });

    res.status(201).json(newListing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const UpdateListing = async (req, res) => {
  try {
    const listingId = req.params.id; // Get the listing ID from the route
    const { title, description, price } = req.body;

    // Find and update the listing
    const updatedListing = await Listing.findOneAndUpdate(
      { _id: listingId, userId: req.user.id }, // Ensure the user owns the listing
      { title, description, price }, // Fields to update
      { new: true, runValidators: true } // Return the updated document and validate updates
    );

    // Check if the listing was found and updated
    if (!updatedListing) {
      return res.status(404).json({ message: "Listing not found or you're not authorized to update it." });
    }

    res.status(200).json(updatedListing); // Return the updated listing
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const DeleteListing = async (req, res) => {
  try {
    const listingId = req.params.id;

    // Find and delete the listing if it belongs to the logged-in user
    const deletedListing = await Listing.findOneAndDelete({
      _id: listingId,
      userId: req.user.id, // Ensure the user is the owner
    });

    if (!deletedListing) {
      return res.status(404).json({ message: "Listing not found or you're not authorized to delete it." });
    }

    res.status(200).json({ message: "Listing deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export default {
  GetAllListings,
  CreateListing,
  UpdateListing,
  DeleteListing,
  DisplayListings,
};
