import React from "react";
import UserList from "../Chat/UserList";
import ChatRoom from "../Chat/ChatRoom";
import { useContext } from "react";
import { ChatDropdownContext } from "../../global/contexts/ChatDropdownContext";
import { FaCommentAlt } from "react-icons/fa";

const ChatDropdown = () => {
  const {
    dropdownOpen,
    setDropdownOpen,
    chatRoomOpen,
    setChatRoomOpen,
    selectedChatId,
    setSelectedChatId,
    selectedUserId,
    setSelectedUserId,
  } = useContext(ChatDropdownContext);

  const handleChatSelect = (chat) => {
    setSelectedChatId(chat._id);
    const otherUser = chat.participants.find((user) => user._id !== selectedUserId);
    setSelectedUserId(otherUser?._id || null);
    setChatRoomOpen(true); // Open the chat room
  };

  return (
    <div className="relative">
      {/* Chat Button with Icon */}
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="h-10 w-10 bg-gray-200 hover:bg-gray-300 rounded-full text-blue-500 hover:text-blue-600 flex justify-center items-center"
      >
        <FaCommentAlt className="text-lg" />
      </button>

      {/* Dropdown */}
      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-md z-50">
          <h2 className="text-lg font-bold px-4 py-2 border-b text-gray-700">Your Chats</h2>
          <div className="overflow-y-auto h-64">
            <UserList
              onSelectChat={(chat) => handleChatSelect(chat)}
              selectedChatId={selectedChatId}
            />
          </div>
        </div>
      )}

      {/* Chat Room */}
      {chatRoomOpen && selectedChatId && (
        <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-white border border-gray-200 rounded-t-lg shadow-lg z-50 flex flex-col">
          <div className="flex items-center justify-between bg-blue-500 text-white px-4 py-2 rounded-t-lg">
            <h3 className="text-lg font-bold">Chat Room</h3>
            <button
              onClick={() => setChatRoomOpen(false)}
              className="text-white hover:text-gray-200"
            >
              &times;
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ChatRoom chatId={selectedChatId} userId={selectedUserId} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatDropdown;