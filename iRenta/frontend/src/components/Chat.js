// src/components/Chat.js
import React, { useState, useEffect } from 'react';
import { databases } from '../config/appwriteConfig.js';

const Chat = ({ selectedUser, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (selectedUser) {
      const fetchMessages = async () => {
        const response = await databases.listDocuments(
          'database-id', 
          'messages-collection-id', 
          [`equal("receiverId", "${selectedUser.$id}")`]
        );
        setMessages(response.documents);
      };
      fetchMessages();
    }
  }, [selectedUser]);

  const sendMessage = async () => {
    if (newMessage.trim() && selectedUser) {
      await databases.createDocument('database-id', 'messages-collection-id', {
        senderId: currentUser.$id,
        receiverId: selectedUser.$id,
        message: newMessage,
        timestamp: new Date().toISOString(),
      });
      setNewMessage('');
    }
  };

  return (
    <div>
      <h3>Chat with {selectedUser?.name}</h3>
      <div>
        {messages.map(msg => (
          <p key={msg.$id}>
            <strong>{msg.senderId === currentUser.$id ? 'You' : selectedUser.name}:</strong> {msg.message}
          </p>
        ))}
      </div>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type a message"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;
