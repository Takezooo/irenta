import express from "express";
import {
  CreateContract,
  GetCreatedContracts,
  GetContractById,
  UpdateContract,
  GetPdf,
  SendContractToSeeker,
} from "./leases.controller.js";
import RequireAuth from "../../global/middlewares/RequireAuth.js";

const router = express.Router();

router.post("/", RequireAuth, CreateContract);
router.get("/created", RequireAuth, GetCreatedContracts);
router.get("/:id", RequireAuth, GetContractById);
router.put("/:id", RequireAuth, UpdateContract);
router.get("/:id/pdf", GetPdf);

export default router;
