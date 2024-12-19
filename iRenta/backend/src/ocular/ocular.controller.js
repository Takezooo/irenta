import Ocular from './ocular.model.js';

export const ScheduleOcular = async (req, res) => {
  const { propertyId, date } = req.body;
  const userId = req.user.id;

  try {
    // Check if the date is already reserved
    const existing = await Ocular.findOne({ propertyId, date });
    if (existing) {
      return res.status(400).json({ message: 'Date already reserved' });
    }

    // Schedule the visit
    const ocular = new Ocular({ propertyId, userId, date });
    await ocular.save();

    res.status(201).json({ message: 'Ocular visit scheduled successfully' });
  } catch (err) {
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
      const dates = visits.map((visit) => visit.date);
      res.status(200).json(dates);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  };
  