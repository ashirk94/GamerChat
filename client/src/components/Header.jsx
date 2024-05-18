import React from "react";
import { Link } from "react-router-dom";
import { Container, Nav, Navbar } from "react-bootstrap";
import { FaSignInAlt, FaUserPlus } from "react-icons/fa";

function Header() {
	return (
		<header>
			<Navbar data-bs-theme="light">
				<Container>
					<Navbar.Brand as={Link} to="/">
						GamerChat
					</Navbar.Brand>
					<Navbar.Toggle aria-controls="basic-navbar-nav" />
					<Navbar.Collapse id="basic-navbar-nav">
						<Nav className="me-auto">
							<Nav.Link as={Link} to="/">
								Home
							</Nav.Link>
							<Nav.Link as={Link} to="/chat">
								Chat
							</Nav.Link>
							<Nav.Link as={Link} to="/profile">
								Profile
							</Nav.Link>
						</Nav>
						<Nav className="ms-auto">
							<Nav.Link as={Link} to="/login">
								<FaSignInAlt /> Log In
							</Nav.Link>
							<Nav.Link as={Link} to="/register">
								<FaUserPlus /> Sign Up
							</Nav.Link>
						</Nav>
					</Navbar.Collapse>
				</Container>
			</Navbar>
		</header>
	);
}

export default Header;
