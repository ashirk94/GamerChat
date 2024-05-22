import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "../css/groupchat.css";

const GroupChatPage = () => {
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState([]);
	const [socket, setSocket] = useState(null);

	useEffect(() => {
		// Initialize socket inside useEffect to ensure it's only created once
		const newSocket = io("http://localhost:4000");
		setSocket(newSocket);

		// Listen for messages from the server
		newSocket.on("chat-message", (msg) => {
			console.log("Message received from the server:", msg);
			setMessages((prevMessages) => [...prevMessages, msg]);
		});

		// Clean up the socket connection when the component unmounts
		return () => {
			newSocket.disconnect();
		};
	}, []);

	const handleChange = (e) => {
		setMessage(e.target.value);
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		if (message.trim() !== "") {
			socket.emit("chat-message", message);
			setMessages([...messages, message]);
			setMessage("");
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

export default GroupChatPage;
