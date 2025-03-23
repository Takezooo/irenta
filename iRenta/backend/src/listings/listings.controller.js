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
      vacant,
    } = JSON.parse(body.data);

    // Check if the address object is present and has required fields
    if (!address || !address.houseNumber || !address.street || !address.city) {
      return res.status(400).json({
        message:
          "Address is incomplete. Ensure houseNumber, street, and city are provided.",
      });
    }

    if (amenities) {
      for (const amenity of amenities) {
        if (!amenity.name || typeof amenity.name !== "string") {
          return res
            .status(400)
            .json({ message: "Each amenity must have a name." });
        }
        if (amenity.fee === undefined || typeof amenity.fee !== "number") {
          return res
            .status(400)
            .json({ message: "Each amenity must have a valid fee." });
        }
      }
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
      vacant,
    });

    res.status(201).json(newListing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const UpdateListing = async (req, res) => {
  try {
    const listingId = req.params.id; // Get the listing ID from the route
    const { body, files } = req;
    const ID = req.user.userId;
    // Check if the logged-in user is an "owner"
    if (req.user.userType !== "Owner") {
      return res
        .status(403)
        .json({ message: "Only owners can update listings." });
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
      removedImages, // Receive removed images
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

    // Find the existing listing
    const listing = await Listing.findOne({
      _id: listingId,
      userId: req.user.id, // Ensure the user owns the listing
    });

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found or you're not authorized to update it.",
      });
    }

    // Handle image uploads (if any new images are uploaded)
    let newImages = [];

    if (files && files.length > 0) {
      for (const file of files) {
        const { id: fileId, name: fileName } = await driveService.UploadFiles(
          file,
          process.env.PROPERTY_FOLDER_ID
        );

        newImages.push({
          id: fileId,
          name: fileName,
          link: `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`,
        });
      }
    }

    // Combine existing images with new images
    const updatedImages = [...listing.images, ...newImages];

    // Update the listing with new data and images
    const updatedListing = await Listing.findOneAndUpdate(
      { _id: listingId, userId: req.user.id }, // Ensure the user owns the listing
      {
        title,
        description,
        price,
        type,
        bedroomNumber,
        bathroomNumber,
        propertySize,
        address,
        visitAvailability,
        amenities,
        images: updatedImages, // Combine existing and new images
      },
      { new: true, runValidators: true } // Return the updated document and validate updates
    );

    // Handle image deletions (if any images are to be removed)
    if (removedImages && removedImages.length > 0) {
      // Delete the removed images from storage (Google Drive)
      const deletePromises = removedImages.map((image) => {
        if (image.id) {
          return driveService.DeleteFiles(image.id).catch((err) => {
            console.error(`Failed to delete file with id ${image.id}:`, err);
          });
        }
        return Promise.resolve();
      });

      // Wait for all images to be deleted from storage
      await Promise.all(deletePromises);

      // Check for any inconsistencies between the id fields
      const removedImageIds = removedImages.map(
        (image) => image._id || image._id
      ); // Adjust based on logging

      await Listing.updateOne(
        { _id: listingId }, // Filter to match the document
        { $pull: { images: { _id: { $in: removedImageIds } } } } // Remove all objects matching the _ids
      );
    }

    res.status(200).json(updatedListing); // Return the updated listing
  } catch (err) {
    console.error("Error updating listing:", err);
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

    const seekerSelectFields =
      "info.firstName info.lastName info.email info.phoneNumber";

    // Determine the filter based on user type
    const filter =
      userType === "Seeker" ? { seekerId: userId } : { ownerId: userId };

    // Fetch reservations
    const reservations = await Reservation.find(filter)
      .populate({
        path: "listingId",
      })
      .populate({
        path: "seekerId",
        select: seekerSelectFields, // Use reusable variable
      })
      .exec();

    if (!reservations || reservations.length === 0) {
      return res.status(404).json({ message: "No reservations found." });
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