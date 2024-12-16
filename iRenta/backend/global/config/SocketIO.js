import { Server } from "socket.io";

const socketIO = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*", // Allow all origins
      methods: ["GET", "POST"],
    },
  });

  // Store connected users
  let users = [];

  // When a user connects
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Store the user ID and their socket ID when they join
    socket.on("joinRoom", (userId) => {
      users.push({ userId, socketId: socket.id });
      console.log(`User ${userId} joined room ${socket.id}`);
    });

    // Send a message
    socket.on("sendMessage", ({ senderId, receiverId, message }) => {
      const receiver = users.find((user) => user.userId === receiverId);
      if (receiver) {
        io.to(receiver.socketId).emit("receiveMessage", { senderId, message });
      }
    });

    // When a user disconnects
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      users = users.filter((user) => user.socketId !== socket.id);
    });
  });

  return io;
};

export default socketIO;
