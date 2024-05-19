import mongoose from "mongoose";

const { Schema } = mongoose;

// Message model
const MessageSchema = new Schema(
	{
		user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
		text: { type: String, required: true },
		sender: String,
		recipient: String,
		seen: Boolean
	},
	{ timestamps: true }
);

const Message = mongoose.model("Message", MessageSchema);

export default Message;
