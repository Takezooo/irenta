import Maintenance from "./maintenance.model.js";
import Tenant from "../tenants/tenants.model.js";

export const createMaintenanceRequest = async (req, res) => {
  try {
    const { title, description } = req.body;
    const tenantId = req.user.id; // Get tenant ID from authenticated user

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({
        message: "Title and description are required.",
      });
    }

    const newRequest = await Maintenance.create({
      tenantId,
      title,
      description,
    });

    // const populatedRequest = await Maintenance.findById(newRequest._id)
    // .populate('tenantId');

    res.status(201).json(newRequest);
  } catch (err) {
    console.error("Error creating maintenance request:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getTenantMaintenanceRequests = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const requests = await Maintenance.find({ tenantId })
      .sort({ createdAt: -1 })
      .populate("tenantId");

    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching maintenance requests:", error);
    res.status(500).json({ message: "Error fetching maintenance requests" });
  }
};

export const getLandlordMaintenanceRequests = async (req, res) => {
  try {
    const { landlordId } = req.params;

    // Get tenants for this landlord
    const tenants = await Tenant.find({ landlordId })
      .populate('seekerId', 'info.firstName info.lastName')
      .populate('propertyId', 'title');
      const userIds = tenants.map(tenant => tenant.seekerId._id);

      const requests = await Maintenance.find({
        tenantId: { $in: userIds }
      })
      .sort({ createdAt: -1 })
      .populate('tenantId', 'info.firstName info.lastName');
  
      // Combine the data
      const enrichedRequests = requests.map(request => {
        const tenant = tenants.find(t => t.seekerId._id.toString() === request.tenantId._id.toString());
        return {
          ...request.toObject(),
          tenantId: tenant?.seekerId,
          propertyId: tenant?.propertyId
        };
      });

    res.status(200).json(enrichedRequests);
  } catch (error) {
    console.error("Error fetching maintenance requests:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateMaintenanceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedMaintenance = await Maintenance.findByIdAndUpdate(
      id,
      {
        status,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedMaintenance) {
      return res.status(404).json({ message: "Maintenance request not found" });
    }

    res.status(200).json(updatedMaintenance);
  } catch (error) {
    console.error("Error updating maintenance status:", error);
    res.status(400).json({ message: "Error updating maintenance status" });
  }
};
