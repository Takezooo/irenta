import Tenant from "./tenants.model.js";
import Lease from "../leases/leases.model.js";
import User from "../users/users.model.js";
import { generateRentDates } from "../rentdates/rentdates.controller.js"; // Add this import

// POST /api/tenants/register
export const registerToWaitlist = async (req, res) => {
  const { propertyId, leaseId, landlordId } = req.body;
  const seekerId = req.user.id;

  try {
    // Add the seeker to the Tenant schema
    const tenant = new Tenant({
      seekerId,
      propertyId,
      leaseId,
      landlordId,
      isWaitListed: true,
      waitListedDate: new Date(),
    });

    await tenant.save();

    res
      .status(201)
      .json({ message: "Registered to waitlist successfully.", tenant });
  } catch (error) {
    res.status(500).json({
      message: "Failed to register to waitlist.",
      error: error.message,
    });
  }
};

// GET /api/tenants/waitlist
export const getWaitlist = async (req, res) => {
  console.log("Landlord ID:", req.user.id);

  try {
    const waitlist = await Tenant.find({
      landlordId: req.user.id,
      isWaitListed: true,
    }).populate("seekerId", "info.firstName info.lastName"); // Include specific fields

    res.status(200).json(waitlist);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch waitlist.", error: error.message });
  }
};

// GET /api/tenants/tenantlist
export const getTenantlist = async (req, res) => {
  console.log("Landlord ID:", req.user.id);

  try {
    const tenantlist = await Tenant.find({
      landlordId: req.user.id,
      isWaitListed: false,
      active: true,
    })
      .populate("seekerId", "info.firstName info.lastName info.gender")
      .populate("propertyId", "title")
      .populate(
        "leaseId",
        "contractDetails.startDate contractDetails.endDate contractDetails.paymentFrequency contractDetails.depositAmount contractDetails.customTermsAndConditions contractDetails.rentAmount"
      ); // Include specific fields
    console.log("Tenantlist:", tenantlist);

    res.status(200).json(tenantlist);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch tenantlist.", error: error.message });
  }
};

// PUT /api/tenants/move-to-tenant
export const moveToTenant = async (req, res) => {
  const { tenantId } = req.body;

  try {
    // First fetch the tenant with populated lease details
    const tenant = await Tenant.findById(tenantId).populate({
      path: 'leaseId',
      select: 'contractDetails'
    });

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found." });
    }

    // Fetch complete lease details
    const lease = await Lease.findById(tenant.leaseId._id);
    if (!lease) {
      return res.status(404).json({ message: "Lease not found." });
    }

    // Update tenant status
    tenant.isWaitListed = false;
    tenant.active = true;
    tenant.movedInDate = new Date();
    await tenant.save();

    // Generate rent dates
    try {
      await generateRentDates({
        body: {
          leaseId: lease._id,
          moveInDate: tenant.movedInDate,
          moveOutDate: lease.contractDetails.endDate,
          isFixed: lease.leaseType === 'Fixed',
          rentAmount: lease.contractDetails.rentAmount,
          paymentFrequency: lease.contractDetails.paymentFrequency
        }
      }, {
        status: () => ({ json: () => {} }),
        json: () => {}
      });
    } catch (rentError) {
      console.error("Error generating rent dates:", rentError);
      // Continue execution but log the error
    }

    // Update User schema (tenantBadge)
    const updatedUser = await User.findByIdAndUpdate(
      tenant.seekerId,
      { tenantBadge: true },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error('Failed to update user tenant badge');
    }

    // Update Lease status
    lease.status = "Active";
    await lease.save();

    res.status(200).json({ 
      message: "Moved to tenant successfully.",
      tenant,
      user: updatedUser,
      lease
    });

  } catch (error) {
    console.error("Move to tenant error:", error);
    res.status(500).json({ 
      message: "Failed to move to tenant.", 
      error: error.message 
    });
  }
};

export const getCurrentTenant = async (req, res) => {
  try {
    const seekerId = req.user.id;
    const tenant = await Tenant.findOne({ 
      seekerId,
      active: true,
      isWaitListed: false 
    })
    .populate({
      path: 'leaseId',
      select: 'contractDetails'
    })
    .populate('propertyId');

    if (!tenant) {
      return res.status(404).json({ message: "No active tenant record found" });
    }

    res.status(200).json(tenant);
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to fetch tenant details", 
      error: error.message 
    });
  }
};