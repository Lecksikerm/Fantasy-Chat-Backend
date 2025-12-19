import { Schema, model, Types } from "mongoose";

const messageSchema = new Schema(
    {
        conversationId: {
            type: Types.ObjectId,
            ref: "Conversation",
            required: true
        },
        senderId: {
            type: Types.ObjectId,
            ref: "User",
            required: true
        },
        text: {
            type: String
        },
        attachments: [
            {
                type: String 
            }
        ],
        seenBy: [
            {
                type: Types.ObjectId,
                ref: "User"
            }
        ]
    },
    { timestamps: true }
);

export const Message = model("Message", messageSchema);
