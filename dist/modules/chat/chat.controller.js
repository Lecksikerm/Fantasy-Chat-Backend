"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessageCtrl = exports.getMessagesCtrl = exports.getConversationsCtrl = exports.createConversationCtrl = void 0;
const chat_service_1 = require("./chat.service");
const createConversationCtrl = async (req, res) => {
    try {
        const { otherUserId } = req.body;
        const convo = await (0, chat_service_1.createConversation)(req.userId, otherUserId);
        res.status(201).json(convo);
    }
    catch (e) {
        res.status(400).json({ message: e.message });
    }
};
exports.createConversationCtrl = createConversationCtrl;
const getConversationsCtrl = async (req, res) => {
    const convos = await (0, chat_service_1.getUserConversations)(req.userId);
    res.json(convos);
};
exports.getConversationsCtrl = getConversationsCtrl;
const getMessagesCtrl = async (req, res) => {
    try {
        const messages = await (0, chat_service_1.getMessages)(req.params.conversationId, req.userId);
        res.json(messages);
    }
    catch (e) {
        res.status(403).json({ message: e.message });
    }
};
exports.getMessagesCtrl = getMessagesCtrl;
const sendMessageCtrl = async (req, res) => {
    try {
        const { text } = req.body;
        const message = await (0, chat_service_1.sendMessage)(req.params.conversationId, req.userId, text);
        res.status(201).json(message);
    }
    catch (e) {
        res.status(400).json({ message: e.message });
    }
};
exports.sendMessageCtrl = sendMessageCtrl;
