import mongoose from "mongoose";
import { connectDatabase } from "../config/database.js";

// Call the function to connect to the database
connectDatabase();

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

// Static method to create a new user
UserSchema.statics.createUser = async function(email, hash, displayName, socketId) {
    return this.create({
        email,
        hash,
        displayName,
        socketId,
        hasUnreadMessage: false,
        isOnline: true,
        admin: false
    });
};

// Access the model method from the mongoose connection
const User = mongoose.model("User", UserSchema);

export default User;
