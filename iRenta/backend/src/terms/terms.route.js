import express from "express";
import {
  fetchTermsTemplates,
  createTermsTemplate,
  updateTermsTemplate,
  fetchTermsById,
  attachTermsToListing,
} from "./terms.controller.js";
import RequireAuth from "../../global/middlewares/RequireAuth.js";

const router = express.Router();

// Fetch all templates
router.get("/landlord/:landlordId", fetchTermsTemplates);

// Create a new template (protected route)
router.post("/", RequireAuth, createTermsTemplate);
router.post("/attach-terms", RequireAuth, attachTermsToListing);
router.get("/:id", RequireAuth, fetchTermsById);
router.put("/:id", RequireAuth, updateTermsTemplate);

export default router;
