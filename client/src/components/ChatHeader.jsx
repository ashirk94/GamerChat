import React from 'react';

const ChatHeader = ({ recipientInfo, chatType }) => {
    if (!recipientInfo) return null;

    return (
        <div className="recipient-info text-center mb-3">
            <div className="chat-type-indicator mb-3">
                <span
                    className={`badge ${
                        chatType === "group" ? "bg-success" : "bg-secondary"
                    } me-2`}
                    style={{ fontSize: '0.9em', padding: '0.5rem 0.8rem' }}>
                    {chatType === "group" ? "Group Chat" : "Direct Message"}
                </span>
            </div>
            
            {recipientInfo.profilePicture && (
                <img
                    src={recipientInfo.profilePicture}
                    alt="Profile"
                    className="recipient-profile-picture rounded-circle mb-2"
                    style={{ width: '60px', height: '60px' }}
                />
            )}
            
            <h3 className="recipient-name mb-0">
                {recipientInfo.displayName}
            </h3>
        </div>
    );
};

export default ChatHeader;