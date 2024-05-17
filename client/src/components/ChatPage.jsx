import React, { useState, useEffect } from 'react';
import {io} from 'socket.io-client'
import '../css/ChatPage.css'; // Import CSS styles for the login form


console.log("RENDERING CHATPAGE");
const socket = io('http://localhost:4000');


const ChatPage = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);


  useEffect(() => {
    
    socket.on('chat-message',  (msg) => console.log('message received from the server is:', msg))
  }, [])


  const handleChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    socket.emit('chat-message', message)

    if (message.trim() !== '') {
      setMessages([...messages, message]);
      setMessage('');
    }
  };

  return (
    <div>
      <ul id="messages">
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
      <form id="form" onSubmit={handleSubmit}>
        <input
          id="input"
          type="text"
          autoComplete="off"
          value={message}
          onChange={handleChange}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ChatPage;