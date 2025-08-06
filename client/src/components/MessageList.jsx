import React from 'react';
import { ListGroup } from 'react-bootstrap';

const MessageList = ({ displayedMessages, userInfo, messagesEndRef }) => {
    return (
        <div className="main-content">
            <ListGroup id="messages" className="messages">
                {displayedMessages.map((msg, index) => (
                    <ListGroup.Item
                        key={index}
                        className={`message-container ${
                            msg.sender === userInfo.displayName ? "user" : "recipient"
                        }`}>
                        <div
                            className={`message ${
                                msg.sender === userInfo.displayName ? "user" : "recipient"
                            }`}>
                            <strong>{msg.sender}</strong>: {msg.text}
                        </div>
                        <span className="timestamp">
                            {new Date(msg.timestamp).toLocaleDateString() ===
                            new Date().toLocaleDateString()
                                ? new Date(msg.timestamp).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit"
                                  })
                                : new Date(msg.timestamp).toLocaleDateString()}
                        </span>
                    </ListGroup.Item>
                ))}
                <div ref={messagesEndRef}></div>
            </ListGroup>
        </div>
    );
};

export default MessageList;