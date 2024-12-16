import React, { useState } from "react";
// import { io } from "socket.io-client";
// import { AuthContext } from "../contexts/AuthContext";

import { sendMessage } from "../../api/Chats.js";

const ChatRoom = ({ chatId }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const handleSendMessage = async () => {
    try {
      const updatedChat = await sendMessage(chatId, message);
      setMessages(updatedChat.messages); // Update messages in the state
      setMessage(""); // Clear the input field
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  return (
    <div>
      <div>
        {messages.map((msg) => (
          <p key={msg._id}>
            <strong>{msg.sender.username}:</strong> {msg.content}
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
