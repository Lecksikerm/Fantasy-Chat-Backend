"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const mongoose_1 = require("mongoose");
const attachmentSchema = new mongoose_1.Schema({
    url: { type: String },
    type: { type: String, enum: ["image", "file", "audio"], required: true }
}, { _id: false });
const reactionSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Types.ObjectId, ref: "User", required: true },
    emoji: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
}, { _id: false });
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
    text: { type: String },
    attachments: { type: [attachmentSchema], default: [] },
    reactions: { type: [reactionSchema], default: [] },
    status: {
        type: String,
        enum: ["sent", "delivered", "seen"],
        default: "sent"
    },
    isEdited: {
        type: Boolean,
        default: false
    },
    editedAt: { type: Date },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedFor: { type: [{ type: mongoose_1.Types.ObjectId, ref: "User" }], default: [] },
    seenAt: { type: Date },
    deliveredAt: { type: Date }
}, { timestamps: true });
messageSchema.index({ conversationId: 1, createdAt: -1 });
exports.Message = (0, mongoose_1.model)("Message", messageSchema);
