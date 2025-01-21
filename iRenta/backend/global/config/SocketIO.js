import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Chat from "../../src/chats/chat.model.js";
const socketIO = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "https://irenta-9hgap1xxb-takezooos-projects.vercel.app", // Allow all origins
      methods: ["GET", "POST"],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token; // Get the token from handshake auth
    if (!token) return next(new Error("Authentication error"));

    try {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = user; // Attach the user to the socket object
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.user);

    // Notification subscription
    socket.on("subscribeToNotifications", (userId) => {
      if (!userId) {
        console.error("Invalid userId for subscription.");
        return;
      }
      socket.join(userId);
      console.log(`User subscribed to notifications room: ${userId}`);
    });

    // **Join a Room**
    socket.on("joinRoom", async ({ chatId }) => {
      try {
        socket.join(chatId);
        console.log(`User ${socket.user.id} joined room ${chatId}`);

        // Fetch chat history from the database
        const chat = await Chat.findById(chatId).populate(
          "messages.sender",
          "username"
        ); // Populate sender username
        if (!chat) {
          console.log("Chat not found.");
          return;
        }
        // Send chat history back to the client
        socket.emit("chatHistory", chat.messages);
      } catch (error) {
        console.error("Error fetching chat history:", error.message);
      }
    });

    // **Send and Broadcast Message**
    socket.on("sendMessage", async ({ chatId, message }) => {
      try {
        const chat = await Chat.findById(chatId);

        if (!chat) {
          console.log("Chat not found.");
          return;
        }

        const newMessage = {
          sender: socket.user.id,
          content: message,
          timestamp: Date.now(),
        };

        chat.messages.push(newMessage);
        await chat.save();

        const payload = {
          senderId: socket.user.id, // Attach user ID from authentication
          message,
          timestamp: Date.now(),
        };

        io.to(chatId).emit("receiveMessage", payload);
        console.log(`Message sent to room ${chatId} by ${socket.user.id}`);
      } catch (error) {
        console.error("Error saving message:", error.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.user);
    });
  });

  return io;
};

export default socketIO;
