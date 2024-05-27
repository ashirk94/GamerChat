import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/UserModel.js";

const protect = asyncHandler(async (req, res, next) => {
	let token;

	if (req.cookies && req.cookies.jwt) {
		// Retrieves token from cookie
		token = req.cookies.jwt;
		try {
			const decoded = jwt.verify(token, process.env.JWT_SECRET);
			// Retrieves user from token
			req.user = await User.findById(decoded.userId).select("-password");

			if (!req.user) {
				res.status(404);
				throw new Error("User not found");
			}
			next();
		} catch (error) {
			console.error(error);
			res.status(401);
			throw new Error("Not authorized, token failed");
		}
	} else {
		res.status(401);
		throw new Error("Not authorized, no token");
	}
});

export { protect };
