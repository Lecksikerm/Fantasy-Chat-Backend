"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessages = void 0;
const mongoose_1 = require("mongoose");
const message_model_1 = require("../models/message.model");
const getMessages = async (req, res) => {
    const userId = req.userId;
    const { conversationId } = req.params;
    const cursor = req.query.cursor;
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    if (!mongoose_1.Types.ObjectId.isValid(conversationId)) {
        return res.status(400).json({ message: "Invalid conversationId" });
    }
    const query = {
        conversationId: new mongoose_1.Types.ObjectId(conversationId),
        isDeleted: false,
        deletedFor: { $ne: userId }
    };
    if (cursor) {
        query.createdAt = { $lt: new Date(cursor) };
    }
    const messages = await message_model_1.Message.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("senderId", "name avatar")
        .lean();
    res.json({
        messages,
        nextCursor: messages.length
            ? messages[messages.length - 1].createdAt
            : null
    });
};
exports.getMessages = getMessages;
