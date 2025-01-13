import Tenant from "./tenants.model.js";
import Lease from "../leases/leases.model.js";
import User from "../users/users.model.js";

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
    // Update Tenant schema
    const tenant = await Tenant.findByIdAndUpdate(
      tenantId,
      {
        isWaitListed: false,
        active: true,
        movedInDate: new Date(),
      },
      { new: true }
    );

    if (!tenant) return res.status(404).json({ message: "Tenant not found." });

    // Update User schema (tenantBadge)
    await User.findByIdAndUpdate(tenant.seekerId, { tenantBadge: true });

    // Update Lease schema (status to Active)
    await Lease.findByIdAndUpdate(tenant.leaseId, { status: "Active" });

    res.status(200).json({ message: "Moved to tenant successfully.", tenant });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to move to tenant.", error: error.message });
  }
};
