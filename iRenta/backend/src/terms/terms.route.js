import express from "express";
import { fetchTermsTemplates, createTermsTemplate } from "./terms.controller.js";
import RequireAuth from "../../global/middlewares/RequireAuth.js";

const router = express.Router();

// Fetch all templates
router.get("/", fetchTermsTemplates);

// Create a new template (protected route)
router.post("/", RequireAuth, createTermsTemplate);

export default router;
