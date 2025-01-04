import Notification from './notifications.model.js';

export const createNotification = async (req, res) => {
  try {
    const { userId, type, message, propertyId } = req.body;

    if (!userId || !type || !message) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const newNotification = new Notification({
      userId,
      type,
      message,
      propertyId,
      viewed: false,
    });

    await newNotification.save();

    res.status(201).json({ message: 'Notification created successfully.' });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const markAsViewed = async (req, res) => {
  try {
    const { notificationId } = req.body;
    await Notification.findByIdAndUpdate(notificationId, { viewed: true });
    res.status(200).json({ message: 'Notification marked as viewed' });
  } catch (error) {
    console.error('Error marking notification as viewed:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
