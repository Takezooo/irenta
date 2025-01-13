import express from "express";
import {
  createMaintenanceRequest,
  getTenantMaintenanceRequests,
  getLandlordMaintenanceRequests,
  updateMaintenanceStatus,
} from "./maintenance.controller.js";

const router = express.Router();

router.post("/", createMaintenanceRequest); // Create a new maintenance request
router.get("/tenant/:tenantId", getTenantMaintenanceRequests); // Get maintenance requests for a tenant
router.get("/landlord/:landlordId", getLandlordMaintenanceRequests); // Get maintenance requests for a landlord
router.patch("/:id", updateMaintenanceStatus); // Update the status of a maintenance request

export default router;
