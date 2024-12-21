import express from "express";
import { CreateContract, GetCreatedContracts, GetPdf } from "./contracts.controller.js";
import RequireAuth from "../../global/middlewares/RequireAuth.js";

const router = express.Router();

router.post("/", RequireAuth, CreateContract);
router.get("/created", RequireAuth, GetCreatedContracts);
router.get("/:id/pdf", GetPdf);

export default router;
