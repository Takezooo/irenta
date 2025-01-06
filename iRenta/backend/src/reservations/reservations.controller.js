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

    // Notify Seeker
    const notification = new Notification({
      userId: reservation.seekerId,
      type: "ReservationResponse",
      message: `Your reservation request has been ${status.toLowerCase()}.`,
    });
    await notification.save();

    res.status(200).json({ message: "Reservation status updated." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const moveToRenterList = async (req, res) => {
  const { seekerId } = req.body;
  try {
    const user = await User.findById(seekerId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    user.renterBadge = true;
    await user.save();

    res.status(200).json({ message: "Seeker moved to renter list." });
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