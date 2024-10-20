import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  credentials: {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  info: {
    firstName: { type: String, required: true },
    middleName: { type: String, required: false },
    lastName: { type: String, required: true },
    phoneNumber: { type: Number, required: true },
    profile: {
        id: { type: String },
        name: { type: String },
        link: { type: String},
      },
    userType: { type: String, enum: ["Seeker", "Owners"], required: true },
    address: {
      houseNumber: { type: String },
      street: { type: String },
      city: { type: String },
      zip: { type: String },
      latitude: { type: Number },
      longitude: { type: Number },
    },
  },
});

const User = mongoose.model("User", userSchema);

export default User;
