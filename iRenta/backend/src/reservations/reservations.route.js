import express from "express";
import {
  createReservation,
  getReservationById,
  uploadMiddleware,
  updateReservationStatus,
} from "./reservations.controller.js";
import RequireAuth from "../../global/middlewares/RequireAuth.js";

const router = express.Router();

router.post("/create", RequireAuth, uploadMiddleware, createReservation);
router.put("/update-status", RequireAuth, updateReservationStatus);
router.get("/:id", RequireAuth, getReservationById);

export default router;
