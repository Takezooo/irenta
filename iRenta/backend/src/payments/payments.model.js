import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  rentDateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RentDate",
    required: true,
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  toBePaid: { type: Number, required: true }, // Calculated amount that should be paid
  paidAmount: { type: Number, required: true }, // Actual amount paid
  paymentDate: { type: Date, default: Date.now },
  paymentMethod: {
    type: String,
    enum: ["Bank Transfer", "Cash"],
    required: true,
  },
  referenceNumber: { type: String },
  status: {
    type: String,
    enum: ["Pending", "Confirmed", "Failed"],
    default: "Pending",
  },
  remarks: { type: String },
  createdAt: { type: Date, default: Date.now },
});
paymentSchema.pre('save', async function(next) {
  if (!this.tenantId) {
    next(new Error('Tenant ID is required'));
  }
  next();
});
const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
