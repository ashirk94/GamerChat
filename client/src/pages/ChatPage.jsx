import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { io } from "socket.io-client";
import { FaCog } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { logout } from "../slices/authSlice";
import {
	Container,
	Row,
	Col,
	Form,
	Button,
	Modal,
	ListGroup,
	InputGroup,
	Dropdown
} from "react-bootstrap";
import {
	useGetGroupsQuery,
	useCreateGroupMutation,
	useSendMessageToGroupMutation
} from "../slices/groupsApiSlice";
import {
	useGetMessagesQuery,
	useSendMessageMutation
} from "../slices/messagesApiSlice";

const ChatPage = () => {
	const { userInfo } = useSelector((state) => state.auth);
	const [message, setMessage] = useState("");
	const [selectedRecipient, setSelectedRecipient] = useState("");
	const [recipientInfo, setRecipientInfo] = useState(null);
	const [messages, setMessages] = useState([]);
	const [socket, setSocket] = useState(null);
	const [recipients, setRecipients] = useState([]);
	const [groups, setGroups] = useState([]);
	const [error, setError] = useState(null);
	const [showDropdown, setShowDropdown] = useState(false);
	const [showNewRecipientModal, setShowNewRecipientModal] = useState(false);
	const [showNewGroupModal, setShowNewGroupModal] = useState(false);
	const [newRecipient, setNewRecipient] = useState("");
	const [newGroup, setNewGroup] = useState("");
	const [newGroupUsers, setNewGroupUsers] = useState([]);
	const [allUsers, setAllUsers] = useState([]);
	const dropdownRef = useRef(null);
	const messagesEndRef = useRef(null);
	const navigate = useNavigate();
	const dispatch = useDispatch();

    const displayedMessages = selectedRecipient
    ? messages.filter((msg) =>
        msg.chatId === selectedRecipient ||
        msg.recipientId === selectedRecipient ||
        msg.senderId === selectedRecipient ||
        msg.recipient === selectedRecipient ||
        msg.sender === selectedRecipient
        )
    : [];

	const { data: groupData, refetch: refetchGroups } = useGetGroupsQuery();
	const [createGroup] = useCreateGroupMutation();
	const [sendMessageToGroup] = useSendMessageToGroupMutation();
	const { data: messageData, refetch: refetchMessages } = useGetMessagesQuery(
		userInfo?.displayName
	);
	const [sendMessage] = useSendMessageMutation();

	// Fetch users for group chat selection
	useEffect(() => {
		fetch("/api/users")
			.then((response) => response.json())
			.then((data) => setAllUsers(data))
			.catch((error) => console.error("Error fetching users:", error));
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
		const newSocket = io("http://localhost:4000");
		setSocket(newSocket);

		if (userInfo) {
			newSocket.emit("register", userInfo.displayName);
		}

		newSocket.on("chat-message", (msg) => {
			if (
				(msg.recipient === selectedRecipient &&
					msg.sender === userInfo.displayName) ||
				(msg.sender === selectedRecipient &&
					msg.recipient === userInfo.displayName) ||
				msg.recipientGroup === selectedRecipient
			) {
				setMessages((prevMessages) => {
					if (prevMessages.some((m) => m._id === msg._id)) {
						return prevMessages;
					}
					return [...prevMessages, msg];
				});
			}

			if (
				!recipients.includes(msg.recipient) &&
				msg.recipient !== userInfo.displayName
			) {
				setRecipients((prevRecipients) => [
					...prevRecipients,
					msg.recipient
				]);
			}
			if (
				!recipients.includes(msg.sender) &&
				msg.sender !== userInfo.displayName
			) {
				setRecipients((prevRecipients) => [
					...prevRecipients,
					msg.sender
				]);
			}
			if (msg.group && !groups.includes(msg.group)) {
				setGroups((prevGroups) => [...prevGroups, msg.group]);
			}
		});

		newSocket.on("group-message", (msg) => {
			if (msg.group === selectedRecipient) {
				setMessages((prevMessages) => [...prevMessages, msg]);
			}
		});

		return () => {
			newSocket.disconnect();
		};
	}, [userInfo, recipients, selectedRecipient, groups]);

	useEffect(() => {
		if (userInfo) {
			refetchMessages();
		}
	}, [userInfo, refetchMessages]);

	useEffect(() => {
		if (userInfo) {
			refetchGroups();
		}
	}, [userInfo, refetchGroups]);

	useEffect(() => {
		if (userInfo) {
			// Fetch messages for the user to populate recipients
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
				.catch((error) =>
					console.error("Error fetching messages:", error)
				);

			// Fetch groups for the user
			refetchGroups();
		}
	}, [userInfo, refetchGroups]);

	useEffect(() => {
		if (groupData) {
			setGroups(groupData);
		}
	}, [groupData]);

	useEffect(() => {
		if (selectedRecipient && userInfo) {
			fetchMessagesForRecipient(selectedRecipient);
			fetchRecipientInfo(selectedRecipient);
		} else {
			setMessages([]);
		}
	}, [selectedRecipient, userInfo]);

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const fetchMessagesForRecipient = (recipient) => {
		if (userInfo) {
			const isGroupChat = groups.some((g) => g._id === recipient);

			if (isGroupChat) {
				fetch(`/api/groups/${recipient}/messages`, {
					headers: {
						Authorization: `Bearer ${userInfo.token}`
					}
				})
					.then((response) => response.json())
					.then((data) => {
						setMessages(data);
					})
					.catch((error) =>
						console.error("Error fetching group messages:", error)
					);
			} else {
				fetch(`/api/messages/${userInfo.displayName}`)
					.then((response) => response.json())
					.then((data) => {
						const filteredMessages = data.filter(
							(msg) =>
								(msg.recipient === recipient &&
									msg.sender === userInfo.displayName) ||
								(msg.sender === recipient &&
									msg.recipient === userInfo.displayName)
						);
						setMessages(filteredMessages);

						const unseenMessages = filteredMessages.filter(
							(msg) => !msg.seen
						);
						if (unseenMessages.length > 0) {
							unseenMessages.forEach((msg) => (msg.seen = true));
							fetch("/api/messages/seen", {
								method: "POST",
								headers: {
									"Content-Type": "application/json"
								},
								body: JSON.stringify({
									user: userInfo.displayName,
									recipient
								})
							});
						}
					})
					.catch((error) =>
						console.error("Error fetching messages:", error)
					);
			}
		}
	};

	const fetchRecipientInfo = (recipient) => {
		if (!recipient) return;

		const group = groups.find((g) => g._id === recipient);
		if (group) {
			setRecipientInfo({ displayName: group.name });
		} else {
			fetch(`/api/users/user/${recipient}`)
				.then((response) => response.json())
				.then((data) => {
					if (data.profilePicture) {
						const profilePicture = `data:${
							data.profilePicture.contentType
						};base64,${btoa(
							String.fromCharCode(
								...new Uint8Array(data.profilePicture.data.data)
							)
						)}`;
						data.profilePicture = profilePicture;
					}
					setRecipientInfo(data);
				})
				.catch((error) =>
					console.error("Error fetching recipient info:", error)
				);
		}
	};

	const handleChange = (e) => {
		setMessage(e.target.value);
	};

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
		setSelectedRecipient(value);
	};

	const handleSelectedGroupChange = (e) => {
		const value = e.target.value;
		setSelectedRecipient(value);
	};

	const handleNewRecipientSubmit = (e) => {
		e.preventDefault();
		setSelectedRecipient(newRecipient);
		setRecipients((prevRecipients) => [
			...prevRecipients.filter((rec) => rec),
			newRecipient
		]);
		setShowNewRecipientModal(false);
		setNewRecipient("");
	};

	const handleNewGroupSubmit = async (e) => {
		e.preventDefault();
		if (newGroup.trim() && newGroupUsers.length) {
			try {
				const group = await createGroup({
					name: newGroup,
					userIds: newGroupUsers.map((user) => user._id)
				}).unwrap();
				setGroups((prevGroups) => [...prevGroups, group]);
				setShowNewGroupModal(false);
				setNewGroup("");
				setNewGroupUsers([]);
			} catch (error) {
				console.error("Error creating group:", error);
			}
		}
	};

	const handleUserCheckboxChange = (e, user) => {
		if (e.target.checked) {
			setNewGroupUsers((prevUsers) => [...prevUsers, user]);
		} else {
			setNewGroupUsers((prevUsers) =>
				prevUsers.filter((u) => u !== user)
			);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (
			message.trim() !== "" &&
			selectedRecipient.trim() !== "" &&
			userInfo
		) {
			const isGroupChat = groups.some((g) => g._id === selectedRecipient);

			if (isGroupChat) {
				const msg = {
					text: message,
					sender: userInfo.displayName,
					group: selectedRecipient
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
					setRecipients((prevRecipients) => [
						...prevRecipients,
						selectedRecipient
					]);
				}
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
				body: JSON.stringify({
					displayName: userInfo.displayName,
					recipient: selectedRecipient
				})
			})
				.then((response) => response.json())
				.then((data) => {
					setMessages([]);
					setRecipients((prevRecipients) =>
						prevRecipients.filter(
							(rec) => rec !== selectedRecipient
						)
					);
					setSelectedRecipient("");
				})
				.catch((error) =>
					console.error("Error deleting chat history:", error)
				);
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
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target)
			) {
				setShowDropdown(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	useEffect(() => {
		// Fetch all users for creating groups
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

	return (
		<Container fluid className="content-container">
			{error && <div className="error-message">{error}</div>}
			{recipientInfo && (
				<div className="recipient-info text-center">
					{recipientInfo.profilePicture && (
						<img
							src={recipientInfo.profilePicture}
							alt="Profile"
							className="recipient-profile-picture rounded-circle"
						/>
					)}
					<h2 className="recipient-name">
						{recipientInfo.displayName}
					</h2>
				</div>
			)}
			<div className="main-content">
				<ListGroup id="messages" className="messages">
					{displayedMessages.map((msg, index) => (
						<ListGroup.Item
							key={index}
							className={`message-container ${
								msg.sender === userInfo.displayName
									? "user"
									: "recipient"
							}`}>
							<div
								className={`message ${
									msg.sender === userInfo.displayName
										? "user"
										: "recipient"
								}`}>
								<strong>{msg.sender}</strong>: {msg.text}
							</div>
							<span className="timestamp">
								{new Date(
									msg.timestamp
								).toLocaleDateString() ===
								new Date().toLocaleDateString()
									? new Date(
											msg.timestamp
									  ).toLocaleTimeString([], {
											hour: "2-digit",
											minute: "2-digit"
									  })
									: new Date(
											msg.timestamp
									  ).toLocaleDateString()}
							</span>
						</ListGroup.Item>
					))}
					<div ref={messagesEndRef}></div>
				</ListGroup>
			</div>
			<div id="form-container" className="form-container">
				<Form
					id="form"
					onSubmit={handleSubmit}
					className="form d-flex align-items-center">
					<div className="left-controls d-flex align-items-center">
						{/* Combo Box for New Group/Chat */}
						<Form.Control
							as="select"
							onChange={handleNewChatGroupChange}
							value=""
							className="select-chat me-2"
							style={{ width: "200px", color: "white" }}>
							<option value="" disabled>
								New Chat/Group
							</option>
							<option value="new-recipient">New Chat</option>
							<option value="new-group">New Group</option>
						</Form.Control>

						{/* Combo Box for Direct Messages */}
						<Form.Control
							as="select"
							onChange={handleSelectedRecipientChange}
							value={selectedRecipient}
							className="select-chat me-2"
							style={{ width: "200px", color: "white" }}>
							<option value="" disabled>
								Direct Messages
							</option>
							{recipients
								.filter((rec) => rec && rec.trim() !== "")
								.map((rec, index) => (
									<option key={index} value={rec}>
										{rec}
									</option>
								))}
						</Form.Control>

						{/* Combo Box for Group Messages */}
						<Form.Control
							as="select"
							onChange={handleSelectedGroupChange}
							value={selectedRecipient}
							className="select-chat me-2"
							style={{ width: "200px", color: "white" }}>
							<option value="" disabled>
								Group Messages
							</option>
							{groups
								.filter((grp) => grp && grp.name.trim() !== "")
								.map((grp, index) => (
									<option key={index} value={grp._id}>
										{grp.name}
									</option>
								))}
						</Form.Control>

						<div className="dropdown" ref={dropdownRef}>
							<Button
								variant="link"
								className="cog-button"
								onClick={handleCogClick}>
								<FaCog />
							</Button>
							{showDropdown && (
								<div className="dropdown-content">
									<Button
										variant="link"
										onClick={handleClearChat}>
										Clear Chat
									</Button>
									<Button
										variant="link"
										onClick={handleDeleteChat}>
										Delete Chat
									</Button>
								</div>
							)}
						</div>
					</div>
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
			<Modal
				show={showNewRecipientModal}
				onHide={() => setShowNewRecipientModal(false)}
				backdrop="static"
				keyboard={false}>
				<Modal.Header closeButton>
					<Modal.Title>Start New Chat</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form onSubmit={handleNewRecipientSubmit}>
						<Form.Group controlId="formNewRecipient">
							<Form.Control
								type="text"
								placeholder="Enter Username"
								value={newRecipient}
								onChange={(e) =>
									setNewRecipient(e.target.value)
								}
								required
								autoFocus
							/>
						</Form.Group>
						<Button type="submit" variant="dark">
							Start Chat
						</Button>
						<Button
							variant="secondary"
							onClick={() => setShowNewRecipientModal(false)}>
							Cancel
						</Button>
					</Form>
				</Modal.Body>
			</Modal>

			<Modal
				show={showNewGroupModal}
				onHide={() => setShowNewGroupModal(false)}
				backdrop="static"
				keyboard={false}>
				<Modal.Header closeButton>
					<Modal.Title>Create New Group</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form onSubmit={handleNewGroupSubmit}>
						<Form.Group controlId="formGroupName">
							<Form.Label>Group Name</Form.Label>
							<Form.Control
								type="text"
								placeholder="Enter group name"
								value={newGroup}
								onChange={(e) => setNewGroup(e.target.value)}
								required
								autoFocus
							/>
						</Form.Group>
						<Form.Group>
							<Form.Label>Select Users</Form.Label>
							<ListGroup>
								{allUsers.map((user) => (
									<ListGroup.Item key={user._id}>
										<Form.Check
											type="checkbox"
											id={user.displayName}
											label={user.displayName}
											onChange={(e) =>
												handleUserCheckboxChange(
													e,
													user
												)
											}
										/>
									</ListGroup.Item>
								))}
							</ListGroup>
						</Form.Group>
						<Button variant="dark" type="submit">
							Create Group
						</Button>
						<Button
							variant="secondary"
							onClick={() => setShowNewGroupModal(false)}>
							Cancel
						</Button>
					</Form>
				</Modal.Body>
			</Modal>
		</Container>
	);
};

export default ChatPage;
