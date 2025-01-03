import mongoose from "mongoose";

const leaseSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Changed to ObjectId to establish a proper relationship with the User collection
    },
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
      termsAndConditionsId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TermsAndConditions", // Reference to the TermsAndConditions collection
        required: false, // Optional if the landlord provides custom terms
      },
      customTermsAndConditions: {
        type: String, // If the landlord uses custom terms, this field will be filled
        required: false,
      },
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
    isSignedBySeeker: { type: Boolean, default: false }, // Tracks if the lease is signed by the Seeker
    isSignedByLandlord: { type: Boolean, default: false }, // Tracks if the lease is signed by the Landlord
    uploadedAgreementPath: { type: String }, // For storing custom lease agreement files
  },
  { timestamps: true } // Adds createdAt and updatedAt fields automatically
);

const Lease = mongoose.model("Lease", leaseSchema);

export default Lease;
