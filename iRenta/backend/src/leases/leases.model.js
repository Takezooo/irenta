import mongoose from "mongoose";

const LeaseSchema = new mongoose.Schema(
  {
    property: {
      propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Listing",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      address: {
        houseNumber: { type: String, default: "" },
        street: { type: String, default: "" },
        city: { type: String, default: "" },
        zip: { type: String, default: "" },
      },
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    tenantPlaceholder: {
      name: { type: String, default: "" },
      email: { type: String, default: "" },
      phoneNumber: { type: String, default: "" },
      emergencyContact: {
        name: { type: String, default: "" },
        phoneNumber: { type: String, default: "" },
      },
    },
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    landlordName: {
      type: String,
      required: true,
    },
    amenities: [
      {
        name: { type: String, required: true },
        amount: { type: Number, required: true, default: 0 },
        selected: { type: Boolean, default: true }
      }
    ],
    utilities: [
      {
        name: { type: String, required: true },
        amount: { type: Number, required: true, default: 0 },
        selected: { type: Boolean, default: true }
      }
    ],
    contractDetails: {
      startDate: { type: Date },
      endDate: { type: Date },
      moveInDate: { type: Date },
      moveOutDate: { type: Date },
      paymentFrequency: {
        type: String,
        enum: ["Monthly", "Quarterly", "Yearly", ""],
        default: "",
      },
      depositAmount: { type: Number, default: 0 },
      termsAndConditionsId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Terms",
        default: null, // Allow null for drafts
      },
      customTermsAndConditions: { type: String, default: "" },
      rulesAndRegulations: { type: String, default: "" },
      rentBreakdown: {
        baseRent: { type: Number, default: 0 },
        utilities: { type: Number, default: 0 },
        amenities: { type: Number, default: 0 },
        otherFees: [
          {
            name: { type: String, required: true },
            amount: { type: Number, required: true },
          },
        ],
      },
      gracePeriod: { type: Number, default: 0 },
      latePaymentPolicy: { type: String, default: "" },
      noticePeriod: { type: Number, default: 0 },
      renewalTerms: {
        type: String,
        enum: ["Automatic", "Manual", "No Renewal", ""],
        default: "",
      },
    },
    leaseType: {
      type: String,
      enum: ["Fixed-Term", "Month-to-Month"],
      default: "Fixed-Term",
    },
    status: {
      type: String,
      enum: ["Draft", "Ready", "Pending", "Sent", "Active", "Expired", "Terminated"],
      default: "Draft",
    },
    uploadedSignature: {
      data: Buffer,
      contentType: String,
    },
    uploadedOwnerSignature: {
      data: Buffer,
      contentType: String,
    },
    isSignedBySeeker: {
      type: Boolean,
      default: false,
    },
    isSignedByLandlord: {
      type: Boolean,
      default: false,
    },
    isAgreed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Lease", LeaseSchema);