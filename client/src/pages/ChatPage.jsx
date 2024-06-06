import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import styles from "../css/chat.module.css";
import { FaCog } from "react-icons/fa";

const ChatPage = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const [message, setMessage] = useState("");
    const [selectedRecipient, setSelectedRecipient] = useState("");
    const [recipientInfo, setRecipientInfo] = useState(null);
    const [messages, setMessages] = useState([]);
    const [socket, setSocket] = useState(null);
    const [recipients, setRecipients] = useState([]);
    const [error, setError] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showNewRecipientModal, setShowNewRecipientModal] = useState(false);
    const [newRecipient, setNewRecipient] = useState("");
    const dropdownRef = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const newSocket = io("http://localhost:4000");
        setSocket(newSocket);

        if (userInfo) {
            newSocket.emit("register", userInfo.displayName);
        }

        newSocket.on("chat-message", (msg) => {
            console.log("Received chat-message:", msg);
            if (
                (msg.recipient === selectedRecipient && msg.sender === userInfo.displayName) ||
                (msg.sender === selectedRecipient && msg.recipient === userInfo.displayName)
            ) {
                setMessages((prevMessages) => {
                    const isDuplicate = prevMessages.some(
                        (message) =>
                            message.sender === msg.sender &&
                            message.recipient === msg.recipient &&
                            message.timestamp === msg.timestamp
                    );
                    if (isDuplicate) {
                        return prevMessages;
                    }
                    return [...prevMessages, msg];
                });
            }

            if (!recipients.includes(msg.recipient) && msg.recipient !== userInfo.displayName) {
                setRecipients((prevRecipients) => [...prevRecipients, msg.recipient]);
            }
            if (!recipients.includes(msg.sender) && msg.sender !== userInfo.displayName) {
                setRecipients((prevRecipients) => [...prevRecipients, msg.sender]);
            }
        });

        return () => {
            newSocket.disconnect();
        };
    }, [userInfo, recipients, selectedRecipient]);

    useEffect(() => {
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
            fetchMessagesForRecipient(selectedRecipient);
            fetchRecipientInfo(selectedRecipient);
        }
    }, [selectedRecipient, userInfo]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessagesForRecipient = (recipient) => {
        if (userInfo) {
            fetch(`/api/messages/${userInfo.displayName}`)
                .then((response) => response.json())
                .then((data) => {
                    const filteredMessages = data.filter(
                        (msg) =>
                            (msg.recipient === recipient && msg.sender === userInfo.displayName) ||
                            (msg.sender === recipient && msg.recipient === userInfo.displayName)
                    );
                    setMessages(filteredMessages);

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
                })
                .catch((error) => console.error("Error fetching messages:", error));
        }
    };

    const fetchRecipientInfo = (recipient) => {
        fetch(`/api/users/user/${recipient}`)
            .then((response) => response.json())
            .then((data) => {
                if (data.profilePicture) {
                    const profilePicture = `data:${data.profilePicture.contentType};base64,${btoa(
                        String.fromCharCode(...new Uint8Array(data.profilePicture.data.data))
                    )}`;
                    data.profilePicture = profilePicture;
                }
                console.log('Formatted recipient info:', data);
                setRecipientInfo(data);
            })
            .catch((error) => console.error("Error fetching recipient info:", error));
    };

    const handleChange = (e) => {
        setMessage(e.target.value);
    };

    const handleSelectedRecipientChange = (e) => {
        const value = e.target.value;
        if (value === "new-recipient") {
            setShowNewRecipientModal(true);
        } else {
            setSelectedRecipient(value);
        }
    };

    const handleNewRecipientSubmit = (e) => {
        e.preventDefault();
        setSelectedRecipient(newRecipient);
        setRecipients((prevRecipients) => [...prevRecipients, newRecipient]);
        setShowNewRecipientModal(false);
        setNewRecipient("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (message.trim() !== "" && selectedRecipient.trim() !== "" && userInfo) {
            const response = await fetch(`/api/users/user/${selectedRecipient}`);
            if (response.status === 404) {
                setError("Recipient not found");
                setSelectedRecipient("");
                setTimeout(() => {
                    setError(null);
                }, 3000);
                return;
            }

            const timestamp = new Date().toISOString();
            const msg = { user: userInfo._id, text: message, sender: userInfo.displayName, recipient: selectedRecipient, seen: false, timestamp };
            socket.emit("chat-message", msg);
            setMessage("");

            fetch("/api/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(msg)
            });

            if (!recipients.includes(selectedRecipient)) {
                setRecipients((prevRecipients) => [...prevRecipients, selectedRecipient]);
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
                    setMessages([]);
                    setRecipients((prevRecipients) => prevRecipients.filter((rec) => rec !== selectedRecipient));
                    setSelectedRecipient("");
                })
                .catch((error) => console.error("Error deleting chat history:", error));
        }
    };

    const handleCogClick = () => {
        setShowDropdown((prevState) => !prevState);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className={styles.contentContainer}>
            {error && <div className={styles.errorMessage}>{error}</div>}
            {recipientInfo && (
                <div className={styles.recipientInfo}>
                    {recipientInfo.profilePicture && (
                        <img
                            src={recipientInfo.profilePicture}
                            alt="Profile"
                            className={styles.recipientProfilePicture}
                        />
                    )}
                    <h2 className={styles.recipientName}>{recipientInfo.displayName}</h2>
                </div>
            )}
            <ul id="messages" className={styles.messages}>
                {messages.map((msg, index) => (
                    <li key={index} className={`${styles.messageContainer} ${msg.sender === userInfo.displayName ? styles.user : styles.recipient}`}>
                        <div className={`${styles.message} ${msg.sender === userInfo.displayName ? styles.user : styles.recipient}`}>
                            <strong>{msg.sender}</strong>: {msg.text}
                        </div>
                        <span className={styles.timestamp}>
                            {new Date(msg.timestamp).toLocaleDateString() === new Date().toLocaleDateString()
                                ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : new Date(msg.timestamp).toLocaleDateString()}
                        </span>
                    </li>
                ))}
                <div ref={messagesEndRef}></div>
            </ul>
            <div id="form-container" className={styles.formContainer}>
                <form id="form" onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.leftControls}>
                        <select onChange={handleSelectedRecipientChange} value={selectedRecipient} className={styles.selectChat}>
                            <option value="">Select Chat</option>
                            <option value="new-recipient">New Chat</option>
                            {recipients.map((rec, index) => (
                                <option key={index} value={rec}>
                                    {rec}
                                </option>
                            ))}
                        </select>
                        <div className={styles.dropdown} ref={dropdownRef}>
                            <button className={styles.cogButton} onClick={handleCogClick}>
                                <FaCog />
                            </button>
                            {showDropdown && (
                                <div className={styles.dropdownContent}>
                                    <button onClick={handleClearChat}>Clear Chat</button>
                                    <button onClick={handleDeleteChat}>Delete Chat</button>
                                </div>
                            )}
                        </div>
                    </div>
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
            {showNewRecipientModal && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h2>Start New Chat</h2>
                        <form onSubmit={handleNewRecipientSubmit}>
                            <input
                                type="text"
                                placeholder="Enter Username"
                                value={newRecipient}
                                onChange={(e) => setNewRecipient(e.target.value)}
                                required
                            />
                            <button type="submit">Start Chat</button>
                            <button type="button" onClick={() => setShowNewRecipientModal(false)}>
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatPage;
