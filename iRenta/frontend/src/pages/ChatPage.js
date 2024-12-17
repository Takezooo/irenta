import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import UserList from "../components/Chat/UserList.js";
import ChatRoom from "../components/Chat/ChatRoom.js";
import Topbar from "../components/global/Topbar.js";
import { Footer } from "../components/global/Footer.js";

const ChatPage = () => {
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  
  const navigate = useNavigate();

  const handleChatSelect = (chat) => {
    setSelectedChatId(chat._id);
    const otherUser = chat.participants.find((user) => user._id !== selectedUserId);
    setSelectedUserId(otherUser?._id || null);

    // Navigate to the chat room dynamically
    navigate(`/chat/${chat._id}`, { state: { userId: otherUser?._id } });
  };

  return (
    <div>
      {/* Topbar */}
      <Topbar />

      {/* Main Content */}
      <div className="mx-auto mt-20 flex flex-row gap-6 w-[90%] bg-gradient-to-r from-blue-950 to-gray-800 p-5 rounded-lg text-white overflow-hidden shadow-md">
        {/* User List Section */}
        <div className="w-[25%] bg-white rounded-lg shadow-lg overflow-hidden p-4 text-black">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Your Chats</h2>
          <div className="overflow-y-auto h-[500px]">
            <UserList
              onSelectChat={(chat) => handleChatSelect(chat)}
              selectedChatId={selectedChatId}
            />
          </div>
        </div>

        {/* Chat Room Section */}
        <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden flex flex-col p-4 text-black">
          {selectedChatId ? (
            <>
              <h2 className="text-2xl font-bold text-gray-700 mb-4">Chat Room</h2>
              <div className="flex-1 overflow-y-auto h-[500px]">
                <ChatRoom chatId={selectedChatId} userId={selectedUserId} />
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 text-lg">
              Select a chat to start messaging
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ChatPage;
