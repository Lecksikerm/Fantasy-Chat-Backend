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
        attachments: {
            type: [String],
            default: []
        },

        seenBy: [
            {
                type: Types.ObjectId,
                ref: "User"
            }
        ],

        deliveredAt: {
            type: Date
        }
    },
    { timestamps: true }
);

export const Message = model("Message", messageSchema);

