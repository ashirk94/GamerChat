import jwt from "jsonwebtoken";

// Generates a JSON web token for authentication
function generateToken(res, userId) {
	const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
		expiresIn: "5d"
	});

    const secure = process.env.NODE_ENV === "production" ? true : false;

	res.cookie("jwt", token, {
		httpOnly: true,
		secure: secure,
		samesite: "strict",
		maxAge: 5 * 24 * 60 * 60 * 1000 // 5 days
	});
}

export default generateToken;
