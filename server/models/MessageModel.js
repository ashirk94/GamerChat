import mongoose from "mongoose";

const { Schema } = mongoose;

// Message model
const MessageSchema = new Schema(
	{
		user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
		text: { type: String, required: true },
		sender: String,
		recipient: String,
		seen: Boolean,
		timestamp: {
			type: Date,
			default: Date.now
		},
		deletedBy: { type: [String], default: [] } // Array of users who have deleted the message
	},
	{ timestamps: true }
);

const Message = mongoose.model("Message", MessageSchema);

export default Message;
