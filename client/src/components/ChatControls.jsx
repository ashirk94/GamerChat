import React from 'react';
import { Form, Button } from 'react-bootstrap';
import { FaCog } from "react-icons/fa";

const ChatControls = ({
    chatType,
    selectedRecipient,
    recipients,
    groups,
    showDropdown,
    dropdownRef,
    onClearSelection,
    onNewChatGroupChange,
    onSelectedRecipientChange,
    onSelectedGroupChange,
    onCogClick,
    onClearChat,
    onDeleteChat
}) => {
    return (
        <div className="left-controls d-flex align-items-center">
            {/* Clear Selection Button */}
            <Button
                variant="outline-secondary"
                onClick={onClearSelection}
                className="select-chat me-2"
                size="sm">
                Clear Chat
            </Button>

            {/* Combo Box for New Group/Chat */}
            <Form.Control
                as="select"
                onChange={onNewChatGroupChange}
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
                onChange={onSelectedRecipientChange}
                value={chatType === "direct" ? selectedRecipient : ""}
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
                onChange={onSelectedGroupChange}
                value={chatType === "group" ? selectedRecipient : ""}
                className="select-chat me-2"
                style={{ width: "200px", color: "white" }}>
                <option value="" disabled>
                    Group Messages
                </option>
                {groups
                    .filter((grp) => grp && grp.name && grp.name.trim() !== "")
                    .map((grp, index) => (
                        <option key={index} value={grp._id}>
                            {grp.name}
                        </option>
                    ))}
            </Form.Control>

            {/* Settings Dropdown */}
            <div className="dropdown" ref={dropdownRef}>
                <Button
                    variant="link"
                    className="cog-button"
                    onClick={onCogClick}>
                    <FaCog />
                </Button>
                {showDropdown && (
                    <div className="dropdown-content">
                        <Button variant="link" onClick={onClearChat}>
                            Clear Messages
                        </Button>
                        <Button variant="link" onClick={onDeleteChat}>
                            Delete Chat
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatControls;