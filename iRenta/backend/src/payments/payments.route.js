import express from "express";
import { getPayments, addPayment, updatePaymentStatus, getLandlordPayments } from "./payments.controller.js";
import RequireAuth from "../../global/middlewares/RequireAuth.js";

const router = express.Router();

router.get("/:tenantId", getPayments); // Fetch all payments
router.post("/add", addPayment); // Add a payment
router.get("/landlord-payments/:landlordId", RequireAuth, getLandlordPayments);
router.patch("/update-status", updatePaymentStatus); // Update payment status

export default router;
