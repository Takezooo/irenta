import express from "express";
import {
  CreateLease,
  GetCreatedLeases,
  GetLeaseById,
  UpdateLease,
  GetPdf,
  SendLeaseToSeeker,
} from "./leases.controller.js";
import RequireAuth from "../../global/middlewares/RequireAuth.js";

const router = express.Router();

router.post("/", RequireAuth, CreateLease);
router.get("/created", RequireAuth, GetCreatedLeases);
router.get("/:id", RequireAuth, GetLeaseById);
router.put("/:id", RequireAuth, UpdateLease);
router.get("/:id/pdf", GetPdf);  //Get a PDF of the lease
router.post("/:id/send-to-seeker", SendLeaseToSeeker); // Send lease to tenant

export default router;
