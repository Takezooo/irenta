// backend/models/User.js
import mongoose from 'mongoose';

// Address Schema (for owners)
const AddressSchema = new mongoose.Schema({
    houseNumber: String,
    street: String,
    city: String,
    zip: String,
    latitude: Number,
    longitude: Number,
});

// Name Schema
const NameSchema = new mongoose.Schema({
    firstName: String,
    middleName: String,
    lastName: String,
});

// Owner Details Schema (for owners)
const OwnerDetailsSchema = new mongoose.Schema({
    address: AddressSchema,  // Embedded address schema
    businessPermitPath: String,  // Path to business permit file
    verificationStatus: {
        type: String,
        enum: ['Basic', 'Semi-Verified', 'Fully-Verified'],  // Basic by default
        default: 'Basic',
    },
});

// Define the User schema
const UserSchema = new mongoose.Schema({
    name: NameSchema,  // Embedded name schema
    email: { type: String, required: true, unique: true },  // Email must be unique
    phoneNumber: String,
    imageUrl: String,
    password: { type: String, required: true },  // Password field
    userRole: {
        type: String,
        enum: ['Owner', 'Seeker'],  // Role is either Owner or Seeker
        required: true,
    },
    ownerDetails: {
        type: OwnerDetailsSchema,
        required: function() { return this.userRole === 'Owners'; },  // Only required if user is Owner
    },
});

const User = mongoose.model('User', UserSchema);
export default User;
