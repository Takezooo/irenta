import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  credentials: {
    username: { type: String, required: true, unique: true, trim: true }, // Trim whitespaces
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true, trim: true }, // Trim whitespaces
  },
  info: {
    firstName: { type: String, required: true, trim: true }, // Trim whitespaces
    middleName: { type: String, required: false, trim: true }, // Trim whitespaces
    lastName: { type: String, required: true, trim: true }, // Trim whitespaces
    birthDate: { type: Date, required: true },
    gender: { type: String, required: true },
    phoneNumber: { type: Number, required: true },
    profile: {
      id: { type: String },
      name: { type: String, trim: true }, // Trim whitespaces
      link: { type: String, trim: true }, // Trim whitespaces
    },
    userType: { type: String, enum: ["Seeker", "Owner"], required: true },
    address: {
      houseNumber: { type: String, trim: true }, // Trim whitespaces
      street: { type: String, trim: true }, // Trim whitespaces
      city: { type: String, trim: true }, // Trim whitespaces
      zip: { type: String, trim: true }, // Trim whitespaces
    },
  },
  conversations: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
  ],
  // listings: [{ type: Types.ObjectId, ref: 'listings' }]
});

const User = mongoose.model("User", userSchema);

export default User;
