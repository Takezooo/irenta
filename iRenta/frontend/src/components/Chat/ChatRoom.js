import React, { useState, useEffect, useContext } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "../../global/contexts/AuthContext.js";
import { GetToken } from "../../global/utils/Token.js";

const ChatRoom = ({ chatId, userId }) => {
  const { user } = useContext(AuthContext); // Access the user context
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [otherUserName, setOtherUserName] = useState("Other User");

  const authToken = GetToken();

  useEffect(() => {
    if (!authToken || !chatId) {
      console.error("Auth token or chatId is missing. Cannot connect to Socket.IO.");
      return;
    }

    const newSocket = io("http://localhost:5000", {
      auth: { token: authToken },
    });

    newSocket.emit("joinRoom", { chatId });
    console.log(`Joining room: ${chatId}`);

    setSocket(newSocket);

    // Listen for chat history
    newSocket.on("chatHistory", (chatMessages) => {
      console.log("Chat history received:", chatMessages);
      setMessages(chatMessages);
    });

    // Listen for new messages
    newSocket.on("receiveMessage", (newMessage) => {
      console.log("Received message:", newMessage);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    // Fetch the name of the other user
    newSocket.on("otherUser", (userName) => {
      setOtherUserName(userName);
    });

    return () => newSocket.disconnect();
  }, [authToken, chatId]);

  const handleSendMessage = () => {
    if (message.trim() && socket) {
      socket.emit("sendMessage", { chatId, message });
      setMessage("");
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border border-gray-200 rounded-t-lg shadow-lg">

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.sender?._id === user.id ? "justify-end" : "justify-start"
            } mb-2`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                msg.sender?._id === user.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              {msg.content || msg.message}
            </div>
          </div>
        ))}
      </div>

      {/* Chat Input */}
      <div className="border-t p-2 flex items-center">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSendMessage}
          className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;