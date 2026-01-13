"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Conversation = void 0;
const mongoose_1 = require("mongoose");
const conversationSchema = new mongoose_1.Schema({
    participants: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "User",
            required: true
        }
    ],
    lastMessage: {
        type: mongoose_1.Types.ObjectId,
        ref: "Message"
    }
}, { timestamps: true });
exports.Conversation = (0, mongoose_1.model)("Conversation", conversationSchema);
