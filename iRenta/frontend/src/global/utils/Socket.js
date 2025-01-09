import { io } from "socket.io-client";
import { GetToken } from "./Token";

const authToken = GetToken();

const socket = io("http://localhost:5000", {
  auth: {
    token: authToken, // Attach the JWT token
  },
});

export const subscribeToNotifications = (userId) => {
  socket.emit("subscribeToNotifications", userId); // Join the room
};

socket.on("connect_error", (err) => {
  console.error("Socket connection error:", err.message);
});

export default socket;
