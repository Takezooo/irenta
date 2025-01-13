import mongoose from "mongoose";

const rentDateSchema = new mongoose.Schema({
  leaseId: { type: mongoose.Schema.Types.ObjectId, ref: "Lease", required: true },
  rentDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  endDate: { type: Date, required: true }, // End of rent period
  isPartialMonth: { type: Boolean, default: false },
  numberOfDays: { type: Number }, // For partial months
  baseAmount: { type: Number, required: true }, // Original rent amount from lease
  status: { type: String, enum: ["Upcoming", "Overdue", "Paid"], default: "Upcoming" },
  payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" }
});

const RentDate = mongoose.model("RentDate", rentDateSchema);

export default RentDate;