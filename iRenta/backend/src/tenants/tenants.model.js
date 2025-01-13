import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema({
  seekerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
  leaseId: { type: mongoose.Schema.Types.ObjectId, ref: "Lease", required: true },
  landlordId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  isWaitListed: { type: Boolean, default: true },
  rentDueDate: { type: Date }, // Optional for rent tracking
  active: { type: Boolean, default: false },
  waitListedDate: { type: Date }, // Date when added to the waitlist
  movedInDate: { type: Date }, // Date when moved to tenant or moved in date
  remarks: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Tenant", tenantSchema);
