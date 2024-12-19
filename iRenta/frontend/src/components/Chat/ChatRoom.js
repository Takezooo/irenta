import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom"; // Import useParams
import { io } from "socket.io-client";
import { AuthContext } from "../../global/contexts/AuthContext.js";
import { GetToken } from "../../global/utils/Token.js";

const ChatRoom = () => {
  const { chatId } = useParams(); // Extract chatId from URL params
  const { user } = useContext(AuthContext); // Access the user context
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  const authToken = GetToken();

  useEffect(() => {
    if (!authToken) {
      console.error("Auth token is missing. Cannot connect to Socket.IO.");
      return;
    }

    const newSocket = io("http://localhost:5000", {
      auth: { token: authToken },
    });



    if (chatId) {
      newSocket.emit("joinRoom", { chatId });
      console.log(`Joining room: ${chatId}`);
    }

    setSocket(newSocket);

        // Listen for chat history
        newSocket.on("chatHistory", (chatMessages) => {
          console.log("Chat history received:", chatMessages);
          setMessages(chatMessages); // Load the chat history into state
        });

    newSocket.on("receiveMessage", (newMessage) => {
      console.log("Received message:", newMessage); // Check structure here
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => newSocket.disconnect();
  }, [authToken, chatId]);

  const handleSendMessage = () => {
    if (message.trim() && socket) {
      socket.emit("sendMessage", { chatId, message });
      setMessage("");
    }
    console.log("Current User ID:", user.id);
  };

  return (
    <div>
      <div>
        {messages.map((msg, index) => (
          <p key={index}>
            <strong>{msg.sender?._id === user.id ? "You" : "Other User"}:</strong>{" "}
            {msg.content || msg.message}
          </p>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
};

export default ChatRoom;
