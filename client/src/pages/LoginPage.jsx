import React, { useState } from "react";
import FormContainer from "../components/FormContainer";
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
				<h1>Sign In</h1>
			</FormContainer>
		</div>
	);
}

export default LoginPage;
