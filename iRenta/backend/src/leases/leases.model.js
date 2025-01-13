import mongoose from "mongoose";

const leaseSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Not required since tenantPlaceholder can be used
    },
    tenantPlaceholder: {
      name: { type: String, required: false }, // Optional placeholder for tenant name
      email: { type: String, required: false }, // Optional placeholder for tenant email
      phoneNumber: { type: String, required: false }, // Optional placeholder for tenant phone number
    },
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    landlordName: { type: String, required: true },
    property: {
      propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Listing",
        required: true,
      },
      name: { type: String, required: true },
      address: {
        houseNumber: { type: String, required: true },
        street: { type: String, required: true },
        city: { type: String, required: true },
        zip: { type: String, required: true },
      },
    },
    contractDetails: {
      startDate: { type: Date, required: false },
      endDate: { type: Date, required: false },
      rentAmount: { type: Number, required: false },
      paymentFrequency: {
        type: String,
        enum: ["Monthly", "Quarterly", "Yearly"],
        required: true,
      },
      depositAmount: { type: Number, required: false },
      termsAndConditionsId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TermsAndConditions",
        required: false,
      },
      customTermsAndConditions: {
        type: String,
        required: false,
      },
      rulesAndRegulations: { type: String, required: false },
    },
    moveInDate: { type: Date, required: false }, // Optional field
    moveOutDate: { type: Date, required: false }, // Optional field
    leaseType: {
      type: String,
      enum: ["Month-to-Month", "Fixed-Term"],
      required: false, // Optional, default behavior can be managed in app logic
    },
    status: {
      type: String,
      enum: [
        "Draft",
        "Ready",
        "Sent",
        "Signed",
        "Declined",
        "Active",
        "Completed",
        "Terminated",
        "Renewed",
        "Modified", // if sent na tapos binago pa,
      ],
      default: "Draft",
    },
    pdfPath: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isSignedByLandlord: { type: Boolean, default: false },
    uploadedOwnerSignature: { data: Buffer, contentType: String },
    isAgreed: { type: Boolean, default: false },
    isSignedBySeeker: { type: Boolean, default: false },
    uploadedSignature: { data: Buffer, contentType: String },
    uploadedAgreementPath: { type: String },
  },
  { timestamps: true }
);

// Custom validation to ensure at least one of `tenant` or `tenantPlaceholder` is provided
leaseSchema.pre("save", function (next) {
  if (
    !this.tenant &&
    (!this.tenantPlaceholder ||
      !this.tenantPlaceholder.name ||
      !this.tenantPlaceholder.email)
  ) {
    return next(
      new Error(
        "Either tenant (User reference) or tenantPlaceholder (name and email) must be provided."
      )
    );
  }
  next();
});

const Lease = mongoose.model("Lease", leaseSchema);

export default Lease;
