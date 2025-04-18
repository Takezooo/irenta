import Lease from "./leases.model.js";
import Terms from "../terms/terms.model.js";
import Users from "../users/users.model.js";
import Tenant from '../tenants/tenants.model.js';
import generatePdf from "../../global/utils/PdfGenerator.js";
import Notification from "../notifications/notifications.model.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const uploadMiddleware = upload.fields([
  { name: "uploadedSignature", maxCount: 1 }, // Seeker's signature
  { name: "uploadedOwnerSignature", maxCount: 1 }, // Owner's signature
]);

// Create a new lease
export const CreateLease = async (req, res) => {
  try {
    const {
      property,
      tenant,
      tenantPlaceholder,
      contractDetails,
      landlordName,
      action,
      termsTemplateId,
      amenities,
      utilities
    } = req.body;

    if (!req.user?.id) {
      console.error("Authentication failed: No user ID found in request");
      return res.status(401).json({ message: "User authentication required" });
    }

    let termsContent = "";
    if (termsTemplateId) {
      const termsTemplate = await Terms.findById(termsTemplateId);
      if (!termsTemplate) {
        return res.status(404).json({ message: "Terms template not found" });
      }
      termsContent = termsTemplate.content;
      req.body.contractDetails = {
        ...req.body.contractDetails,
        termsAndConditionsId: termsTemplateId,
      };
    } else {
      // Ensure termsAndConditionsId is null if no template is provided
      req.body.contractDetails = {
        ...req.body.contractDetails,
        termsAndConditionsId: null,
      };
    }

    if (action === "saveAndSend") {
      const { startDate, endDate, paymentFrequency, depositAmount, termsAndConditionsId } = contractDetails || {};
      if (!property?.propertyId || !landlordName || (!tenant && !tenantPlaceholder?.name && !tenantPlaceholder?.email && !tenantPlaceholder?.phoneNumber)) {
        return res.status(400).json({ message: "Required fields are missing for saving and sending" });
      }
      if (!startDate || !endDate || !paymentFrequency || !depositAmount || !termsAndConditionsId) {
        return res.status(400).json({ message: "Basic lease details are incomplete for sending" });
      }
      if (!property.address.zip) {
        return res.status(400).json({ message: "ZIP code is required for sending" });
      }
    } else if (action === "saveAsDraft") {
      if (!property?.propertyId || !landlordName) {
        return res.status(400).json({ message: "Property and landlord are required for drafts" });
      }
      if (!tenant && !tenantPlaceholder?.name && !tenantPlaceholder?.email && !tenantPlaceholder?.phoneNumber) {
        return res.status(400).json({ message: "Either a tenant or at least one placeholder detail is required for drafts" });
      }
    }

    // Process amenities and utilities to ensure they have the correct structure
    const processedAmenities = Array.isArray(amenities) 
      ? amenities
          .filter(amenity => amenity && (amenity.selected === undefined || amenity.selected === true))
          .map(amenity => ({
            name: amenity.name || '',
            amount: parseFloat(amenity.amount || amenity.fee || 0),
            selected: true
          }))
      : [];

    const processedUtilities = Array.isArray(utilities)
      ? utilities
          .filter(utility => utility && (utility.selected === undefined || utility.selected === true))
          .map(utility => ({
            name: utility.name || '',
            amount: parseFloat(utility.amount || utility.fee || 0),
            selected: true
          }))
      : [];

    const leaseData = {
      property: {
        ...property,
        address: {
          houseNumber: property.address?.houseNumber || "",
          street: property.address?.street || "",
          city: property.address?.city || "",
          zip: property.address?.zip || "",
        },
      },
      landlord: req.user.id,
      landlordName,
      tenant: tenant || null,
      tenantPlaceholder: tenantPlaceholder || {},
      contractDetails: {
        ...contractDetails,
        customTermsAndConditions: termsContent,
        termsAndConditionsId: termsTemplateId || null, // Explicitly set to null if not provided
        rentBreakdown: {
          ...contractDetails.rentBreakdown,
          otherFees: Array.isArray(contractDetails.rentBreakdown.otherFees)
            ? contractDetails.rentBreakdown.otherFees
            : [],
        },
      },
      status: action === "saveAsDraft" ? "Draft" : "Pending",
      amenities: processedAmenities,
      utilities: processedUtilities
    };

    const lease = new Lease(leaseData);
    await lease.save();

    return res.status(201).json({ message: "Lease created successfully", lease });
  } catch (error) {
    console.error("Error creating lease:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to create lease", error: error.message });
  }
};

export const GetCreatedLeases = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const leases = await Lease.find({ landlord: ownerId })
      .populate("tenant")
      .populate("landlord");
    res.status(200).json(leases);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const GetLeaseById = async (req, res) => {
  try {
    const { id } = req.params;

    const lease = await Lease.findById(id)
      .populate("tenant", "info.firstName info.lastName credentials.email info.phoneNumber")
      .populate("landlord", "info.firstName info.lastName credentials.email info.phoneNumber")
      .populate("contractDetails.termsAndConditionsId");

    if (!lease) {
      return res.status(404).json({ message: "Lease not found" });
    }

    res.status(200).json(lease);
  } catch (error) {
    console.error("Error fetching lease by ID:", error);
    res.status(500).json({ message: error.message });
  }
};

export const UpdateLease = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    // Handle form data conversions
    if (req.files?.uploadedSignature?.length > 0) {
      updatedData.uploadedSignature = {
        data: req.files.uploadedSignature[0].buffer,
        contentType: req.files.uploadedSignature[0].mimetype,
      };
    }

    if (req.files?.uploadedOwnerSignature?.length > 0) {
      updatedData.uploadedOwnerSignature = {
        data: req.files.uploadedOwnerSignature[0].buffer,
        contentType: req.files.uploadedOwnerSignature[0].mimetype,
      };
    }

    // Convert string value "true"/"false" to boolean
    if (updatedData.isAgreed) {
      updatedData.isAgreed = updatedData.isAgreed === "true";
    }
    
    // Handle tenant field - convert string "null" to actual null
    if (updatedData.tenant === "null" || updatedData.tenant === "" || updatedData.tenant === "undefined") {
      updatedData.tenant = null;
      // If we're removing the tenant, make sure the tenantPlaceholder is provided
      if (!updatedData.tenantPlaceholder) {
        updatedData.tenantPlaceholder = {};
      }
    }

    // Parse nested JSON objects if they are strings
    ['property', 'contractDetails', 'tenantPlaceholder'].forEach(field => {
      if (typeof updatedData[field] === 'string') {
        try {
          updatedData[field] = JSON.parse(updatedData[field]);
        } catch (error) {
          console.error(`Error parsing ${field}:`, error);
        }
      }
    });

    // Ensure amenities and utilities are properly handled
    if (updatedData.amenities) {
      try {
        // Check if amenities is a string (from FormData) and parse it
        if (typeof updatedData.amenities === 'string') {
          updatedData.amenities = JSON.parse(updatedData.amenities);
        }
        
        // Ensure each amenity has the required fields
        updatedData.amenities = updatedData.amenities
          .filter(amenity => amenity) // Filter out null/undefined values
          .map(amenity => ({
            name: amenity.name || '',
            amount: parseFloat(amenity.amount || amenity.fee || 0),
            selected: amenity.selected !== false // default to true if not specified
          }));
      } catch (error) {
        console.error("Error processing amenities:", error);
        // If parsing fails, keep the amenities as is
      }
    }

    if (updatedData.utilities) {
      try {
        // Check if utilities is a string (from FormData) and parse it
        if (typeof updatedData.utilities === 'string') {
          updatedData.utilities = JSON.parse(updatedData.utilities);
        }
        
        // Ensure each utility has the required fields
        updatedData.utilities = updatedData.utilities
          .filter(utility => utility) // Filter out null/undefined values
          .map(utility => ({
            name: utility.name || '',
            amount: parseFloat(utility.amount || utility.fee || 0),
            selected: utility.selected !== false // default to true if not specified
          }));
      } catch (error) {
        console.error("Error processing utilities:", error);
        // If parsing fails, keep the utilities as is
      }
    }

    const lease = await Lease.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!lease) {
      return res.status(404).json({ message: "Lease not found" });
    }

    if (
      lease.isSignedByLandlord &&
      lease.isSignedBySeeker &&
      lease.moveInDate
    ) {
      const today = new Date();
      const moveInDate = new Date(lease.moveInDate);

      if (today.toDateString() === moveInDate.toDateString()) {
        const tenantData = {
          seekerId: lease.tenant,
          propertyId: lease.property.propertyId,
          leaseId: lease._id,
          landlordId: lease.landlord,
          movedInDate: lease.moveInDate,
          active: true,
          isWaitListed: false,
        };

        const Tenant = mongoose.model("Tenant");
        await Tenant.create(tenantData);

        lease.status = "Active";
        await lease.save();
      }
    }

    res.status(200).json(lease);
  } catch (error) {
    console.error("Error updating lease:", error);
    res.status(500).json({ message: "Failed to update lease", error: error.message });
  }
};

// Generate and stream a PDF version of the lease
export const GetPdf = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the lease by ID
    const lease = await Lease.findById(id)
      .populate("tenant", "info.firstName info.lastName credentials.email info.phoneNumber")
      .populate("landlord", "info.firstName info.lastName credentials.email info.phoneNumber")
      .populate("contractDetails.termsAndConditionsId");

    if (!lease) {
      return res.status(404).json({ message: "Lease not found" });
    }

    // Ensure amenities and utilities arrays exist
    lease.amenities = Array.isArray(lease.amenities) ? lease.amenities : [];
    lease.utilities = Array.isArray(lease.utilities) ? lease.utilities : [];

    // Generate PDF dynamically
    let pdfStream;
    try {
      pdfStream = await generatePdf(lease, lease.tenant);
    } catch (pdfError) {
      console.error("Error generating PDF:", pdfError);
      return res.status(500).json({ 
        message: "Failed to generate PDF", 
        error: pdfError.message 
      });
    }

    // Get a cleaned property name for the filename
    const propertyName = lease.property?.name
      ? lease.property.name.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_')
      : 'property';
    const today = new Date().toISOString().split('T')[0];
    const filename = `Lease_Agreement_${propertyName}_${today}.pdf`;

    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/pdf');
    
    // Handle stream errors
    pdfStream.on('error', (err) => {
      console.error('PDF Stream Error:', err);
      // Only send error response if headers haven't been sent yet
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error generating PDF', error: err.message });
      }
    });
    
    // Stream the PDF to the client
    pdfStream.pipe(res);
    
  } catch (error) {
    console.error("Error in GetPdf:", error);
    // Only send error response if headers haven't been sent yet
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
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

    // Mark lease as sent to the tenant
    lease.status = "Sent";
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

    // Emit a real-time notification via Socket.IO
    const io = req.app.get("socketio");
    if (!io) {
      console.error("Socket.IO instance not found.");
      return res
        .status(500)
        .json({ message: "Server error: Socket.IO not initialized." });
    }

    io.to(lease.tenant._id.toString()).emit("newNotification", notification);
    console.log(`Notification emitted to room: ${lease.tenant._id}`);

    res.status(200).json({ message: "Lease sent to Tenant.", lease });
  } catch (error) {
    console.error("Error sending lease:", error);
    res.status(500).json({ message: "Failed to send lease." });
  }
};
