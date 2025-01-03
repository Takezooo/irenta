import mongoose from "mongoose";

const contractSchema = new mongoose.Schema({
  tenant: { type: String, required: true },
  landlord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  landlordName: { type: String, required: true },
  property: {
    name: { type: String, required: true },
    address: {
      houseNumber: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      zip: { type: String, required: true },
    },
  },
  contractDetails: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    rentAmount: { type: Number, required: true },
    paymentFrequency: {
      type: String,
      enum: ["Monthly", "Quarterly", "Yearly"],
      required: true,
    },
    depositAmount: { type: Number, required: true },
    termsAndConditions: { type: String, required: true },
    rulesAndRegulations: { type: String, required: false },
  },
  status: {
    type: String,
    enum: ["Pending", "Active", "Terminated", "Completed"],
    default: "Pending",
  },
  pdfPath: { type: String }, // Path to the generated PDF
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isSentToSeeker: { type: Boolean, default: false },
});

const Contract = mongoose.model("Contract", contractSchema);

export default Contract;
