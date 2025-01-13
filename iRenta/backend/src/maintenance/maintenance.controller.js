import Maintenance from './maintenance.model.js';

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
      .populate('tenantId');
    
    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching maintenance requests:", error);
    res.status(500).json({ message: "Error fetching maintenance requests" });
  }
};

export const getLandlordMaintenanceRequests = async (req, res) => {
  try {
    const { landlordId } = req.params;
    const requests = await Maintenance.find({ landlordId })
      .sort({ createdAt: -1 })
      .populate('tenantId');
    
    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching maintenance requests:", error);
    res.status(500).json({ message: "Error fetching maintenance requests" });
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
        updatedAt: new Date()
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