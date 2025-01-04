import express from "express";
import {
  createReservation,
  uploadMiddleware,
  updateReservationStatus,
  moveToRenterList,
} from "./reservations.controller.js";
import RequireAuth from "../../global/middlewares/RequireAuth.js";

const router = express.Router();

router.post("/create", RequireAuth, uploadMiddleware, createReservation);
router.put("/update-status", RequireAuth, updateReservationStatus);
router.post("/move-to-renter", RequireAuth, moveToRenterList);

export default router;
