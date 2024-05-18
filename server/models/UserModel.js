import mongoose from "mongoose";
import database from "../config/database.js";

const { Schema } = mongoose;

// User model
const UserSchema = new Schema(
	{
		email: String,
		hash: String,
		profilePic: {
			data: Buffer,
			contentType: String
		},
		displayName: String,
		socketId: String,
		hasUnreadMessage: Boolean,
		isOnline: Boolean,
		admin: Boolean
	},
	{ timestamps: true }
);

// Creates user model
const User = database.model("User", UserSchema);

export default User;
