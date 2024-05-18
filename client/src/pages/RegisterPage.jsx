import React, { useState } from "react";
import FormContainer from "../components/FormContainer";
import { Link } from "react-router-dom";
import { Button, Col, Form, Row } from "react-bootstrap";
import "../css/login.css";

function RegisterPage() {
	// State variables to store email and password input values
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [displayName, setDisplayName] = useState("");

	// Event handler for handling form submission
	const handleSubmit = async (event) => {
		event.preventDefault(); // Prevent default form submission behavior
		// Add logic here to handle form submission (e.g., sending login credentials to server)
		console.log("Submitting login credentials...");
	};

	return (
		<div className="login-page">
			<FormContainer>
				<h1 className="sign-up">Sign Up</h1>
				<Form onSubmit={handleSubmit}>
					<Form.Group className="my-2" controlId="displayName">
						<Form.Label>Display Name</Form.Label>
						<Form.Control
							type="text"
							value={displayName}
							onChange={(e) =>
								setDisplayName(e.target.value)
							}></Form.Control>
					</Form.Group>
					<Form.Group className="my-2" controlId="email">
						<Form.Label>Email Address</Form.Label>
						<Form.Control
							type="email"
							value={email}
							onChange={(e) =>
								setEmail(e.target.value)
							}></Form.Control>
					</Form.Group>
					<Form.Group className="my-2" controlId="password">
						<Form.Label>Password</Form.Label>
						<Form.Control
							type="password"
							value={password}
							onChange={(e) =>
								setPassword(e.target.value)
							}></Form.Control>
					</Form.Group>
					<Form.Group className="my-2" controlId="password">
						<Form.Label>Confirm Password</Form.Label>
						<Form.Control
							type="password"
							value={confirmPassword}
							onChange={(e) =>
								setConfirmPassword(e.target.value)
							}></Form.Control>
					</Form.Group>
					<Button type="submit" className="mt-3 w-100">
						Sign Up
					</Button>
					<Row className="py-3">
						<Col>
							Already have an account?{" "}
							<Link to="/login" className="std-link">
								Log In
							</Link>
						</Col>
					</Row>
				</Form>
			</FormContainer>
		</div>
	);
}

export default RegisterPage;
