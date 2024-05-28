import asyncHandler from "express-async-handler";
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
			displayName: user.displayName
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

	res.status(200).json({ message: "Logged out successfully" });
});

const updateUserProfile = asyncHandler(async (req, res) => {
	try {
		const user = await User.findById(req.user._id);

		if (user) {
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
				profilePicture: updatedUser.profilePicture
					? {
							data: updatedUser.profilePicture.data.toString(
								"base64"
							),
							contentType: updatedUser.profilePicture.contentType
					  }
					: null
			});
		} else {
			res.status(404);
			throw new Error("User not found");
		}
	} catch (error) {
		console.error("Error updating user profile:", error);
		res.status(500).send({ message: "Internal Server Error" });
	}
});

const getUserProfile = asyncHandler(async (req, res) => {
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
			profilePicture: user.profilePicture
				? {
						data: user.profilePicture.data.toString("base64"),
						contentType: user.profilePicture.contentType
				  }
				: null
		});
	} else {
		res.status(404).send("User not found, cannot get user data");
	}
});

export {
	registerUser,
	loginUser,
	logoutUser,
	updateUserProfile,
	getUserProfile
};
