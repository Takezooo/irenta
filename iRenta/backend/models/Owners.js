// backend/models/Owner.js
import mongoose from 'mongoose';

const OwnersSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // Reference to User model
    },
    address: {
        houseNumber: String,
        street: String,
        city: String,
        zip: String,
        latitude: Number,
        longitude: Number,
    },
    businessPermitPath: String,  // Path to the business permit
    verificationStatus: {
        type: String,
        enum: ['Basic', 'Semi-Verified', 'Fully-Verified'],
        default: 'Basic',
    },
});

const Owners = mongoose.model('Owners', OwnersSchema);
export default Owners;
