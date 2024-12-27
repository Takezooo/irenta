import { createContext, useState } from "react";

export const ChatDropdownContext = createContext();

export const ChatDropdownProvider = ({ children }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [chatRoomOpen, setChatRoomOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

  return (
    <ChatDropdownContext.Provider
      value={{
        dropdownOpen,
        setDropdownOpen,
        chatRoomOpen,
        setChatRoomOpen,
        selectedChatId,
        setSelectedChatId,
        selectedUserId,
        setSelectedUserId,
      }}
    >
      {children}
    </ChatDropdownContext.Provider>
  );
}