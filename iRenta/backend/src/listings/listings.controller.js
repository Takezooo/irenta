import Listing from "./listings.model.js";
import Reservation from "../reservations/reservations.model.js";
import moment from "moment"; // Use moment.js for time comparison (you can also use plain JS)
import driveService from "../../global/utils/Drive.js";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

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

export const GetListingById = async (req, res) => {
  try {
    const listingId = req.params.id; // Get the listing ID from URL params

    console.log("Fetching listing with ID:", listingId); // Debug log

    const listing = await Listing.findById(listingId);

    if (!listing) {
      console.error("Listing not found:", listingId); // Log missing ID
      return res.status(404).json({ message: "Listing not found" });
    }

    res.status(200).json(listing);
  } catch (err) {
    console.error("Error fetching listing:", err.message); // Log error
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
    const { body, files } = req;

    // Check if the logged-in user is an "owner"
    if (req.user.userType !== "Owner") {
      return res
        .status(403)
        .json({ message: "Only owners can create listings." });
    }

    // Destructure necessary fields from the request body
    const {
      title,
      description,
      price,
      type,
      bedroomNumber,
      bathroomNumber,
      visitAvailability,
      propertySize,
      address,
      amenities,
    } = JSON.parse(body.data);

    // Check if the address object is present and has required fields
    if (!address || !address.houseNumber || !address.street || !address.city) {
      return res.status(400).json({
        message:
          "Address is incomplete. Ensure houseNumber, street, and city are provided.",
      });
    }

    // Validate visitAvailability
    if (visitAvailability) {
      const { startTime, endTime } = visitAvailability;

      // Ensure both times are provided
      if (!startTime || !endTime) {
        return res.status(400).json({
          message: "Visit availability requires both startTime and endTime.",
        });
      }

      // Ensure startTime is earlier than endTime
      if (moment(startTime, "HH:mm").isSameOrAfter(moment(endTime, "HH:mm"))) {
        return res
          .status(400)
          .json({ message: "Start time must be earlier than end time." });
      }
    }

    // Handle image uploads
    let listingImages = [];

    if (files && files.length > 0) {
      for (const file of files) {
        const { id: fileId, name: fileName } = await driveService.UploadFiles(
          file,
          process.env.PROPERTY_FOLDER_ID
        );

        listingImages.push({
          id: fileId,
          name: fileName,
          link: `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`,
        });
      }
    }

    // Create the listing with the logged-in user's ID, address, and visitAvailability
    const newListing = await Listing.create({
      title,
      description,
      price,
      type,
      bedroomNumber,
      bathroomNumber,
      propertySize,
      userId: req.user.id, // Associate with the logged-in owner
      address,
      visitAvailability, // Include validated visit availability
      images: listingImages, // Associate images with the listing
      amenities,
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
      return res.status(404).json({
        message: "Listing not found or you're not authorized to update it.",
      });
    }

    res.status(200).json(updatedListing); // Return the updated listing
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const DeleteListing = async (req, res) => {
  try {
    const listingId = req.params.id;

    // Find the listing to ensure it belongs to the logged-in user
    const listing = await Listing.findOne({
      _id: listingId,
      userId: req.user.id, // Ensure the user is the owner
    });

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found or you're not authorized to delete it.",
      });
    }

    // Delete images from Google Drive (or storage service)
    const deletePromises = listing.images.map((image) => {
      if (image.id) {
        // Assuming `driveService.DeleteFiles` is a function that deletes files by ID
        return driveService.DeleteFiles(image.id);
      }
      return Promise.resolve(); // Skip files without an ID
    });

    // Wait for all images to be deleted
    await Promise.all(deletePromises);

    // Delete the listing from the database
    await listing.deleteOne();

    res
      .status(200)
      .json({ message: "Listing and associated images deleted successfully." });
  } catch (err) {
    console.error("Error deleting listing:", err);
    res.status(500).json({ message: err.message });
  }
};

export const FetchReservedListings = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.userType;

    let reservations;

    if (userType === "Seeker") {
      // Fetch reservations for the seeker
      reservations = await Reservation.find({ seekerId: userId })
        .populate({
          path: "listingId",
          select: "title images price description",
        })
        .populate({
          path: "seekerId",
          select: "firstName lastName",
        })
        .exec();
    } else if (userType === "Owner") {
      // Fetch reservations for the owner
      reservations = await Reservation.find({ ownerId: userId })
        .populate({
          path: "listingId",
          select: "title images price description",
        })
        .populate({
          path: "seekerId",
          select: "info.firstName info.lastName",
        })
        .exec();
    }

    res.status(200).json(reservations);
  } catch (error) {
    console.error("Error fetching reserved listings:", error);
    res.status(500).json({ message: "Failed to fetch reserved listings" });
  }
};

export default {
  GetAllListings,
  CreateListing,
  UpdateListing,
  DeleteListing,
  DisplayListings,
  GetListingById,
  FetchReservedListings,
};
