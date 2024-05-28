import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

// User model
const UserSchema = new Schema(
	{
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		displayName: { type: String, required: true },
		profilePicture: {
			data: Buffer,
			contentType: String
		},
		socketId: String,
		hasUnreadMessage: Boolean,
		isOnline: Boolean,
		admin: Boolean,
		fullName: String,
		phone: String,
		bio: String,
		location: String,
		visibility: {
			type: String,
			default: "Public"
		}
	},
	{ timestamps: true }
);

// Hashes the password before saving it to the database
UserSchema.pre("save", async function (next) {
	if (!this.isModified("password")) {
		return next();
	}

	try {
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error) {
		return next(error);
	}
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
	const isMatch = await bcrypt.compare(enteredPassword, this.password);
	return isMatch;
};

// Creates user model
const User = mongoose.model("User", UserSchema);

export default User;
