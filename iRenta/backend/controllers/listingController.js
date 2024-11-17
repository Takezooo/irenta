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

export default {
    createListing,
};
