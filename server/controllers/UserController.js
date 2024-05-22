import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import User from "../models/UserModel.js";
import generateToken from "../utils/generateToken.js";

// Authenticates a user
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    console.log("Login attempt:", { email, password });

    const user = await User.findOne({ email });

    if (!user) {
        console.log("User not found for email:", email);
        res.status(401);
        throw new Error("Invalid email or password");
    }

    const isMatch = await user.matchPassword(password);
 

    if (isMatch) {
        console.log("User authenticated, generating token");
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

// Registers a new user
const registerUser = asyncHandler(async (req, res) => {
    //await User.deleteMany({}); // Deletes all users
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
        console.log("User authenticated, generating token");
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

const getUserProfile = asyncHandler(async (req, res) => {
    res.status(200).json({ message: "User profile" });
});

const updateUserProfile = asyncHandler(async (req, res) => {
    res.status(200).json({ message: "Update user profile" });
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
    authUser,
    checkUserExists,
    getUserProfile,
    updateUserProfile
};
