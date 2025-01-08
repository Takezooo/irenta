import Ocular from "./ocular.model.js";
import Notification from "../notifications/notifications.model.js"; // Import Notification Model
import Listings from "../listings/listings.model.js";

export const ScheduleOcular = async (req, res) => {
  const { propertyId, date, time } = req.body;
  const userId = req.user.id;

  if (!propertyId || !date || !time) {
    return res
      .status(400)
      .json({ message: "Property ID, date, and time are required." });
  }

  try {
    // Check if the date and time are already reserved
    const existing = await Ocular.findOne({ propertyId, date, time });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Date and time already reserved." });
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

    // Emit a real-time notification via Socket.IO
    const io = req.app.get("socketio");
    if (!io) {
      console.error("Socket.IO instance not found.");
      return res
        .status(500)
        .json({ message: "Server error: Socket.IO not initialized." });
    }

    io.to(ownerId.toString()).emit("newNotification", newNotification);
    console.log(`Notification emitted to room: ${ownerId}`);

    res
      .status(201)
      .json({ message: "Ocular visit scheduled successfully", ocular });
  } catch (err) {
    console.error("Error scheduling ocular visit:", err);
    res.status(500).json({ message: "Server error", error: err.message });
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
      return res
        .status(404)
        .json({ message: "No properties found for this owner." });
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
        select:
          "info.firstName info.lastName info.phoneNumber credentials.email",
      }); // Populate seeker details: name and email

    res.status(200).json(visits);
  } catch (error) {
    console.error("Error fetching reserved dates by owner:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const UpdateOcularRemarks = async (req, res) => {
  const { ocularId, action } = req.body;

  if (!ocularId || !action) {
    return res
      .status(400)
      .json({ message: "Ocular ID and action are required." });
  }

  try {
    const ocular = await Ocular.findById(ocularId);

    if (!ocular) {
      return res.status(404).json({ message: "Ocular request not found." });
    }

    // Update remarks
    ocular.remarks = action;
    await ocular.save();

    // // Notify the seeker
    // const newNotification = new Notification({
    //   userId: ocular.userId,
    //   type: "VisitResponse",
    //   message: `Your visit request for property ${
    //     ocular.name
    //   } was ${action.toLowerCase()}.`,
    //   propertyId: ocular.propertyId,
    //   viewed: false,
    // });
    // await newNotification.save();

    // // Emit a real-time notification via Socket.IO
    // const io = req.app.get("socketio");
    // if (!io) {
    //   console.error("Socket.IO instance not found.");
    //   return res
    //     .status(500)
    //     .json({ message: "Server error: Socket.IO not initialized." });
    // }

    // io.to(ocular.userId.toString()).emit("newNotification", newNotification);
    // console.log(`Notification emitted to room: ${ocular.userId}`);

    res
      .status(200)
      .json({ message: `Request ${action.toLowerCase()} successfully.` });
  } catch (error) {
    console.error("Error updating ocular remarks:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const CheckVisitRequest = async (req, res) => {
  const { propertyId, userId } = req.query;

  if (!propertyId || !userId) {
    return res
      .status(400)
      .json({ message: "Property ID and User ID are required." });
  }

  try {
    const visit = await Ocular.findOne({ propertyId, userId });

    res.status(200).json({ hasRequestedVisit: !!visit });
  } catch (err) {
    console.error("Error checking visit request:", err);
    res.status(500).json({ message: "Server error." });
  }
};
