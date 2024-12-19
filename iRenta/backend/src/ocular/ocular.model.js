import mongoose from 'mongoose';

const ocularSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
});

const Ocular = mongoose.model('Ocular', ocularSchema);

export default Ocular;
