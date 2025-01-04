import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema({
  seekerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Declined"],
    default: "Pending",
  },
  contractId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Contract",
  },
  moveInDate: { type: Date, required: true },
  uploadedRequestDocu: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Reservation", reservationSchema);
