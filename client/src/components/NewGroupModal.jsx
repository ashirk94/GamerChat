import React, { useState } from 'react';
import { Modal, Form, Button, ListGroup } from 'react-bootstrap';

const NewGroupModal = ({ 
    show, 
    onHide, 
    onSubmit, 
    allUsers = [] 
}) => {
    const [newGroup, setNewGroup] = useState("");
    const [newGroupUsers, setNewGroupUsers] = useState([]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newGroup.trim() && newGroupUsers.length) {
            onSubmit(newGroup, newGroupUsers);
            setNewGroup("");
            setNewGroupUsers([]);
            onHide();
        }
    };

    const handleClose = () => {
        setNewGroup("");
        setNewGroupUsers([]);
        onHide();
    };

    const handleUserCheckboxChange = (e, user) => {
        if (e.target.checked) {
            setNewGroupUsers((prevUsers) => [...prevUsers, user]);
        } else {
            setNewGroupUsers((prevUsers) =>
                prevUsers.filter((u) => u._id !== user._id)
            );
        }
    };

    return (
        <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title>Create New Group</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="formGroupName" className="mb-3">
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
                    <Form.Group className="mb-3">
                        <Form.Label>Select Users</Form.Label>
                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            <ListGroup>
                                {allUsers.map((user) => (
                                    <ListGroup.Item key={user._id}>
                                        <Form.Check
                                            type="checkbox"
                                            id={user._id}
                                            label={user.displayName}
                                            onChange={(e) =>
                                                handleUserCheckboxChange(e, user)
                                            }
                                        />
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </div>
                    </Form.Group>
                    <div>
                        <Button variant="primary" type="submit" className="me-2">
                            Create Group
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

export default NewGroupModal;