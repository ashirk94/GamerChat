import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import "../css/chat.css";

const ChatPage = () => {
	const { userInfo } = useSelector((state) => state.auth);
	const [message, setMessage] = useState("");
	const [recipient, setRecipient] = useState(""); // State for recipient input
	const [selectedRecipient, setSelectedRecipient] = useState(""); // State for selected recipient for viewing
	const [messages, setMessages] = useState([]);
	const [socket, setSocket] = useState(null);
	const [recipients, setRecipients] = useState([]); // State to keep track of unique recipients
	const [error, setError] = useState(null); // State to handle errors

	useEffect(() => {
		// Initialize socket inside useEffect to ensure it's only created once
		const newSocket = io("http://localhost:4000");
		setSocket(newSocket);

		// Register the user with the socket
		if (userInfo) {
			newSocket.emit("register", userInfo.displayName);
		}

		// Listen for messages from the server
		newSocket.on("chat-message", (msg) => {
			console.log("Message received from the server:", msg);
			setMessages((prevMessages) => [...prevMessages, msg]);

			// Add recipient to the recipients list if it's a new one
			if (!recipients.includes(msg.recipient) && msg.recipient !== userInfo.displayName) {
				setRecipients((prevRecipients) => [...prevRecipients, msg.recipient]);
			}
			if (!recipients.includes(msg.sender) && msg.sender !== userInfo.displayName) {
				setRecipients((prevRecipients) => [...prevRecipients, msg.sender]);
			}
		});

		// Clean up the socket connection when the component unmounts
		return () => {
			newSocket.disconnect();
		};
	}, [userInfo, recipients]);

	useEffect(() => {
		// Fetch initial messages and recipients when component mounts
		if (userInfo) {
			fetch(`/api/messages/${userInfo.displayName}`)
				.then((response) => response.json())
				.then((data) => {
					const newRecipients = new Set(recipients);
					data.forEach((msg) => {
						newRecipients.add(msg.sender);
						newRecipients.add(msg.recipient);
					});
					setRecipients([...newRecipients]);
				})
				.catch((error) => console.error("Error fetching messages:", error));
		}
	}, [userInfo]);

	useEffect(() => {
		if (selectedRecipient && userInfo) {
			// Fetch messages for the selected recipient
			fetch(`/api/messages/${userInfo.displayName}`)
				.then((response) => response.json())
				.then((data) => {
					const filteredMessages = data.filter(
						(msg) =>
							(msg.recipient === selectedRecipient && msg.sender === userInfo.displayName) ||
							(msg.sender === selectedRecipient && msg.recipient === userInfo.displayName)
					);
					setMessages(filteredMessages);

					// Mark messages as seen
					const unseenMessages = filteredMessages.filter((msg) => !msg.seen);
					if (unseenMessages.length > 0) {
						unseenMessages.forEach((msg) => (msg.seen = true));
						fetch("/api/messages/seen", {
							method: "POST",
							headers: {
								"Content-Type": "application/json"
							},
							body: JSON.stringify({
								user: userInfo.displayName,
								recipient: selectedRecipient
							})
						});
					}
					console.log("Filtered messages:", filteredMessages);
				})
				.catch((error) => console.error("Error fetching messages:", error));
		}
	}, [selectedRecipient, userInfo]);

	const handleChange = (e) => {
		setMessage(e.target.value);
	};

	const handleRecipientChange = (e) => {
		setRecipient(e.target.value);
		setError(null); // Clear any previous error
	};

	const handleSelectedRecipientChange = (e) => {
		setSelectedRecipient(e.target.value);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (message.trim() !== "" && recipient.trim() !== "" && userInfo) {
			// Check if the recipient exists
			const response = await fetch(`/api/users/${recipient}`);
			if (response.status === 404) {
				setError("Recipient not found");
				setRecipient(""); // Clear the recipient input box
				setTimeout(() => {
					setError(null); // Clear the error message after 3 seconds
				}, 3000);
				return;
			}

			const msg = { user: userInfo._id, text: message, sender: userInfo.displayName, recipient, seen: false };
			socket.emit("chat-message", msg);
			setMessage("");

			// Save message to the database
			fetch("/api/messages", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(msg)
			});

			// Add recipient to the recipients list if it's a new one
			if (!recipients.includes(recipient)) {
				setRecipients((prevRecipients) => [...prevRecipients, recipient]);
				setSelectedRecipient(recipient); // Automatically select the new recipient in the dropdown
			} else {
				setSelectedRecipient(recipient); // Automatically select the existing recipient in the dropdown
			}
		}
	};

	const handleClearChat = () => {
		setMessages([]);
	};

	const handleDeleteChat = () => {
		if (selectedRecipient && userInfo) {
			fetch("/api/messages/delete", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ displayName: userInfo.displayName, recipient: selectedRecipient })
			})
				.then((response) => response.json())
				.then((data) => {
					console.log(data.message);
					setMessages([]);
				})
				.catch((error) => console.error("Error deleting chat history:", error));
		}
	};

	return (
		<div>
			{error && <div className="error-message">{error}</div>}
			<select onChange={handleSelectedRecipientChange} value={selectedRecipient}>
				<option value="">Select Chat</option>
				{recipients.map((rec, index) => (
					<option key={index} value={rec}>
						{rec}
					</option>
				))}
			</select>
			<button onClick={handleClearChat}>Clear Chat</button>
			<button onClick={handleDeleteChat}>Delete Chat</button>
			<ul id="messages">
				{messages.map((msg, index) => (
					<li key={index}>
						<strong>{msg.sender}</strong>: {msg.text}
					</li>
				))}
			</ul>
			<div id="form-container">
				<form id="form" onSubmit={handleSubmit}>
					<input
						id="recipient"
						type="text"
						autoComplete="off"
						placeholder="Enter recipient"
						value={recipient}
						onChange={handleRecipientChange}
					/>
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
		</div>
	);
};

export default ChatPage;
