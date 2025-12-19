import { Conversation } from "../../models/conversation.model";
import { Message } from "../../models/message.model";
import { Types } from "mongoose";

export const createConversation = async (
    userId: string,
    otherUserId: string
) => {
    const existing = await Conversation.findOne({
        participants: { $all: [new Types.ObjectId(userId), new Types.ObjectId(otherUserId)] }
    });

    if (existing) return existing;

    return Conversation.create({
        participants: [new Types.ObjectId(userId), new Types.ObjectId(otherUserId)]
    });
};

export const getUserConversations = async (userId: string) => {
    return Conversation.find({
        participants: userId
    })
        .populate("participants", "username email")
        .populate("lastMessage")
        .sort({ updatedAt: -1 });
};

export const getMessages = async (
    conversationId: string,
    userId: string
) => {
    const convo = await Conversation.findById(conversationId);
    if (!convo || !convo.participants.some(id => id.equals(new Types.ObjectId(userId)))) {
        throw new Error('Unauthorized');
    }

    return Message.find({ conversationId }).sort({ createdAt: 1 });
};

export const sendMessage = async (
    conversationId: string,
    senderId: string,
    text?: string,
    attachments: string[] = []
) => {
    const message = await Message.create({
        conversationId,
        senderId,
        text,
        attachments
    });

    await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: message._id
    });

    return message;
};
