import asyncHandler from "express-async-handler";
import Group from "../models/GroupModel.js";
import User from '../models/UserModel.js';
import Message from '../models/MessageModel.js';

const createGroup = async (req, res) => {
    const { name, userIds } = req.body;

    try {
        const newGroup = new Group({
            name,
            users: userIds,
            createdBy: req.user._id,
        });

        const savedGroup = await newGroup.save();

        // Add the group reference to each user
        await User.updateMany(
            { _id: { $in: userIds } },
            { $push: { groups: savedGroup._id } }
        );

        res.status(201).json(savedGroup);
    } catch (error) {
        console.error("Error creating group:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getGroups = async (req, res) => {
	try {
		const groups = await Group.find({ users: req.user._id });
		res.json(groups);
	} catch (error) {
		console.error("Error fetching groups:", error);
		res.status(500).json({ message: "Server Error" });
	}
};

const getGroupById = asyncHandler(async (req, res) => {
	const group = await Group.findById(req.params.id).populate(
		"users",
		"displayName"
	);

	if (group) {
		res.json(group);
	} else {
		res.status(404);
		throw new Error("Group not found");
	}
});

const addUserToGroup = asyncHandler(async (req, res) => {
	const group = await Group.findById(req.params.id);

	if (!group) {
		res.status(404);
		throw new Error("Group not found");
	}

	const user = await User.findById(req.body.userId);

	if (!user) {
		res.status(404);
		throw new Error("User not found");
	}

	if (!group.users.includes(user._id)) {
		group.users.push(user._id);
		await group.save();

		user.groups.push(group._id);
		await user.save();
	}

	res.status(200).json(group);
});

const getGroupMessages = async (req, res) => {
    const { groupId } = req.params;

    try {
        const messages = await Message.find({ recipientGroup: groupId }).populate('user', 'displayName');
        if (!messages) {
            return res.status(404).json({ message: 'Group not found or no messages' });
        }

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching group messages:", error);
        res.status(500).json({ message: 'Server error' });
    }
};


const sendMessageToGroup = async (req, res) => {
    const { message, sender } = req.body;
    const { groupId } = req.params;

    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const newMessage = new Message({
            user: req.user._id,
            text: message,
            sender,
            recipientGroup: groupId,
            seen: false
        });

        await newMessage.save();

        group.messages.push(newMessage._id);
        await group.save();

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error sending message to group:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

export {
	createGroup,
	getGroups,
	getGroupById,
	addUserToGroup,
	getGroupMessages,
	sendMessageToGroup
};
