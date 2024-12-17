import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to the User model
        required: true,
      },
    ],
    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User", // Reference to the User model
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing", // Reference to the Listing model
      required: false, // Make this optional
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;