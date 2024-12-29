import Ocular from './ocular.model.js';
import Notification from "../notifications/notifications.model.js"; // Import Notification Model
import Listings from "../listings/listings.model.js"

export const ScheduleOcular = async (req, res) => {
  const { propertyId, date, time } = req.body;
  const userId = req.user.id;

  if (!propertyId || !date || !time) {
    return res.status(400).json({ message: 'Property ID, date, and time are required.' });
  }

  try {
    // Check if the date and time are already reserved
    const existing = await Ocular.findOne({ propertyId, date, time });
    if (existing) {
      return res.status(400).json({ message: 'Date and time already reserved.' });
    }

    // Schedule the visit
    const ocular = new Ocular({ propertyId, userId, date, time });
    await ocular.save();

    // Notify the property owner
    const ownerId = (await Listings.findById(propertyId)).userId;
    const newNotification = new Notification({
      userId: ownerId,
      type: "RequestVisit",
      message: `New request visit on ${date} at ${time}.`,
      propertyId,
      viewed: false,
    });
    await newNotification.save();

    res.status(201).json({ message: 'Ocular visit scheduled successfully', ocular });
  } catch (err) {
    console.error('Error scheduling ocular visit:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const GetReservedDates = async (req, res) => {
  const { propertyId } = req.params;

  // Validate propertyId
  // if (!mongoose.Types.ObjectId.isValid(propertyId)) {
  //   return res.status(400).json({ message: "Invalid property ID." });
  // }

  try {
    const visits = await Ocular.find({ propertyId });
    const reserved = visits.map((visit) => ({
      date: visit.date,
      time: visit.time,
    }));

    res.status(200).json(reserved);
  } catch (err) {
    console.error("Error fetching reserved dates:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const GetReservedDatesByOwner = async (req, res) => {
  const ownerId = req.user.id; // Assuming the user ID is available via auth middleware

  try {
    // Fetch all properties owned by the user
    const properties = await Listings.find({ userId: ownerId });

    if (!properties.length) {
      return res.status(404).json({ message: "No properties found for this owner." });
    }

    // Get all property IDs
    const propertyIds = properties.map((property) => property._id);

    // Fetch all ocular visits for these properties
    const visits = await Ocular.find({ propertyId: { $in: propertyIds } })
      .populate({
        path: "propertyId",
        select: "title address",
      }) // Populate property details: title, address, and images
      .populate({
        path: "userId",
        select: "info.firstName info.lastName info.phoneNumber credentials.email",
      }); // Populate seeker details: name and email

    res.status(200).json(visits);
  } catch (error) {
    console.error("Error fetching reserved dates by owner:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};