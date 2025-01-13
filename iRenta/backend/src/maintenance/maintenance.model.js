import mongoose from "mongoose";

const maintenanceRequestSchema = new mongoose.Schema({
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
    description: { type: String, required: true },
    images: [String], // URLs to uploaded images
    status: { type: String, enum: ["Pending", "In Progress", "Completed"], default: "Pending" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  });
  
  export default mongoose.model("MaintenanceRequest", maintenanceRequestSchema);
  