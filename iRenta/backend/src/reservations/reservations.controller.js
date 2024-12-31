import Reservation from "./reservations.model.js";
import Notification from "../notifications/notifications.model.js";
import User from "../users/users.model.js";

export const createReservation = async (req, res) => {
  const { listingId, ownerId } = req.body;
  const seekerId = req.user.id;

  try {
    const reservation = new Reservation({ seekerId, ownerId, listingId });
    await reservation.save();

    // Notify Owner
    const notification = new Notification({
      userId: ownerId,
      type: "ReservationRequest",
      message: `You have a new reservation request for listing ID: ${listingId}.`,
      propertyId: listingId,
    });
    await notification.save();

    res.status(201).json({ message: "Reservation request sent successfully." });
  } catch (error) {
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
