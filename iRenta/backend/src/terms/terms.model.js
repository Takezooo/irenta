import mongoose from "mongoose";

const TermsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true, // Title of the template (e.g., "Default Terms", "No Pets Policy")
    },
    content: {
      type: String,
      required: true, // Full text of the terms and conditions
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId, // Landlord who created the template
      ref: "User",
    },
    isDefault: {
      type: Boolean, // Indicates if this is the default template provided by the system
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Terms", TermsSchema);
