import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../slices/authSlice";
import { Container, Form, Button, InputGroup } from "react-bootstrap";
import {
    useGetGroupsQuery,
    useCreateGroupMutation,
    useSendMessageToGroupMutation
} from "../slices/groupsApiSlice";
import {
    useGetMessagesQuery,
    useSendMessageMutation
} from "../slices/messagesApiSlice";

import ChatHeader from "../components/ChatHeader";
import ChatControls from "../components/ChatControls";
import MessageList from "../components/MessageList";
import NewChatModal from "../components/NewChatModal";
import NewGroupModal from "../components/NewGroupModal";
import { useSocket } from "../hooks/useSocket";

const ChatPage = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const [message, setMessage] = useState("");
    const [selectedRecipient, setSelectedRecipient] = useState("");
    const [chatType, setChatType] = useState("");
    const [recipientInfo, setRecipientInfo] = useState(null);
    const [messages, setMessages] = useState([]);
    const [recipients, setRecipients] = useState([]);
    const [groups, setGroups] = useState([]);
    const [error, setError] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showNewRecipientModal, setShowNewRecipientModal] = useState(false);
    const [showNewGroupModal, setShowNewGroupModal] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    
    const dropdownRef = useRef(null);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const displayedMessages = selectedRecipient && chatType
        ? messages.filter((msg) => {
                if (chatType === "group") {
                    return msg.group === selectedRecipient || msg.recipientGroup === selectedRecipient;
                } else if (chatType === "direct") {
                    return (
                        (msg.recipient === selectedRecipient && msg.sender === userInfo.displayName) ||
                        (msg.sender === selectedRecipient && msg.recipient === userInfo.displayName)
                    );
                }
                return false;
          })
        : [];

    const { data: groupData, refetch: refetchGroups } = useGetGroupsQuery();
    const [createGroup] = useCreateGroupMutation();
    const [sendMessageToGroup] = useSendMessageToGroupMutation();
    const { data: messageData, refetch: refetchMessages } = useGetMessagesQuery(userInfo?.displayName);
    const [sendMessage] = useSendMessageMutation();

    // Socket handlers
    const handleChatMessage = (msg) => {
        if (
            (msg.recipient === selectedRecipient && msg.sender === userInfo.displayName) ||
            (msg.sender === selectedRecipient && msg.recipient === userInfo.displayName) ||
            msg.recipientGroup === selectedRecipient
        ) {
            setMessages((prevMessages) => {
                if (prevMessages.some((m) => m._id === msg._id)) {
                    return prevMessages;
                }
                return [...prevMessages, msg];
            });
        }

        // Update recipients list
        if (!recipients.includes(msg.recipient) && msg.recipient !== userInfo.displayName) {
            setRecipients((prevRecipients) => [...prevRecipients, msg.recipient]);
        }
        if (!recipients.includes(msg.sender) && msg.sender !== userInfo.displayName) {
            setRecipients((prevRecipients) => [...prevRecipients, msg.sender]);
        }
    };

    const handleGroupMessage = (msg) => {
        if (msg.group === selectedRecipient) {
            setMessages((prevMessages) => [...prevMessages, msg]);
        }
    };

    const socket = useSocket(userInfo, selectedRecipient, handleChatMessage, handleGroupMessage);

    // Fetch users for group chat selection
    useEffect(() => {
        fetch("/api/users")
            .then((response) => response.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setAllUsers(data);
                } else {
                    setAllUsers([]);
                }
            })
            .catch((error) => {
                console.error("Error fetching users:", error);
                setAllUsers([]);
            });
    }, []);

    useEffect(() => {
        if (groupData) {
            setGroups(groupData);
        }
    }, [groupData]);

    useEffect(() => {
        if (messageData) {
            setMessages(messageData);
        }
    }, [messageData]);

    useEffect(() => {
        if (userInfo) {
            refetchMessages();
            refetchGroups();
            
            // Fetch messages to populate recipients
            fetch(`/api/messages/${userInfo.displayName}`)
                .then((response) => response.json())
                .then((data) => {
                    const newRecipients = new Set();
                    data.forEach((msg) => {
                        if (msg.sender !== userInfo.displayName) {
                            newRecipients.add(msg.sender);
                        }
                        if (msg.recipient !== userInfo.displayName) {
                            newRecipients.add(msg.recipient);
                        }
                    });
                    setRecipients([...newRecipients]);
                })
                .catch((error) => console.error("Error fetching messages:", error));
        }
    }, [userInfo, refetchMessages, refetchGroups]);

    useEffect(() => {
        if (selectedRecipient && userInfo && chatType) {
            fetchMessagesForRecipient(selectedRecipient);
            fetchRecipientInfo(selectedRecipient);
        } else {
            setMessages([]);
            setRecipientInfo(null);
        }
    }, [selectedRecipient, userInfo, chatType]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessagesForRecipient = (recipient) => {
        if (userInfo && recipient) {
            const isGroupChat = chatType === "group";

            if (isGroupChat) {
                fetch(`/api/groups/${recipient}/messages`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                })
                    .then((response) => response.json())
                    .then((data) => setMessages(data))
                    .catch((error) => console.error("Error fetching group messages:", error));
            } else {
                fetch(`/api/messages/${userInfo.displayName}`)
                    .then((response) => response.json())
                    .then((data) => {
                        const filteredMessages = data.filter(
                            (msg) =>
                                (msg.recipient === recipient && msg.sender === userInfo.displayName) ||
                                (msg.sender === recipient && msg.recipient === userInfo.displayName)
                        );
                        setMessages(filteredMessages);

                        // Mark messages as seen
                        const unseenMessages = filteredMessages.filter((msg) => !msg.seen);
                        if (unseenMessages.length > 0) {
                            unseenMessages.forEach((msg) => (msg.seen = true));
                            fetch("/api/messages/seen", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    user: userInfo.displayName,
                                    recipient
                                })
                            });
                        }
                    })
                    .catch((error) => console.error("Error fetching messages:", error));
            }
        }
    };

    const fetchRecipientInfo = (recipient) => {
        if (!recipient) return;

        if (chatType === "group") {
            const group = groups.find((g) => g._id === recipient);
            if (group) {
                setRecipientInfo({ displayName: group.name });
            }
        } else {
            fetch(`/api/users/user/${recipient}`)
                .then((response) => response.json())
                .then((data) => {
                    if (data.profilePicture) {
                        const profilePicture = `data:${data.profilePicture.contentType};base64,${btoa(
                            String.fromCharCode(...new Uint8Array(data.profilePicture.data.data))
                        )}`;
                        data.profilePicture = profilePicture;
                    }
                    setRecipientInfo(data);
                })
                .catch((error) => console.error("Error fetching recipient info:", error));
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Event handlers
    const handleChange = (e) => setMessage(e.target.value);

    const handleNewChatGroupChange = (e) => {
        const value = e.target.value;
        if (value === "new-recipient") {
            setShowNewRecipientModal(true);
        } else if (value === "new-group") {
            setShowNewGroupModal(true);
        }
    };

    const handleSelectedRecipientChange = (e) => {
        const value = e.target.value;
        if (value === "") {
            setSelectedRecipient("");
            setChatType("");
            setRecipientInfo(null);
        } else {
            setSelectedRecipient(value);
            setChatType("direct");
        }
    };

    const handleSelectedGroupChange = (e) => {
        const value = e.target.value;
        if (value === "") {
            setSelectedRecipient("");
            setChatType("");
            setRecipientInfo(null);
        } else {
            setSelectedRecipient(value);
            setChatType("group");
        }
    };

    const handleClearSelection = () => {
        setSelectedRecipient("");
        setChatType("");
        setRecipientInfo(null);
        setMessages([]);
    };

    const handleNewRecipientSubmit = (recipient) => {
        setSelectedRecipient(recipient);
        setChatType("direct");
        setRecipients((prevRecipients) => [
            ...prevRecipients.filter((rec) => rec !== recipient),
            recipient
        ]);
    };

    const handleNewGroupSubmit = async (groupName, groupUsers) => {
        try {
            const group = await createGroup({
                name: groupName,
                userIds: groupUsers.map((user) => user._id)
            }).unwrap();
            setGroups((prevGroups) => [...prevGroups, group]);
        } catch (error) {
            console.error("Error creating group:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (message.trim() !== "" && selectedRecipient.trim() !== "" && userInfo && chatType) {
            if (chatType === "group") {
                const msg = {
                    text: message,
                    sender: userInfo.displayName,
                    group: selectedRecipient,
                    timestamp: new Date().toISOString()
                };
                socket.emit("group-message", msg, selectedRecipient);
                setMessages((prevMessages) => [...prevMessages, msg]);
                setMessage("");

                await sendMessageToGroup({
                    groupId: selectedRecipient,
                    data: { message, sender: userInfo.displayName }
                }).unwrap();
            } else {
                const timestamp = new Date().toISOString();
                const msg = {
                    user: userInfo._id,
                    text: message,
                    sender: userInfo.displayName,
                    recipient: selectedRecipient,
                    seen: false,
                    timestamp
                };
                socket.emit("chat-message", msg);
                setMessages((prevMessages) => [...prevMessages, msg]);
                setMessage("");

                sendMessage(msg).catch((error) => {
                    console.error("Error sending message:", error);
                });

                if (!recipients.includes(selectedRecipient)) {
                    setRecipients((prevRecipients) => [...prevRecipients, selectedRecipient]);
                }
            }
        }
    };

    const handleClearChat = () => setMessages([]);

    const handleDeleteChat = () => {
        if (selectedRecipient && userInfo) {
            fetch("/api/messages/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    displayName: userInfo.displayName,
                    recipient: selectedRecipient
                })
            })
                .then((response) => response.json())
                .then((data) => {
                    setMessages([]);
                    setRecipients((prevRecipients) =>
                        prevRecipients.filter((rec) => rec !== selectedRecipient)
                    );
                    setSelectedRecipient("");
                })
                .catch((error) => console.error("Error deleting chat history:", error));
        }
    };

    const handleCogClick = () => setShowDropdown((prevState) => !prevState);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <Container fluid className="content-container">
            {error && <div className="error-message">{error}</div>}
            
            <ChatHeader recipientInfo={recipientInfo} chatType={chatType} />
            
            <MessageList 
                displayedMessages={displayedMessages}
                userInfo={userInfo}
                messagesEndRef={messagesEndRef}
            />
            
            <div id="form-container" className="form-container">
                <Form
                    id="form"
                    onSubmit={handleSubmit}
                    className="form d-flex align-items-center">
                    
                    <ChatControls
                        chatType={chatType}
                        selectedRecipient={selectedRecipient}
                        recipients={recipients}
                        groups={groups}
                        showDropdown={showDropdown}
                        dropdownRef={dropdownRef}
                        onClearSelection={handleClearSelection}
                        onNewChatGroupChange={handleNewChatGroupChange}
                        onSelectedRecipientChange={handleSelectedRecipientChange}
                        onSelectedGroupChange={handleSelectedGroupChange}
                        onCogClick={handleCogClick}
                        onClearChat={handleClearChat}
                        onDeleteChat={handleDeleteChat}
                    />

                    <InputGroup className="flex-grow-1">
                        <Form.Control
                            type="text"
                            autoComplete="off"
                            value={message}
                            onChange={handleChange}
                            className="msg-submit"
                        />
                        <Button type="submit" variant="dark">
                            Send
                        </Button>
                    </InputGroup>
                </Form>
            </div>

            <NewChatModal
                show={showNewRecipientModal}
                onHide={() => setShowNewRecipientModal(false)}
                onSubmit={handleNewRecipientSubmit}
                allUsers={allUsers}
            />

            <NewGroupModal
                show={showNewGroupModal}
                onHide={() => setShowNewGroupModal(false)}
                onSubmit={handleNewGroupSubmit}
                allUsers={allUsers}
            />
        </Container>
    );
};

export default ChatPage;
