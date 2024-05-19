import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/UserModel.js";

// May remove this middleware

// Checks if the user is authorized
const auth = asyncHandler(async (req, res, next) => {
	let token;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		try {
			// Gets the token from headers
			token = req.headers.authorization.split(" ")[1];

			// Verifies the token
			const decoded = jwt.verify(token, process.env.JWT_SECRET);

			// Gets the user from the token
			req.user = await User.findById(decoded.id).select("-password");

			next();
		} catch (error) {
			console.log(error);
			res.status(401);
			throw new Error("Not authorized");
		}
	}

	if (!token) {
		res.status(401);
		throw new Error("Not authorized, no token");
	}
});

export { auth };
