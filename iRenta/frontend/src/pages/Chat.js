import React, { useState, useEffect } from 'react';
import { account } from '../config/appwriteConfig.js';
import UserList from '../components/UserList.js';
import ChatComponent from '../components/Chat.js';

const Chat = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await account.get(); // Fetch logged-in user
      setCurrentUser(response);

      const usersResponse = await account.list(); // Fetch all users
      setUsers(usersResponse.documents);
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <UserList users={users} onSelectUser={setSelectedUser} />
      {selectedUser && (
        <ChatComponent selectedUser={selectedUser} currentUser={currentUser} />
      )}
    </div>
  );
};

export default Chat;
