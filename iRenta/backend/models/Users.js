import mongoose from 'mongoose';

// Define embedded schemas for Address, Name, OwnerDetails, and RenterDetails
const AddressSchema = new mongoose.Schema({
    houseNumber: String,
    street: String,
    city: String,
    zip: String,
    latitude: Number,
    longitude: Number,
});

const NameSchema = new mongoose.Schema({
    firstName: String,
    middleName: String,
    lastName: String,
});

const OwnerDetailsSchema = new mongoose.Schema({
    address: AddressSchema,  // Embedded address schema
    businessPermitPath: String,
    verificationStatus: {
        type: String,
        enum: ['Basic', 'Semi-Verified', 'Fully-Verified'],  // From the VerificationStatus in the diagram
    },
});

const RenterDetailsSchema = new mongoose.Schema({
    renters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Renter',  // Reference to the 'Renter' model (assumes a separate Renter schema)
    }],
});

// Define the main User schema
const UserSchema = new mongoose.Schema({
    name: NameSchema,  // Embedded name schema
    email: { type: String, required: true, unique: true },  // Email must be unique
    phoneNumber: String,
    imageUrl: String,
    password: { type: String, required: true }, // Add password field
    userRole: {
        type: String,
        enum: ['Owner', 'Seeker', 'Renter'],  // From the UserRole in the diagram
    },
    ownerDetails: OwnerDetailsSchema,  // Embedded ownerDetails schema
    renterDetails: RenterDetailsSchema,  // Embedded renterDetails schema
    address: AddressSchema,  // Embedded address schema
});

const User = mongoose.model('User', UserSchema);

export default User;
