import React, { useState, useEffect } from "react";
// import { AuthContext } from "../contexts/AuthContext";
import { fetchUserChats } from "../../api/Chat.js";

const UserList = () => {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const data = await fetchUserChats();
        setChats(data); // Update state with fetched chats
      } catch (err) {
        console.error("Failed to fetch chats", err);
      }
    };

    fetchChats();
  }, []);

  return (
    <div>
      <h2>Your Chats</h2>
      <ul>
        {chats.map((chat) => (
          <li key={chat._id}>
            Chat with{" "}
            {chat.participants.map((user) => user.username).join(", ")}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
