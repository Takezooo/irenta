import express from "express";
import {
  createReservation,
  updateReservationStatus,
  moveToRenterList,
} from "./reservations.controller.js";
import RequireAuth from "../../global/middlewares/RequireAuth.js";

const router = express.Router();

router.post("/", RequireAuth, createReservation);
router.put("/update-status", RequireAuth, updateReservationStatus);
router.post("/move-to-renter", RequireAuth, moveToRenterList);

export default router;
