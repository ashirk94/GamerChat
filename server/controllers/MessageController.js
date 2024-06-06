import asyncHandler from "express-async-handler";
import Message from "../models/MessageModel.js";

// Save a message
const saveMessage = asyncHandler(async (req, res) => {
	const { user, text, sender, recipient, seen } = req.body;
	const message = new Message({ user, text, sender, recipient, seen });
	const savedMessage = await message.save();
	res.status(201).json(savedMessage);
});

// Get messages for a user
const getMessages = asyncHandler(async (req, res) => {
	const { displayName } = req.params;
	const messages = await Message.find({
		$or: [{ sender: displayName }, { recipient: displayName }],
		deletedBy: { $ne: displayName } // Exclude messages deleted by the user
	}).sort({ createdAt: 1 }); // Sort by creation time
	res.status(200).json(messages);
});

// Clear messages for a user with a specific recipient
const clearMessages = asyncHandler(async (req, res) => {
	const { displayName, recipient } = req.body;
	await Message.deleteMany({
		$or: [
			{ sender: displayName, recipient },
			{ sender: recipient, recipient: displayName }
		]
	});
	res.status(200).json({ message: "Chat history cleared." });
});

// Mark messages as seen
const markMessagesAsSeen = asyncHandler(async (req, res) => {
	const { user, recipient } = req.body;
	await Message.updateMany(
		{
			$or: [
				{ sender: user, recipient: recipient },
				{ sender: recipient, recipient: user }
			],
			seen: false
		},
		{ seen: true }
	);
	res.status(200).json({ message: "Messages marked as seen." });
});

// Delete messages for a user with a specific recipient
const deleteMessages = asyncHandler(async (req, res) => {
	const { displayName, recipient } = req.body;
	await Message.updateMany(
		{
			$or: [
				{ sender: displayName, recipient },
				{ sender: recipient, recipient: displayName }
			]
		},
		{ $addToSet: { deletedBy: displayName } } // Add the user to the deletedBy array
	);
	res.status(200).json({ message: "Chat history deleted for user." });
});

export {
	saveMessage,
	getMessages,
	clearMessages,
	markMessagesAsSeen,
	deleteMessages
};
