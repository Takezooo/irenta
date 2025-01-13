import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  rentDateId: { type: mongoose.Schema.Types.ObjectId, ref: "RentDate", required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
  toBePaid: { type: Number, required: true }, // Calculated amount that should be paid
  paidAmount: { type: Number, required: true }, // Actual amount paid
  paymentDate: { type: Date, default: Date.now },
  paymentMethod: { type: String, enum: ["Bank Transfer", "Cash"], required: true },
  referenceNumber: { type: String },
  status: { type: String, enum: ["Pending", "Confirmed"], default: "Pending" },
  remarks: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;