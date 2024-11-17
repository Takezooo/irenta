// src/components/UserList.js
import React from 'react';

const UserList = ({ users, onSelectUser }) => (
  <div>
    <h3>Users</h3>
    <ul>
      {users.map(user => (
        <li key={user.$id} onClick={() => onSelectUser(user)}>
          {user.name}
        </li>
      ))}
    </ul>
  </div>
);

export default UserList;
