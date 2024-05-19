import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import User from "../models/UserModel.js";
import generateToken from "../utils/generateToken.js";

// Authenticates a user
const authUser = asyncHandler(async (req, res) => {
	const { email, password } = req.body;

	const user = await User.findOne({ email });

	if (user && (await user.matchPassword(password))) {
		generateToken(res, user._id);
		res.status(201).json({
			_id: user.id,
			email: user.email,
			displayName: user.displayName
		});
	} else {
		res.status(401);
		throw new Error("Invalid email or password");
	}
});

const logoutUser = asyncHandler(async (req, res) => {
	res.cookie("jwt", "", {
		httpOnly: true,
		expires: new Date(0)
	});
	res.status(200).json({ message: "Logged out successfully" });
});

const getUserProfile = asyncHandler(async (req, res) => {
	res.status(200).json({ message: "User profile" });
});

const updateUserProfile = asyncHandler(async (req, res) => {
	res.status(200).json({ message: "Update user profile" });
});

// Registers a new user
const registerUser = asyncHandler(async (req, res) => {
	await User.deleteMany({}); // Deletes all users
	const { displayName, email, password } = req.body;

	if (!displayName || !email || !password) {
		res.status(400);
		throw new Error("Please enter all fields to register");
	}

	// Check if the user exists
	const userExists = await User.findOne({ email });

	if (userExists) {
		res.status(400);
		throw new Error("User already exists");
	}

	// Hash the password
	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(password, salt);

	// Create the user
	const user = await User.create({
		displayName,
		email,
		password: hashedPassword
	});

	// JWT authentication
	if (user) {
		generateToken(res, user._id);
		res.status(201).json({
			_id: user.id,
			email: user.email,
			displayName: user.displayName
		});
	} else {
		res.status(400);
		throw new Error("Invalid user data");
	}
});

// Login with email and password
const loginUser = asyncHandler(async (req, res) => {
	const { email, password } = req.body;

	const user = await User.findOne({ email });

	// Uses bcrypt to compare the passwords
	if (user && (await bcrypt.compare(password, user.password))) {
		generateToken(res, user._id);
		res.json({
			_id: user.id,
			email: user.email,
			displayName: user.displayName
		});
	} else {
		res.status(400);
		throw new Error("Invalid credentials");
	}
});

export {
	registerUser,
	loginUser,
	logoutUser,
	authUser,
	getUserProfile,
	updateUserProfile
};
