import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	Form,
	Button,
	Row,
	Col,
	Container,
	Image,
	Card
} from "react-bootstrap";
import { toast } from "react-toastify";
import { useUpdateUserMutation } from "../slices/usersApiSlice";
import { setCredentials } from "../slices/authSlice";
import Loader from "../components/Loader";
import Message from "../components/Message";
import "../css/profilepage.css";
import axios from "axios";

const uploadImage = async (imageFile) => {
	const formData = new FormData();
	formData.append("image", imageFile);

	const config = {
		headers: {
			"Content-Type": "multipart/form-data"
		}
	};

	const { data } = await axios.post("/api/upload", formData, config);
	return data;
};

const ProfilePage = () => {
	const dispatch = useDispatch();
	const { userInfo } = useSelector((state) => state.auth);

	const [updateUserProfile, { isLoading, error }] = useUpdateUserMutation();

	const [fullName, setFullName] = useState("");
	const [displayName, setDisplayName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [bio, setBio] = useState("");
	const [location, setLocation] = useState("");
	const [visibility, setVisibility] = useState("public");
	const [profilePicture, setProfilePicture] = useState(null);

	useEffect(() => {
		if (userInfo) {
			setFullName(userInfo.fullName || "");
			setDisplayName(userInfo.displayName || "");
			setEmail(userInfo.email || "");
			setPhone(userInfo.phone || "");
			setBio(userInfo.bio || "");
			setLocation(userInfo.location || "");
			setVisibility(userInfo.visibility || "public");
			setProfilePicture(userInfo.profilePic || null);
		}
	}, [userInfo]);

	const handleProfilePictureChange = (e) => {
		setProfilePicture(e.target.files[0]);
	};

	const handleProfileUpdate = async (userData) => {
		try {
			let profilePicUrl = userData.profilePic;

			if (profilePicture) {
				profilePicUrl = await uploadImage(profilePicture);
			}

			const updatedUser = {
				...userData,
				profilePic: profilePicUrl
			};

			const token = userInfo.token; // Ensure you have the token from userInfo

			const config = {
				headers: {
					Authorization: `Bearer ${token}`
				}
			};

			const res = await updateUserProfile(updatedUser, config).unwrap();
			dispatch(setCredentials(res));
			toast.success("Profile updated successfully");
		} catch (err) {
			toast.error(err?.data?.message || err.error);
		}
	};

	const submitHandler = async (e) => {
		e.preventDefault();

		const userData = {
			_id: userInfo._id,
			displayName,
			fullName,
			location,
			bio,
			phone,
			email,
			visibility
		};

		await handleProfileUpdate(userData);
	};

	if (isLoading) return <Loader />;

	return (
		<Container className="profile-page">
			{error && (
				<Message variant="danger">Error loading profile data</Message>
			)}
			<Card className="mb-4 gold-card">
				<Card.Header className="gold-card-header">
					Profile Information
				</Card.Header>
				<Card.Body>
					<Row className="profile-header mb-3">
						<Col md={4} className="text-center">
							{profilePicture ? (
								<Image
									src={profilePicture}
									alt="Profile"
									roundedCircle
									fluid
									className="profile-picture-img"
									style={{ width: "150px", height: "150px" }}
								/>
							) : (
								<div className="no-profile-picture">
									No profile picture
								</div>
							)}
							<Form.Group
								controlId="profilePicture"
								className="mt-3">
								<Form.Control
									type="file"
									onChange={handleProfilePictureChange}
								/>
							</Form.Group>
						</Col>
						<Col md={8}>
							<Form onSubmit={submitHandler}>
								<Form.Group
									controlId="fullName"
									className="mb-3">
									<Form.Label>Full Name</Form.Label>
									<Form.Control
										type="text"
										placeholder="Enter full name"
										value={fullName}
										onChange={(e) =>
											setFullName(e.target.value)
										}
									/>
								</Form.Group>
								<Form.Group
									controlId="displayName"
									className="mb-3">
									<Form.Label>Display Name</Form.Label>
									<Form.Control
										type="text"
										placeholder="Enter display name"
										value={displayName}
										onChange={(e) =>
											setDisplayName(e.target.value)
										}
									/>
								</Form.Group>
								<Form.Group controlId="email" className="mb-3">
									<Form.Label>Email Address</Form.Label>
									<Form.Control
										type="email"
										placeholder="Enter email"
										value={email}
										onChange={(e) =>
											setEmail(e.target.value)
										}
									/>
								</Form.Group>
								<Form.Group controlId="phone" className="mb-3">
									<Form.Label>Phone Number</Form.Label>
									<Form.Control
										type="text"
										placeholder="Enter phone number"
										value={phone}
										onChange={(e) =>
											setPhone(e.target.value)
										}
									/>
								</Form.Group>
								<Form.Group controlId="bio" className="mb-3">
									<Form.Label>Bio</Form.Label>
									<Form.Control
										as="textarea"
										rows={3}
										placeholder="Enter bio"
										value={bio}
										onChange={(e) => setBio(e.target.value)}
									/>
								</Form.Group>
								<Form.Group
									controlId="location"
									className="mb-3">
									<Form.Label>Location</Form.Label>
									<Form.Control
										type="text"
										placeholder="Enter location"
										value={location}
										onChange={(e) =>
											setLocation(e.target.value)
										}
									/>
								</Form.Group>
								<Form.Group
									controlId="visibility"
									className="mb-3">
									<Form.Label>Visibility</Form.Label>
									<Form.Control
										as="select"
										value={visibility}
										onChange={(e) =>
											setVisibility(e.target.value)
										}>
										<option value="public">Public</option>
										<option value="private">Private</option>
										<option value="friends">
											Friends Only
										</option>
									</Form.Control>
								</Form.Group>
								<Button
									type="submit"
									variant="primary"
									className="mt-3">
									Save
								</Button>
							</Form>
						</Col>
					</Row>
				</Card.Body>
			</Card>
		</Container>
	);
};

export default ProfilePage;
