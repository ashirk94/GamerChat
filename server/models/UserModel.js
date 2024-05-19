import mongoose from "mongoose";

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

// Hashes the password before saving it to the database
UserSchema.pre("save", async function (next) {
	if (!this.isModified("password")) {
		next();
	}

	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

// Creates user model
const User = mongoose.model("User", UserSchema);

export default User;
