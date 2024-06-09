import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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
import {
	useGetUserProfileQuery,
	useUpdateUserMutation
} from "../slices/usersApiSlice";
import { setCredentials, setProfile, clearProfile } from "../slices/authSlice";
import { logout } from "../slices/authSlice";
import Loader from "../components/Loader";
import Message from "../components/Message";
import "../css/profilepage.css";

const ProfilePage = () => {
	const dispatch = useDispatch();
    const navigate = useNavigate();
	const { profile, userInfo } = useSelector((state) => state.auth);

	const {
		data: userProfile,
		isLoading: isProfileLoading,
		error: profileError,
		refetch: refetchProfile
	} = useGetUserProfileQuery(undefined, { skip: !userInfo });

	const [updateUserProfile, { isLoading: isUpdating, error: updateError }] =
		useUpdateUserMutation();

	const [loading, setLoading] = useState(true); // Add loading state
	const [editMode, setEditMode] = useState(false);
	const [fullName, setFullName] = useState("");
	const [displayName, setDisplayName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [bio, setBio] = useState("");
	const [location, setLocation] = useState("");
	const [visibility, setVisibility] = useState("");
	const [profilePicture, setProfilePicture] = useState(null);
	const [profilePicturePreview, setProfilePicturePreview] = useState(null);
	const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        if (userInfo) {
          dispatch(clearProfile()); // Clears any previous profile data
          setLoading(true); // Sets loading to true when fetching new profile data
          refetchProfile()
            .then(response => {
              if (response.error && response.error.status === 401) {
                // Logs out and redirects to login
                dispatch(logout());
                navigate("/login");
              }
            })
            .catch(error => console.error("Error fetching profile:", error));
        }
      }, [userInfo, refetchProfile, dispatch, navigate]);

	useEffect(() => {
		if (userProfile) {
			dispatch(setProfile(userProfile));
			setLoading(false); // Sets loading to false when profile data is set
		}
	}, [userProfile, dispatch]);

	useEffect(() => {
		if (profile) {
			setFullName(profile.fullName || "");
			setDisplayName(profile.displayName || "");
			setEmail(profile.email || "");
			setPhone(profile.phone || "");
			setBio(profile.bio || "");
			setLocation(profile.location || "");
			setVisibility(profile.visibility || "");
			if (profile.profilePicture) {
				setProfilePicturePreview(
					`data:${profile.profilePicture.contentType};base64,${profile.profilePicture.data}`
				);
			} else {
				setProfilePicturePreview(null); // Ensures no preview is shown if no profile picture
			}
		}
	}, [profile]);

	const handleProfilePictureChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setProfilePicture(file);

			const reader = new FileReader();
			reader.onloadend = () => {
				setProfilePicturePreview(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleProfileUpdate = async (userData) => {
		try {
			const formData = new FormData();
			formData.append("displayName", userData.displayName);
			formData.append("fullName", userData.fullName);
			formData.append("location", userData.location);
			formData.append("bio", userData.bio);
			formData.append("phone", userData.phone);
			formData.append("email", userData.email);
			formData.append("visibility", userData.visibility);
			if (profilePicture) {
				formData.append("profilePicture", profilePicture);
			}

			const res = await updateUserProfile(formData).unwrap();
			dispatch(setCredentials(res));
			setSuccessMessage("Profile updated successfully");
			setEditMode(false);
			setLoading(false); // Set loading to false after update
		} catch (err) {
			toast.error(err?.data?.message || err.error);
			setLoading(false); // Set loading to false if there's an error
		}
	};

	const submitHandler = async (e) => {
		e.preventDefault();

		const userData = {
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

	if (isProfileLoading || isUpdating || loading) return <Loader />;

	return (
		<Container className="profile-page">
			{(profileError || updateError) && (
				<Message variant="danger">Error loading profile data</Message>
			)}
			{successMessage && (
				<Message variant="success">{successMessage}</Message>
			)}
			<Card className="mb-4 gold-card">
				<Card.Header className="gold-card-header">
					Profile Information
				</Card.Header>
				<Card.Body>
					<Row className="profile-header mb-3">
						<Col md={4} className="text-center">
							{profilePicturePreview ? (
								<Image
									src={profilePicturePreview}
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
							{editMode && (
								<Form.Group
									controlId="profilePicture"
									className="mt-3">
									<Form.Control
										type="file"
										onChange={handleProfilePictureChange}
									/>
								</Form.Group>
							)}
						</Col>
						<Col md={8}>
							{editMode ? (
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
									<Form.Group
										controlId="email"
										className="mb-3">
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
									<Form.Group
										controlId="phone"
										className="mb-3">
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
									<Form.Group
										controlId="bio"
										className="mb-3">
										<Form.Label>Bio</Form.Label>
										<Form.Control
											as="textarea"
											rows={3}
											placeholder="Enter bio"
											value={bio}
											onChange={(e) =>
												setBio(e.target.value)
											}
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
											<option value="Public">
												Public
											</option>
											<option value="Private">
												Private
											</option>
											<option value="Friends Only">
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
							) : (
								<>
									<h4>{displayName}</h4>
									<p>
										<strong>Full Name:</strong> {fullName}
									</p>
									<p>
										<strong>Email:</strong> {email}
									</p>
									<p>
										<strong>Phone:</strong> {phone}
									</p>
									<p>
										<strong>Bio:</strong> {bio}
									</p>
									<p>
										<strong>Location:</strong> {location}
									</p>
									<p>
										<strong>Visibility:</strong>{" "}
										{visibility}
									</p>
									<Button
										variant="secondary"
										onClick={() => setEditMode(true)}>
										Edit Profile
									</Button>
								</>
							)}
						</Col>
					</Row>
				</Card.Body>
			</Card>
		</Container>
	);
};

export default ProfilePage;
