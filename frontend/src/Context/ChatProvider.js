import React, { createContext, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {  
  const [selectedChat, setSelectedChat] = useState();
  const [user, setUser] = useState();
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState();

  const history = useHistory();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser(userInfo);

    if (!userInfo) history.push("/");
    
  }, [history]);

  return (
    <ChatContext.Provider
      value={{
        selectedChat, 
        setSelectedChat,
        user, //! localstorageden gelen bilgi
        setUser,
        notification,
        setNotification,
        chats,
        setChats,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {  // burda stateleri kullanmasını istediğimiz zaman import etmemiz için yazıldı yani bunu import edersen statelere müdahale edebilirsin. 
  return useContext(ChatContext); 
};

export default ChatProvider;
