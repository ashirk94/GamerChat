import React, { useState } from "react";
import FormContainer from "../components/FormContainer";
import { Link } from "react-router-dom";
import { Button, Col, Form, Row } from "react-bootstrap";
import "../css/login.css";

function LoginPage() {
	// State variables to store email and password input values
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	// Event handler for handling form submission
	const handleSubmit = async (event) => {
		event.preventDefault(); // Prevent default form submission behavior
		// Add logic here to handle form submission (e.g., sending login credentials to server)
		console.log("Submitting login credentials...");
	};

	return (
		<div className="login-page">
			<FormContainer>
				<h1 className="sign-up">Sign In</h1>
				<Form onSubmit={handleSubmit}>
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
					<Button type="submit" className="mt-3">
						Log In
					</Button>
					<Row className="py-3">
						<Col>
							New to GamerChat?{" "}
							<Link to="/register" className="std-link">
								Register
							</Link>
						</Col>
					</Row>
				</Form>
			</FormContainer>
		</div>
	);
}

export default LoginPage;
