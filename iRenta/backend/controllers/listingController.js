import Listing from '../models/Listings.js';

export const createListing = async (req, res) => {
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

export const updateListing = async (req, res) => {
  try {
    const listingId = req.params.id; // Get the listing ID from the route
    const { title, description, price } = req.body;

    // Find the listing by ID
    const listing = await Listing.findByPk(listingId);

    // Check if the listing exists
    if (!listing) {
      return res.status(404).json({ message: "Listing not found." });
    }

    // Check if the logged-in user is the owner of the listing
    if (listing.userId !== req.user.id) {
      return res.status(403).json({ message: "You can only update your own listings." });
    }

    // Update the listing
    listing.title = title || listing.title; // Only update if a new value is provided
    listing.description = description || listing.description;
    listing.price = price || listing.price;

    await listing.save(); // Save the updated listing to the database

    res.status(200).json(listing); // Return the updated listing
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export default {
    createListing,
    updateListing,
};
