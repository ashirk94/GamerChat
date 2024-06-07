import asyncHandler from "express-async-handler";
import User from "../models/UserModel.js";
import generateToken from "../utils/generateToken.js";

// Registers a new user
const registerUser = asyncHandler(async (req, res) => {
	const { displayName, email, password } = req.body;

	if (!displayName || !email || !password) {
		res.status(400);
		throw new Error("Please enter all fields to register");
	}

	const userExists = await User.findOne({ email });

	if (userExists) {
		res.status(400);
		throw new Error("User already exists");
	}

	const user = new User({ displayName, email, password });

	await user.save();

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

	if (!user) {
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
			profilePicture: user.profilePicture
				? {
						data:
							user.profilePicture.data.toString("base64") || null,
						contentType: user.profilePicture.contentType
				  }
				: null
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

const updateUserProfile = asyncHandler(async (req, res) => {
	try {
		const user = await User.findById(req.user._id);

		if (!user) {
			console.error("User not found with ID:", req.user._id);
			res.status(404).json({ message: "User not found" });
			return;
		}

		user.displayName = req.body.displayName || user.displayName;
		user.fullName = req.body.fullName || user.fullName;
		user.location = req.body.location || user.location;
		user.bio = req.body.bio || user.bio;
		user.phone = req.body.phone || user.phone;
		user.email = req.body.email || user.email;
		user.visibility = req.body.visibility || user.visibility;

		if (req.file) {
			user.profilePicture = {
				data: req.file.buffer,
				contentType: req.file.mimetype
			};
		}

		const updatedUser = await user.save();

		res.json({
			_id: updatedUser._id,
			displayName: updatedUser.displayName,
			fullName: updatedUser.fullName,
			location: updatedUser.location,
			bio: updatedUser.bio,
			phone: updatedUser.phone,
			email: updatedUser.email,
			visibility: updatedUser.visibility,
			profilePicture:
				updatedUser.profilePicture && updatedUser.profilePicture.data
					? {
							data: updatedUser.profilePicture.data.toString(
								"base64"
							),
							contentType: updatedUser.profilePicture.contentType
					  }
					: null
		});
	} catch (error) {
		console.error("Error updating user profile:", error);
		res.status(500).send({
			message: "Internal Server Error",
			error: error.message
		});
	}
});

const getUserProfile = asyncHandler(async (req, res, next) => {
	try {
		const user = await User.findById(req.user._id);
		if (user) {
			res.json({
				_id: user._id,
				name: user.name,
				email: user.email,
				displayName: user.displayName,
				visibility: user.visibility,
				fullName: user.fullName,
				bio: user.bio,
				location: user.location,
				phone: user.phone,
				profilePicture:
					user.profilePicture && user.profilePicture.data
						? {
								data: user.profilePicture.data.toString(
									"base64"
								),
								contentType: user.profilePicture.contentType
						  }
						: null
			});
		} else {
			res.status(404).send("User not found, cannot get user data");
		}
	} catch (error) {
		console.error("Error fetching user profile:", error);
		next(error); // Passes the error to the error handling middleware
	}
});

const getUserByDisplayName = asyncHandler(async (req, res) => {
	const user = await User.findOne({ displayName: req.params.displayName });

	if (user) {
		res.json(user);
	} else {
		res.status(404);
		throw new Error("User not found");
	}
});

export {
	registerUser,
	loginUser,
	logoutUser,
	updateUserProfile,
	getUserByDisplayName,
	getUserProfile
};
