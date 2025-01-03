import React, { useState, useContext, useEffect } from "react";
import UserList from "../Chat/UserList";
import ChatRoom from "../Chat/ChatRoom";
import { ChatDropdownContext } from "../../global/contexts/ChatDropdownContext";
import { FaCommentAlt } from "react-icons/fa";

const ChatDropdown = ({ darkMode }) => {
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

  const [showChatRoom, setShowChatRoom] = useState(false);

  const handleChatSelect = (chat) => {
    setSelectedChatId(chat._id);
    const otherUser = chat.participants.find((user) => user._id !== selectedUserId);
    setSelectedUserId(otherUser?._id || null);
    setChatRoomOpen(true);
    setShowChatRoom(true); // Navigate to the chat room
  };

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="h-full relative">
      {/* Chat Button with Icon */}
      <div className="hidden lg:block relative group">
        <button
          onClick={() => {
            setDropdownOpen(!dropdownOpen);
            setShowChatRoom(false); // Ensure dropdown is displayed initially
          }}
          className="h-10 w-10 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 rounded-full text-blue-500 dark:text-blue-400 hover:text-blue-600 flex justify-center items-center"
        >
          <FaCommentAlt className="text-md" />
        </button>
        <h5 className="hidden group-hover:block absolute top-full left-1/2 transform -translate-x-1/2 text-nowrap mt-2 text-sm text-white bg-gray-500 dark:bg-gray-700 p-1 rounded-lg opacity-90 cursor-default">
          Messages
        </h5>
      </div>

      {/* Chat Button on Mobile */}
      <div className="lg:hidden w-full h-full group mx-auto">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className={`h-full w-full hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 ${
            dropdownOpen ? "bg-blue-100 dark:bg-blue-800 text-blue-500" : "text-gray-500 dark:text-gray-300"
          } hover:text-blue-600 flex justify-center items-center`}
        >
          <FaCommentAlt className="text-2xl" />
        </button>
        <h5 className="hidden group-hover:block absolute top-full left-1/2 transform -translate-x-1/2 text-nowrap mt-2 text-sm text-white bg-gray-500 dark:bg-gray-700 p-1 rounded-lg opacity-90 cursor-default">
          Messages
        </h5>
      </div>

      {/* Full-Screen Dropdown (Mobile and Tablet Only) */}
      {dropdownOpen && !showChatRoom && (
        <div className="fixed mt-32 inset-0 bg-gray-100 dark:bg-gray-800 mx-2 rounded-t-xl z-50 flex flex-col transition-all duration-300 lg:hidden">
          <div className="flex justify-between items-center px-4 py-2 rounded-t-xl border-b text-gray-700 dark:text-gray-300">
            <h2 className="text-lg font-bold">Your Chats</h2>
            <button
              onClick={() => setDropdownOpen(false)}
              className="text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-all"
            >
              &times;
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <UserList
              onSelectChat={(chat) => handleChatSelect(chat)}
              selectedChatId={selectedChatId}
            />
          </div>
        </div>
      )}

      {/* Full-Screen Chat Room (Mobile and Tablet Only) */}
      {dropdownOpen && showChatRoom && (
        <div className="fixed mt-32 inset-0 bg-white dark:bg-gray-800 mx-1 rounded-lg z-50 flex flex-col transition-all duration-300 lg:hidden">
          <div className="flex justify-between items-center px-4 py-2 rounded-t-xl bg-blue-500 dark:bg-blue-700 text-white">
            <h3 className="text-lg font-bold">Chat Room</h3>
            <button
              onClick={() => setShowChatRoom(false)} // Navigate back to the dropdown
              className="text-white hover:text-gray-200"
            >
              &larr;
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ChatRoom chatId={selectedChatId} userId={selectedUserId} />
          </div>
        </div>
      )}

      {/* Standard Dropdown (Desktop Only) */}
      {dropdownOpen && (
        <div
          className={`absolute right-0 top-full mt-2 w-64 md:w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-md z-50 transition-all duration-300 transform hidden lg:block ${
            dropdownOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
          }`}
        >
          <div className="flex justify-between items-center px-4 py-2 border-b text-gray-700 dark:text-gray-300">
            <h2 className="text-lg font-bold">Your Chats</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            <UserList
              onSelectChat={(chat) => handleChatSelect(chat)}
              selectedChatId={selectedChatId}
            />
          </div>
        </div>
      )}

      {/* Chat Room (Desktop Only) */}
      {chatRoomOpen && (
        <div
          className={`fixed bottom-0 right-0 w-[400px] h-[400px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-t-lg shadow-lg z-50 flex-col transition-all duration-300 transform hidden lg:flex ${
            chatRoomOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none"
          }`}
        >
          <div className="flex items-center justify-between bg-blue-500 dark:bg-blue-700 text-white px-4 py-2 rounded-t-lg">
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
