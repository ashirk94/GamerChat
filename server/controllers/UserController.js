import asyncHandler from "express-async-handler";
import sharp from "sharp";
import User from "../models/UserModel.js";
import generateToken from "../utils/generateToken.js";

// Registers a new user
const registerUser = asyncHandler(async (req, res) => {
	const { displayName, email, password } = req.body;

	if (!displayName || !email || !password) {
		console.log("Missing fields for registration");
		res.status(400);
		throw new Error("Please enter all fields to register");
	}

	// Check if the user exists
	const userExists = await User.findOne({ email });

	if (userExists) {
		console.log("User already exists for email:", email);
		res.status(400);
		throw new Error("User already exists");
	}

	// Create the user without re-hashing the password
	const user = new User({
		displayName,
		email,
		password
	});

	await user.save();

	// JWT authentication
	if (user) {
		generateToken(res, user._id);
		res.status(201).json({
			_id: user.id,
			email: user.email,
			displayName: user.displayName
		});
	} else {
		console.log("Invalid user data for registration");
		res.status(400);
		throw new Error("Invalid user data");
	}
});

// Login with email and password
const loginUser = asyncHandler(async (req, res) => {
	const { email, password } = req.body;

	const user = await User.findOne({ email });

	if (!user) {
		console.log("User not found for email:", email);
		res.status(401);
		throw new Error("Invalid email or password");
	}

	const isMatch = await user.matchPassword(password);

	if (isMatch) {
		generateToken(res, user._id);
		return res.status(201).json({
			_id: user.id,
			email: user.email,
			displayName: user.displayName,
			fullName: user.fullName,
			phone: user.phone,
			bio: user.bio,
			location: user.location,
			visibility: user.visibility,
			profilePic: user.profilePic
		});
	} else {
		console.log("Invalid password for email:", email);
		res.status(401);
		throw new Error("Invalid email or password");
	}
});

const logoutUser = asyncHandler(async (req, res) => {
	res.cookie("jwt", "", {
		httpOnly: true,
		expires: new Date(0)
	});

	// delete all users for debugging
	//await User.deleteMany({});

	res.status(200).json({ message: "Logged out successfully" });
});

const updateUserProfile = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user._id);

	if (user) {
		user.fullName = req.body.fullName || user.fullName;
		user.displayName = req.body.displayName || user.displayName;
		user.email = req.body.email || user.email;
		user.phone = req.body.phone || user.phone;
		user.bio = req.body.bio || user.bio;
		user.location = req.body.location || user.location;
		user.visibility = req.body.visibility || user.visibility;
		user.profilePic = req.body.profilePic || user.profilePic;

		const updatedUser = await user.save();

		res.json({
			_id: updatedUser._id,
			fullName: updatedUser.fullName,
			displayName: updatedUser.displayName,
			email: updatedUser.email,
			phone: updatedUser.phone,
			bio: updatedUser.bio,
			location: updatedUser.location,
			visibility: updatedUser.visibility,
			profilePic: updatedUser.profilePic,
			token: req.token
		});
	} else {
		res.status(404);
		throw new Error("User not found");
	}
});

const getUserProfile = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user._id);
	console.log(user._id, user.displayName);

	if (user) {
		res.json({
			_id: user._id,
			fullName: user.fullName,
			displayName: user.displayName,
			email: user.email,
			phone: user.phone,
			bio: user.bio,
			location: user.location,
			visibility: user.visibility,
			profilePic: user.profilePic
		});
	} else {
		res.status(404);
		throw new Error("User not found");
	}
});

const checkUserExists = asyncHandler(async (req, res) => {
	const { displayName } = req.params;
	const user = await User.findOne({ displayName });
	if (!user) {
		res.status(404);
		throw new Error("User not found");
	}
	res.status(200).json({ message: "User found" });
});

export {
	registerUser,
	loginUser,
	logoutUser,
	checkUserExists,
	updateUserProfile,
	getUserProfile
};
