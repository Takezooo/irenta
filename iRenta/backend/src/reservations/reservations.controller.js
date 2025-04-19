import Reservation from "./reservations.model.js";
import Notification from "../notifications/notifications.model.js";
import User from "../users/users.model.js";
import Listing from "../listings/listings.model.js";
import multer from "multer";
import sharp from "sharp";

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const uploadMiddleware = upload.single("validIdFile");

export const createReservation = async (req, res) => {
  const { listingId, ownerId, moveInDate, shortMessage, agreedToTerms } =
    req.body;
  const seekerId = req.user.id;

  try {
    const uploadedValidId = req.file
      ? {
          data: req.file.buffer, // Save file buffer
          contentType: req.file.mimetype, // Save MIME type
        }
      : null;

    const reservation = new Reservation({
      seekerId,
      ownerId,
      listingId,
      moveInDate,
      shortMessage: shortMessage || null,
      agreedToTerms,
      uploadedValidId,
    });

    await reservation.save();
    const seeker = await User.findById(seekerId);
    const listings = await Listing.findById(listingId);
    // Notify Owner
    const notification = new Notification({
      userId: ownerId,
      type: "ReservationRequest",
      message: `You have a new reservation request for: ${listings.title} from: ${seeker.info.firstName} ${seeker.info.lastName}.`,
      propertyId: listingId,
    });
    await notification.save();

    // Emit a real-time notification via Socket.IO
    const io = req.app.get("socketio");
    if (!io) {
      console.error("Socket.IO instance not found.");
      return res
        .status(500)
        .json({ message: "Server error: Socket.IO not initialized." });
    }
    io.to(ownerId.toString()).emit("newNotification", notification);
    console.log(`Notification emitted to room: ${ownerId}`);

    res
      .status(201)
      .json({ message: "Reservation created successfully.", reservation });
  } catch (error) {
    console.error("Error creating reservation:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateReservationStatus = async (req, res) => {
  const { reservationId, status } = req.body;

  try {
    const reservation = await Reservation.findById(reservationId);

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found." });
    }

    reservation.status = status;
    await reservation.save();

    if (status === "Approved") {
      const listing = await Listing.findById(reservation.listingId);
      if (listing && listing.vacant > 0) {
        listing.vacant -= 1;
        await listing.save();
      }
    }

    // Notify Seeker
    const notification = new Notification({
      userId: reservation.seekerId,
      type: "ReservationResponse",
      message: `Your reservation request has been ${status.toLowerCase()}.`,
    });
    await notification.save();
    // Emit a real-time notification via Socket.IO
    const io = req.app.get("socketio");
    if (!io) {
      console.error("Socket.IO instance not found.");
      return res
        .status(500)
        .json({ message: "Server error: Socket.IO not initialized." });
    }

    io.to(reservation.seekerId.toString()).emit(
      "newNotification",
      notification
    );

    res.status(200).json({ message: "Reservation status updated." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReservationById = async (req, res) => {
  const { id } = req.params;

  try {
    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found." });
    }

    res.status(200).json(reservation);
  } catch (error) {
    console.error("Error fetching reservation:", error);
    res.status(500).json({ message: error.message });
  }
};

// Check if user has reservation for a property
export const CheckUserReservation = async (req, res) => {
  try {
    // Get propertyId from query params, but use the authenticated user ID
    const propertyId = req.query.propertyId;
    const userId = req.user.id; // Get the user ID from the authenticated token

    if (!propertyId) {
      return res.status(400).json({ message: 'Missing required parameter propertyId' });
    }

    // Find reservations with matching userId and propertyId
    const existingReservation = await Reservation.findOne({
      seekerId: userId,
      listingId: propertyId,
      // Optional: only check active reservations
      status: { $nin: ['Cancelled', 'Rejected'] }
    });

    return res.status(200).json({
      hasReservation: !!existingReservation,
      reservation: existingReservation
    });
  } catch (error) {
    console.error('Error checking reservation status:', error);
    return res.status(500).json({ message: 'Server error while checking reservation status' });
  }
};
