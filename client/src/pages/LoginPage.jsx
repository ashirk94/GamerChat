import React, { useState, useEffect } from "react";
import FormContainer from "../components/FormContainer";
import { Link, useNavigate } from "react-router-dom";
import { Button, Col, Form, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useLoginMutation } from "../slices/usersApiSlice";
import { setCredentials } from "../slices/authSlice";
import Loader from "../components/Loader";
import "../css/login.css";

function LoginPage() {
	// State variables to store email and password input values
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const navigate = useNavigate();
	const dispatch = useDispatch();

	const [login, { isLoading }] = useLoginMutation();

	const { userInfo } = useSelector((state) => state.auth);

	// Redirects to home page if user is already logged in
	useEffect(() => {
		if (userInfo) {
			navigate("/");
		}
	}, [userInfo, navigate]);

	// Event handler for handling form submission
	const submitHandler = async (event) => {
		event.preventDefault();

		try {
			const res = await login({ email, password }).unwrap();
			dispatch(setCredentials({ ...res }));
			navigate("/"); // Redirects to home page on successful login
		} catch (error) {
			toast.error(error?.data?.message || error.error);
			console.error("Failed to login: ", error);
		}
	};

	return (
		<div className="login-page">
			<FormContainer>
				<h1 className="sign-up">Log In</h1>
				<Form onSubmit={submitHandler}>
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

					{isLoading && <Loader />}
					<Button type="submit" className="mt-3 w-100">
						Log In
					</Button>
					<Row className="py-3">
						<Col>
							New to GamerChat?{" "}
							<Link to="/register" className="std-link">
								Sign up
							</Link>
						</Col>
					</Row>
				</Form>
			</FormContainer>
		</div>
	);
}

export default LoginPage;
