import mongoose from "mongoose";
//change the listing model
const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  type: { type: String, required: true },
  bedroomNumber: { type: Number },
  bathroomNumber: { type: Number },
  propertySize: { type: String, required: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference the User model
    required: true,
  },
  images: [
    {
      id: { type: String },
      name: { type: String },
      link: { type: String },
    },
  ],
  address: {
    houseNumber: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    zip: { type: String },
    lng: { type: Number },
    lat: { type: Number },
  },
  visitAvailability: {
    startTime: { type: String }, // e.g., "09:00"
    endTime: { type: String }, // e.g., "18:00"
  },
  amenities: [
    {
      name: { type: String, required: true },
      fee: { type: Number, default: 0 },
    },
  ],
  termsAndConditionsId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TermsAndConditions", // Reference to the Terms schema
    required: false,
  },
  customTermsAndConditions: {
    type: String,
    required: false,
  },
  onHold: { type: Boolean, default: false }, // set to true someone reserved
  askForValidId: {
    type: Boolean,
    default: false,
    required: false,
  },
  vacant: { type: Number, default: 0, required: true },
  createdAt: { type: Date, default: Date.now },
});

// export default mongoose.model('Listing', ListingSchema);
const Listing = mongoose.model("Listing", listingSchema);

export default Listing;
