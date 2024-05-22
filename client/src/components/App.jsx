import React from 'react';
import Login from '../components/Login.jsx';
import ChatPage from '../components/ChatPage.jsx';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from '../components/Register.jsx';
import GroupChatPage from '../components/GroupChatPage.jsx';


function App() {
  // Check if the URL path matches '/chat'
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/groupchat" element={<GroupChatPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
