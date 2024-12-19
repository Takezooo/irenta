import Ocular from './ocular.model.js';

export const ScheduleOcular = async (req, res) => {
    const { propertyId, date, time } = req.body; // Added `time` to the request body
    const userId = req.user.id;
  
    if (!propertyId || !date || !time) {
      return res.status(400).json({ message: 'Property ID, date, and time are required.' });
    }
  
    try {
      // Check if the date and time are already reserved
      const existing = await Ocular.findOne({ propertyId, date, time });
      if (existing) {
        return res.status(400).json({ message: 'Date and time already reserved.' });
      }
  
      // Schedule the visit
      const ocular = new Ocular({ propertyId, userId, date, time });
      await ocular.save();
  
      res.status(201).json({ message: 'Ocular visit scheduled successfully', ocular });
    } catch (err) {
      console.error('Error scheduling ocular visit:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  };

  export const GetReservedDates = async (req, res) => {
    const { propertyId } = req.params;
  
    if (!propertyId) {
      return res.status(400).json({ message: 'Property ID is required.' });
    }
  
    try {
      const visits = await Ocular.find({ propertyId });
      const reserved = visits.map((visit) => ({
        date: visit.date,
        time: visit.time,
      }));
  
      res.status(200).json(reserved);
    } catch (err) {
      console.error('Error fetching reserved dates:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  };