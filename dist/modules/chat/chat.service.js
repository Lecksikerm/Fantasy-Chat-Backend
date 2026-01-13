"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = exports.getMessages = exports.getUserConversations = exports.createConversation = void 0;
const conversation_model_1 = require("../../models/conversation.model");
const message_model_1 = require("../../models/message.model");
const mongoose_1 = require("mongoose");
const createConversation = async (userId, otherUserId) => {
    const existing = await conversation_model_1.Conversation.findOne({
        participants: { $all: [new mongoose_1.Types.ObjectId(userId), new mongoose_1.Types.ObjectId(otherUserId)] }
    });
    if (existing)
        return existing;
    return conversation_model_1.Conversation.create({
        participants: [new mongoose_1.Types.ObjectId(userId), new mongoose_1.Types.ObjectId(otherUserId)]
    });
};
exports.createConversation = createConversation;
const getUserConversations = async (userId) => {
    return conversation_model_1.Conversation.find({
        participants: userId
    })
        .populate("participants", "username email")
        .populate("lastMessage")
        .sort({ updatedAt: -1 });
};
exports.getUserConversations = getUserConversations;
const getMessages = async (conversationId, userId) => {
    const convo = await conversation_model_1.Conversation.findById(conversationId);
    if (!convo || !convo.participants.some(id => id.equals(new mongoose_1.Types.ObjectId(userId)))) {
        throw new Error('Unauthorized');
    }
    return message_model_1.Message.find({ conversationId }).sort({ createdAt: 1 });
};
exports.getMessages = getMessages;
const sendMessage = async (conversationId, senderId, text, attachments = []) => {
    const message = await message_model_1.Message.create({
        conversationId: new mongoose_1.Types.ObjectId(conversationId),
        senderId: new mongoose_1.Types.ObjectId(senderId),
        text,
        attachments: attachments.map(url => ({ url }))
    });
    await conversation_model_1.Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: message._id
    });
    return message;
};
exports.sendMessage = sendMessage;
