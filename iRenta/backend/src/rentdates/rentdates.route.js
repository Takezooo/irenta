import express from "express";
import { generateRentDates, getRentDatesByLease, updateRentDatePayment } from "./rentdates.controller.js";

const router = express.Router();

router.post("/generate", generateRentDates);
router.get("/lease/:leaseId", getRentDatesByLease);
router.patch("/update-payment", updateRentDatePayment);

export default router;
