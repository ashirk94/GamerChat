import mongoose from "mongoose";

const { Schema } = mongoose;

const groupSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        users: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        messages: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Message"
            }
        ]
    },
    {
        timestamps: true,
    }
);
const Group = mongoose.model("Group", groupSchema);

export default Group;
