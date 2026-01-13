"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const mongoose_1 = require("mongoose");
const messageSchema = new mongoose_1.Schema({
    conversationId: {
        type: mongoose_1.Types.ObjectId,
        ref: "Conversation",
        required: true,
        index: true
    },
    senderId: {
        type: mongoose_1.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    text: String,
    attachments: [
        {
            url: String,
            type: {
                type: String,
                enum: ["image", "file", "audio"],
                required: true
            }
        }
    ],
    reactions: [
        {
            userId: {
                type: mongoose_1.Types.ObjectId,
                ref: "User",
                required: true
            },
            emoji: {
                type: String,
                required: true
            }
        }
    ],
    status: {
        type: String,
        enum: ["sent", "delivered", "seen"],
        default: "sent"
    },
    isEdited: {
        type: Boolean,
        default: false
    },
    editedAt: Date,
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedFor: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "User"
        }
    ],
    seenAt: Date
}, { timestamps: true });
messageSchema.index({ conversationId: 1, createdAt: -1 });
exports.Message = (0, mongoose_1.model)("Message", messageSchema);
