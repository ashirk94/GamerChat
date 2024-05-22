import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import '../css/profilepage.css';

function ProfilePage() {
    const { userInfo } = useSelector((state) => state.auth);

    const [profilePicture, setProfilePicture] = useState(null);
    const [basicInfo, setBasicInfo] = useState({
        name: '',
        displayName: '',
        email: '',
        phone: '',
        bio: '',
        location: '',
        visibility: 'public'
    });
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        if (userInfo) {
            setBasicInfo({
                name: userInfo.name || '',
                displayName: userInfo.displayName || '',
                email: userInfo.email || '',
                phone: userInfo.phone || '',
                bio: userInfo.bio || '',
                location: userInfo.location || '',
                visibility: userInfo.visibility || 'public'
            });
            setProfilePicture(userInfo.profilePicture || null);
        } else {
            // Replace with your actual API endpoint for fetching user data
            fetch('/api/users/profile', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming token is stored in localStorage
                }
            })
                .then(response => response.json())
                .then(data => {
                    setBasicInfo({
                        name: data.name || '',
                        displayName: data.displayName || '',
                        email: data.email || '',
                        phone: data.phone || '',
                        bio: data.bio || '',
                        location: data.location || '',
                        visibility: data.visibility || 'public'
                    });
                    setProfilePicture(data.profilePicture || null);
                })
                .catch(error => console.error('Error fetching profile data:', error));
        }
    }, [userInfo]);

    const handleProfilePictureChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setProfilePicture(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setBasicInfo({ ...basicInfo, [name]: value });
    };

    const toggleEditMode = () => {
        setEditMode(!editMode);
    };

    const saveProfile = () => {
        // Replace with your actual API endpoint for updating user data
        fetch('/api/users/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(basicInfo)
        })
            .then(response => response.json())
            .then(data => {
                setBasicInfo(data);
                setEditMode(false);
            })
            .catch(error => console.error('Error updating profile data:', error));
    };

    return (
        <div className="profile-page">
            <h1>Profile Page</h1>
            <div className="profile-header">
                <div className="profile-picture">
                    <img src={profilePicture || 'default-profile.png'} alt="Profile" />
                    {editMode && <input type="file" onChange={handleProfilePictureChange} />}
                </div>
                <div className="basic-info">
                    {editMode ? (
                        <>
                            <input
                                type="text"
                                name="name"
                                value={basicInfo.name}
                                onChange={handleInputChange}
                                placeholder="Name"
                            />
                            <input
                                type="text"
                                name="displayName"
                                value={basicInfo.displayName}
                                onChange={handleInputChange}
                                placeholder="Username"
                            />
                            <input
                                type="email"
                                name="email"
                                value={basicInfo.email}
                                onChange={handleInputChange}
                                placeholder="Email"
                            />
                            <input
                                type="text"
                                name="phone"
                                value={basicInfo.phone}
                                onChange={handleInputChange}
                                placeholder="Phone Number"
                            />
                            <textarea
                                name="bio"
                                value={basicInfo.bio}
                                onChange={handleInputChange}
                                placeholder="Bio"
                            />
                            <input
                                type="text"
                                name="location"
                                value={basicInfo.location}
                                onChange={handleInputChange}
                                placeholder="Location"
                            />
                            <select
                                name="visibility"
                                value={basicInfo.visibility}
                                onChange={handleInputChange}
                            >
                                <option value="public">Public</option>
                                <option value="private">Private</option>
                                <option value="friends">Friends Only</option>
                            </select>
                            <button onClick={saveProfile}>Save</button>
                        </>
                    ) : (
                        <>
                            <p>Name: {basicInfo.name}</p>
                            <p>Username: {basicInfo.displayName}</p>
                            <p>Email: {basicInfo.email}</p>
                            <p>Phone: {basicInfo.phone}</p>
                            <p>Bio: {basicInfo.bio}</p>
                            <p>Location: {basicInfo.location}</p>
                            <p>Visibility: {basicInfo.visibility}</p>
                            <button onClick={toggleEditMode}>Edit Profile</button>
                        </>
                    )}
                </div>
            </div>
            <div className="friends-followers">
                <h2>Friends/Followers</h2>
                <ul>
                    <li>Friend 1</li>
                    <li>Friend 2</li>
                    <li>Follower 1</li>
                    <li>Follower 2</li>
                </ul>
                <button>Add/Remove Friends</button>
            </div>
            <div className="about-section">
                <h2>About</h2>
                <p>Detailed personal information...</p>
            </div>
        </div>
    );
}

export default ProfilePage;
