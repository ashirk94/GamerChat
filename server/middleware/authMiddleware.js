import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/UserModel.js";

const protect = asyncHandler(async (req, res, next) => {
	let token;

	if (req.cookies && req.cookies.jwt) {
		token = req.cookies.jwt;
		try {
			const decoded = jwt.verify(token, process.env.JWT_SECRET);
			const userId = decoded.id;

			// Queries the user with the id from the token
			req.user = await User.findById(userId).select("-password");

			if (!req.user) {
				console.error("User not found for ID:", userId);
				res.status(404);
				throw new Error(`User not found for ID: ${userId}`);
			}
			next();
		} catch (error) {
			console.error("Token verification failed:", error);
			res.status(401);
			throw new Error("Not authorized, token failed");
		}
	} else {
		console.error("No token found");
		res.status(401);
		throw new Error("Not authorized, no token");
	}
});

export { protect };
