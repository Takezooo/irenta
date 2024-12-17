import Chat from "./chat.model.js";

// Fetch all chats for a user
export const getChatsForUser = async (req, res) => {
  const userId = req.user.id; // The logged-in user's ID

  try {
    // Fetch chats with necessary fields populated
    const chats = await Chat.find({ participants: userId })
      .populate({
        path: "participants",
        select: "info.firstName info.lastName", // Select firstName and lastName only
      })
      .populate("listing", "title") // Populate listing details
      .populate("messages.sender", "info.firstName info.lastName")
      .sort({ updatedAt: -1 })
      .lean(); // Convert documents to plain JS objects

    // Filter out the logged-in user from participants
    const filteredChats = chats.map((chat) => {
      const otherParticipants = chat.participants.filter(
        (participant) => participant._id.toString() !== userId
      );

      return {
        ...chat,
        participants: otherParticipants,
      };
    });

    res.status(200).json(filteredChats);
  } catch (error) {
    console.error("Error fetching chats:", error.message);
    res.status(500).json({ message: "Failed to fetch chats", error });
  }
};

// Create a new chat or fetch an existing one
export const getOrCreateChat = async (req, res) => {
  const { recipientId, listingId } = req.body; // ID of the user you want to chat with
  const userId = req.user.id;

  console.log("Recipient ID:", recipientId); // Log recipientId
  console.log("User ID:", userId); // Log userId (from auth middleware)

  try {
    // Validate recipientId
    if (!recipientId) {
      return res.status(400).json({ message: "Recipient ID is required." });
    }

    // Prevent creating a chat with oneself
    if (recipientId === userId) {
      return res
        .status(400)
        .json({ message: "You cannot chat with yourself." });
    }
    // Check if a chat already exists between these users
    let chat = await Chat.findOne({
      participants: { $all: [userId, recipientId] },
    });

    // If no chat exists, create a new one
    if (!chat) {
      const newChat = {
        participants: [userId, recipientId],
      };

      // Include listingId only if it exists
      if (listingId) {
        newChat.listing = listingId;
      }
      chat = new Chat(newChat);
      await chat.save();
    }

    res.status(200).json(chat);
  } catch (error) {
    console.error("Error in getOrCreateChat:", error); // Log full error
    res.status(500).json({ message: "Failed to create or fetch chat", error });
  }
};

// Send a message in a chat
export const sendMessage = async (req, res) => {
  const { chatId, message } = req.body;
  const userId = req.user?.id; // Ensure req.user is available
  console.log("Request User:", req.user);

  if (!userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Add the new message with the correct sender
    chat.messages.push({
      sender: userId,
      content: message,
    });

    chat.updatedAt = Date.now(); // Update the chat's "updatedAt" field
    await chat.save();

    res.status(200).json(chat);
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({ message: "Failed to send message", error });
  }
};
