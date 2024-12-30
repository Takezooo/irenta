// backend/src/ocular/ocular.router.js
import express from "express";
import {
  ScheduleOcular,
  UpdateOcularRemarks,
  CheckVisitRequest,
  GetReservedDates,
  GetReservedDatesByOwner,
} from "./ocular.controller.js";
import RequireAuth from "../../global/middlewares/RequireAuth.js";

const router = express.Router();

router.post("/schedule", RequireAuth, ScheduleOcular);
router.get("/reserved-dates/:propertyId", GetReservedDates);
router.get("/reserved-dates-by-owner", RequireAuth, GetReservedDatesByOwner);
router.post("/update-remarks", RequireAuth, UpdateOcularRemarks);
router.get("/check-visit-request", RequireAuth, CheckVisitRequest);

export default router;
