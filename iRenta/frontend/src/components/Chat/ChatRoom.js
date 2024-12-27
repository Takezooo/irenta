import React, { useState, useEffect, useContext } from "react";
import { useRef } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "../../global/contexts/AuthContext.js";
import { GetToken } from "../../global/utils/Token.js";
import { fetchUserChats } from "../../api/Chats.js";

const ChatRoom = ({ chatId, userId }) => {
  const { user } = useContext(AuthContext); // Access the user context
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [receiverName, setReceiverName] = useState(""); // Receiver's name state
  const chatContainerRef = useRef(null); // Reference for the chat container

  const authToken = GetToken();

  useEffect(() => {
    if (!authToken || !chatId) {
      console.error(
        "Auth token or chatId is missing. Cannot connect to Socket.IO."
      );
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

    // Listen for new messages
    newSocket.on("receiveMessage", (newMessage) => {
      console.log("Received message:", newMessage);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => newSocket.disconnect();
  }, [authToken, chatId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Fetch the receiver's name based on chatId
  useEffect(() => {
    const fetchChatDetails = async () => {
      try {
        const chats = await fetchUserChats(); // Fetch all user chats
        const currentChat = chats.find((chat) => chat._id === chatId); // Find the current chat by ID

        if (currentChat) {
          // Extract the other participant's name
          const otherParticipant = currentChat.participants.find(
            (participant) => participant._id !== user.id
          );

          setReceiverName(
            otherParticipant
              ? `${otherParticipant.info.firstName} ${otherParticipant.info.lastName}`
              : "Unknown User"
          );
        } else {
          setReceiverName("Unknown User");
        }
      } catch (err) {
        console.error("Failed to fetch chat details", err);
        setReceiverName("Unknown User");
      }
    };

    fetchChatDetails();
  }, [chatId, user.id]);

  const handleSendMessage = () => {
    if (message.trim() && socket) {
      socket.emit("sendMessage", { chatId, message });
      setMessage("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent newline in input
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border border-gray-200 rounded-t-lg shadow-lg">
      {/* Chat Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4"
      >
        {messages.map((msg, index) => {
          const senderId = msg.senderId || msg.sender?._id; // Handle both formats
          const isCurrentUser = senderId === user.id;
          const isPreviousMessageFromSameUser =
            index > 0 && messages[index - 1].senderId === senderId;

          return (
            <div key={index}>
              {/* Display receiver name on top of other user's messages if it's the first message in a sequence */}
              {!isCurrentUser && !isPreviousMessageFromSameUser && (
                <div className="text-sm text-gray-500 font-semibold mb-1">
                  {receiverName}
                </div>
              )}
              <div
                className={`flex ${
                  isCurrentUser ? "justify-end" : "justify-start"
                } mb-2`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                    isCurrentUser
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-black"
                  }`}
                >
                  {msg.content || msg.message}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chat Input */}
      <div className="border-t p-2 flex items-center">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
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
