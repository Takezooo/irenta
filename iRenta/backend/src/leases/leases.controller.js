import Lease from "./leases.model.js";
import Terms from "../terms/terms.model.js";
import Users from "../users/users.model.js";  
import generatePdf from "../../global/utils/PdfGenerator.js";
import Notification from "../notifications/notifications.model.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a new lease
export const CreateLease = async (req, res) => {
  try {
    const {
      property,
      contractDetails,
      landlordName,
      tenant,
      tenantPlaceholder,
      termsTemplateId,
      action, // "saveAsDraft" or "saveAndSend"
    } = req.body;

    // Validation for "saveAndSend" only
    if (action === "saveAndSend") {
      if (!landlordName) {
        return res.status(400).json({ message: "Landlord name is required" });
      }
      if (
        !property?.name ||
        !property?.address?.houseNumber ||
        !property?.address?.street ||
        !property?.address?.city ||
        !property?.address?.zip
      ) {
        return res.status(400).json({ message: "Property details are incomplete" });
      }
      if (
        !contractDetails?.startDate ||
        !contractDetails?.endDate ||
        !contractDetails?.rentAmount ||
        !contractDetails?.depositAmount
      ) {
        return res.status(400).json({ message: "Lease details are incomplete" });
      }
    }

    // Handle terms template
    let termsContent = "";
    if (termsTemplateId) {
      const termsTemplate = await Terms.findById(termsTemplateId);
      if (!termsTemplate) {
        return res.status(404).json({ message: "Terms template not found" });
      }
      termsContent = termsTemplate.content;
    }

    const leaseData = {
      ...req.body,
      tenant: tenant || undefined,
      status: action === "saveAndSend" ? "Ready" : "Draft", // Set status based on action
    };

    const lease = await Lease.create(leaseData);

    res.status(201).json(lease);
  } catch (error) {
    console.error("Error creating lease:", error);
    res.status(500).json({ message: "Failed to create lease" });
  }
};



// Fetch all leases created by the landlord
export const GetCreatedLeases = async (req, res) => {
  try {
    const ownerId = req.user.id; // Get the landlord's ID from the decoded token
    const leases = await Lease.find({ landlord: ownerId })
      .populate("tenant") // Populate tenant details if needed
      .populate("landlord"); // Populate landlord details if needed

    res.status(200).json(leases);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Fetch a lease by its ID
export const GetLeaseById = async (req, res) => {
  try {
    const { id } = req.params; // Extract the lease ID from the URL

    const lease = await Lease.findById(id); // Fetch the lease by ID

    if (!lease) {
      return res.status(404).json({ message: "Lease not found" });
    }

    res.status(200).json(lease); // Return the lease data
  } catch (error) {
    console.error("Error fetching lease by ID:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update an existing lease
export const UpdateLease = async (req, res) => {
  try {
    const { id } = req.params; // Get the lease ID from the URL
    const updatedData = req.body; // Get the updated data from the request body

    const lease = await Lease.findByIdAndUpdate(id, updatedData, {
      new: true, // Return the updated lease
      runValidators: true, // Validate the update against the schema
    });

    if (!lease) {
      return res.status(404).json({ message: "Lease not found" });
    }

    res.status(200).json(lease);
  } catch (error) {
    console.error("Error updating lease:", error);
    res.status(500).json({ message: "Failed to update lease" });
  }
};

// Generate and stream a PDF version of the lease
export const GetPdf = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the lease by ID
    const lease = await Lease.findById(id);
    const tenant = lease.tenant ? await Users.findById(lease.tenant) : null;

    if (!lease) {
      return res.status(404).json({ message: "Lease not found" });
    }

    // Generate PDF dynamically and stream it
    const pdfStream = await generatePdf(lease, tenant);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${lease.property.name}_lease.pdf"`
    );
    res.setHeader("Content-Type", "application/pdf");

    pdfStream.pipe(res);
    pdfStream.end();
  } catch (error) {
    console.error("Error in GetPdf:", error);
    res.status(500).json({ message: error.message });
  }
};

// Send the lease to the tenant for review
export const SendLeaseToSeeker = async (req, res) => {
  try {
    const { id } = req.params;

    const lease = await Lease.findById(id);
    if (!lease) {
      return res.status(404).json({ message: "Lease not found." });
    }

    await lease.save();
    console.log("Tenant ID:", lease.tenant);
    // Notify Tenant
    const notification = new Notification({
      userId: lease.tenant._id, // Tenant's user ID
      type: "LeaseSent",
      leaseId: lease._id,
      message: "A new lease agreement has been sent to you for review.",
    });
    await notification.save();

    res.status(200).json({ message: "Lease sent to Tenant.", lease });
  } catch (error) {
    console.error("Error sending lease:", error);
    res.status(500).json({ message: "Failed to send lease." });
  }
};
