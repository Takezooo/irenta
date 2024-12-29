import mongoose from 'mongoose';

const ocularSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: { type: Date, required: true },
  time: { type: String, required: true }, // Use `String` for time in "HH:mm" format 
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Ocular', ocularSchema);
