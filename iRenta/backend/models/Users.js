// backend/models/User.js
import mongoose from 'mongoose';


const ownerDetailsSchema = new mongoose.Schema({
    address: {
        houseNumber: { type: String },
        street: { type: String },
        city: { type: String },
        zip: { type: String },
        latitude: { type: Number },
        longitude: { type: Number },
    },
    businessPermitPath: { type: String, required: false },
    verificationStatus: { type: String, required: false },
});

const userSchema = new mongoose.Schema({
    name: {
        firstName: { type: String, required: true },
        middleName: { type: String, required: false },
        lastName: { type: String, required: true },
    },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    imageUrl: { type: String, required: false },
    password: { type: String, required: true },
    userRole: { type: String, enum: ['Seeker', 'Owners'], required: true },
    address: {
        houseNumber: { type: String },
        street: { type: String },
        city: { type: String },
        zip: { type: String },
        latitude: { type: Number },
        longitude: { type: Number },
    },
    ownerDetails: { type: ownerDetailsSchema, required: false }, // Allow this to be optional
});

const User = mongoose.model('User', userSchema);

export default User;
