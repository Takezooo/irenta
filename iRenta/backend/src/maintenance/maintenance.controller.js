import Maintenance from "./maintenance.model.js";

// Create a new maintenance request
export const createMaintenanceRequest = async (req, res) => {
  try {
    const maintenance = await Maintenance.create(req.body);
    res.status(201).json(maintenance);
  } catch (error) {
    res.status(400).json({ message: "Error creating maintenance request", error });
  }
};

// Get maintenance requests by tenant
export const getTenantMaintenanceRequests = async (req, res) => {
  const { tenantId } = req.params;
  try {
    const requests = await Maintenance.find({ tenantId }).sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching maintenance requests", error });
  }
};

// Get maintenance requests by property (for landlord)
export const getLandlordMaintenanceRequests = async (req, res) => {
  const { landlordId } = req.params;
  try {
    const requests = await Maintenance.find({ landlordId }).sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching maintenance requests", error });
  }
};

// Update maintenance request status
export const updateMaintenanceStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedMaintenance = await Maintenance.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedMaintenance) {
      return res.status(404).json({ message: "Maintenance request not found" });
    }
    res.status(200).json(updatedMaintenance);
  } catch (error) {
    res.status(400).json({ message: "Error updating maintenance status", error });
  }
};
