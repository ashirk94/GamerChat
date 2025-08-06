import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';

const NewChatModal = ({ 
    show, 
    onHide, 
    onSubmit, 
    allUsers = [],
    userInfo
}) => {
    const [newRecipient, setNewRecipient] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Prevent starting a chat with yourself
        if (userInfo && newRecipient.trim() === userInfo.displayName) {
            setError("You cannot start a chat with yourself.");
            return;
        }
        // Validate that the username exists
        const userExists = allUsers.some(user => 
            user.displayName === newRecipient
        );
        
        if (!userExists) {
            setError("User not found. Please enter a valid username.");
            return;
        }
        
        onSubmit(newRecipient);
        setNewRecipient("");
        setError("");
        onHide();
    };

    const handleClose = () => {
        setNewRecipient("");
        setError("");
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title>Start New Chat</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="formNewRecipient">
                        <Form.Label>Select User</Form.Label>
                        <Form.Control
                            as="select"
                            value={newRecipient}
                            onChange={(e) => {
                                setNewRecipient(e.target.value);
                                setError("");
                            }}
                            required
                            autoFocus>
                            <option value="">Select a user...</option>
                            {allUsers.map((user) => (
                                <option key={user._id} value={user.displayName}>
                                    {user.displayName}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                    <div className="mt-3">
                        <Button type="submit" variant="primary" className="me-2">
                            Start Chat
                        </Button>
                        <Button variant="secondary" onClick={handleClose}>
                            Cancel
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default NewChatModal;