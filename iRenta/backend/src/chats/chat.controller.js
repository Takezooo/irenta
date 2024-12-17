import Chat from "./chat.model.js";

// Fetch all chats for a user
export const getChatsForUser = async (req, res) => {
  const userId = req.user.id; // Assuming user ID is extracted via auth middleware

  try {
    const chats = await Chat.find({ participants: userId })
      .populate("participants", "username email") // Populate user info
      .populate("messages.sender", "username")
      .sort({ updatedAt: -1 }); // Sort by the most recent update
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch chats", error });
  }
};

// Create a new chat or fetch an existing one
export const getOrCreateChat = async (req, res) => {
    const { recipientId } = req.body; // ID of the user you want to chat with
    const userId = req.user.id;
  
    console.log("Recipient ID:", recipientId); // Log recipientId
    console.log("User ID:", userId);           // Log userId (from auth middleware)
  
    try {
      // Check if a chat already exists between these users
      let chat = await Chat.findOne({
        participants: { $all: [userId, recipientId] },
      });
  
      // If no chat exists, create a new one
      if (!chat) {
        chat = new Chat({ participants: [userId, recipientId] });
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
