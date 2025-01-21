import express from "express";
import {
  registerToWaitlist,
  getCurrentTenant,
  getWaitlist,
  getTenantlist,
  moveToTenant,
} from "./tenants.controller.js";
import RequireAuth from "../../global/middlewares/RequireAuth.js";

const router = express.Router();

// Register a seeker to the waitlist
router.post("/register", RequireAuth, registerToWaitlist);
router.get('/current', RequireAuth, getCurrentTenant);
// Fetch all waitlisted seekers of the owner
router.get("/waitlist", RequireAuth, getWaitlist);

// Fetch all tenants of the owner
router.get("/tenantlist", RequireAuth, getTenantlist);

// Move a seeker from the waitlist to tenants
router.put("/move-to-tenant", RequireAuth, moveToTenant);

export default router;