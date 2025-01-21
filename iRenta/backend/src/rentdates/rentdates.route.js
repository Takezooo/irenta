import express from "express";
import { generateRentDates, getRentDatesByLease, updateRentDatePayment } from "./rentdates.controller.js";
import RequireAuth from "../../global/middlewares/RequireAuth.js"
const router = express.Router();

router.post("/generate", generateRentDates);
router.get("/lease/:leaseId", RequireAuth, getRentDatesByLease);
router.patch("/update-payment", updateRentDatePayment);

export default router;
