import express from "express";
import { getPayments, addPayment, updatePaymentStatus } from "./payments.controller.js";

const router = express.Router();

router.get("/", getPayments); // Fetch all payments
router.post("/add", addPayment); // Add a payment
router.patch("/update-status", updatePaymentStatus); // Update payment status

export default router;
