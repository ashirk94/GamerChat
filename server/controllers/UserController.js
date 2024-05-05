import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/UserModel.js";

// Registers a new user
async function registerUser(req, res) {
	const { name, email, password } = req.body;

	if (!name || !email || !password) {
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
		name,
		email,
		password: hashedPassword
	});

	// JWT authentication
	if (user) {
		res.status(201).json({
			_id: user.id,
			email: user.email,
			token: generateToken(user._id)
		});
	} else {
		res.status(400);
		throw new Error("Invalid user data");
	}
}

// Login with email and password
async function loginUser(req, res) {
	const { email, password } = req.body;

	const user = await User.findOne({ email });

	// Uses bcrypt to compare the passwords
	if (user && (await bcrypt.compare(password, user.password))) {
		res.json({
			_id: user.id,
			email: user.email
		});
	} else {
		res.status(400);
		throw new Error("Invalid credentials");
	}
}

// Generates a JSON web token for authentication
function generateToken(id) {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: "5d"
	});


}

export { registerUser, loginUser };
