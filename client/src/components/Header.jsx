import React from "react";
import { Link } from "react-router-dom";
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { FaSignInAlt, FaUserPlus } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useLogoutMutation } from "../slices/usersApiSlice";
import { logout, clearProfile } from "../slices/authSlice";

function Header() {
	const { userInfo } = useSelector((state) => state.auth);
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [logoutApiCall] = useLogoutMutation();

	const logoutHandler = async () => {
		try {
			dispatch(clearProfile());
			await logoutApiCall().unwrap();
			dispatch(logout());
			navigate("/");
		} catch (error) {
			console.error("Failed to log out:", error);
		}
	};

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
						</Nav>
						<Nav className="ms-auto">
							{userInfo ? (
								<>
									<NavDropdown
										title={
											<>
												{userInfo.profilePicture && (
													<img
														src={`data:${userInfo.profilePicture.contentType};base64,${userInfo.profilePicture.data}`}
														alt="Profile"
														className="rounded-circle"
														style={{
															width: "30px",
															height: "30px",
															marginRight: "10px"
														}}
													/>
												)}
												{userInfo.displayName}
											</>
										}
										id="displayname">
										<NavDropdown.Item
											as={Link}
											to="/profile">
											Profile
										</NavDropdown.Item>
										<NavDropdown.Item
											onClick={logoutHandler}>
											Log Out
										</NavDropdown.Item>
									</NavDropdown>
								</>
							) : (
								<>
									<Nav.Link as={Link} to="/login">
										<FaSignInAlt /> Log In
									</Nav.Link>
									<Nav.Link as={Link} to="/register">
										<FaUserPlus /> Sign Up
									</Nav.Link>
								</>
							)}
						</Nav>
					</Navbar.Collapse>
				</Container>
			</Navbar>
		</header>
	);
}

export default Header;
