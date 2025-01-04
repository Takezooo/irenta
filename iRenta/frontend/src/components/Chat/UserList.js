import React, { useState, useEffect, useContext } from "react";
import { fetchUserChats } from "../../global/api/Chats.js";
import { AuthContext } from "../../global/contexts/AuthContext.js";

const UserList = ({ onSelectChat, selectedChatId, darkMode }) => {
  const [chats, setChats] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const data = await fetchUserChats();
        setChats(data);
      } catch (err) {
        console.error("Failed to fetch chats", err);
      }
    };

    fetchChats();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <ul className="p-4 dark:bg-gray-800 dark:text-white">
      {chats.map((chat) => {
        // Filter out the current user to get the other participant
        const otherParticipant = chat.participants.find(
          (user) => user._id !== user.id
        );

        return (
          <li
            key={chat._id}
            onClick={() => onSelectChat(chat)}
            style={{
              cursor: "pointer",
              backgroundColor:
                chat._id === selectedChatId
                  ? darkMode
                    ? "#374151"
                    : "#ddd"
                  : "transparent",
              padding: "10px",
              borderRadius: "8px",
              marginBottom: "8px",
            }}
            className="hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-300"
          >
            {/* Display Other Participant's Name */}
            <div>
              <strong>
                {otherParticipant
                  ? `${otherParticipant.info.firstName} ${otherParticipant.info.lastName}`
                  : "Unknown User"}
              </strong>
            </div>

            {/* Conditionally Display Property Title */}
            {chat.listing && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Property: {chat.listing.title}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default UserList;
