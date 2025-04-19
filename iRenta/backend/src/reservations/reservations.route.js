import express from "express";
import {
  createReservation,
  getReservationById,
  uploadMiddleware,
  updateReservationStatus,
  CheckUserReservation
} from "./reservations.controller.js";
import RequireAuth from "../../global/middlewares/RequireAuth.js";

const router = express.Router();

router.post("/create", RequireAuth, uploadMiddleware, createReservation);
router.put("/update-status", RequireAuth, updateReservationStatus);

// Specific routes must come before parameter routes to avoid conflicts
router.get("/check-user-reservation", RequireAuth, CheckUserReservation);

// Parameter routes should come last
router.get("/:id", RequireAuth, getReservationById);

export default router;
