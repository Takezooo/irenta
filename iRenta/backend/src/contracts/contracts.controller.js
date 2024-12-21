import Contract from "./contracts.model.js";
import generatePdf from "../../global/utils/PdfGenerator.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const CreateContract = async (req, res) => {
    try {
      const { property, contractDetails, landlordName } = req.body;
  
      // Validation
      if (!landlordName) {
        return res.status(400).json({ message: "Landlord name is required" });
      }
  
      if (!property?.name || !property?.address?.street) {
        return res
          .status(400)
          .json({ message: "Property details are incomplete" });
      }
      if (!contractDetails?.startDate || !contractDetails?.rentAmount) {
        return res
          .status(400)
          .json({ message: "Contract details are incomplete" });
      }
  
      // Create Contract
      const contract = await Contract.create(req.body);
  
      res.status(201).json(contract);
    } catch (error) {
      console.error("Error creating contract:", error);
      res.status(500).json({ message: "Failed to create contract" });
    }
  };

export const GetCreatedContracts = async (req, res) => {
  try {
    const ownerId = req.user.id; // Get the owner's ID from the decoded token
    const contracts = await Contract.find({ landlord: ownerId })
      .populate("tenant") // Populate tenant details if needed
      .populate("landlord"); // Populate landlord details if needed

    res.status(200).json(contracts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const GetPdf = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Find the contract by ID
      const contract = await Contract.findById(id);
  
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
  
      // Generate PDF dynamically and stream it
      const pdfStream = await generatePdf(contract);
  
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${contract.property.name}_contract.pdf"`
      );
      res.setHeader("Content-Type", "application/pdf");
  
      pdfStream.pipe(res);
      pdfStream.end();
    } catch (error) {
      console.error("Error in GetPdf:", error);
      res.status(500).json({ message: error.message });
    }
  };
