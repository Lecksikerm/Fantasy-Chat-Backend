import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import {
    createConversation,
    getUserConversations,
    getMessages,
    sendMessage
} from "./chat.service";

export const createConversationCtrl = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const { otherUserId } = req.body;
        const convo = await createConversation(req.userId!, otherUserId);
        res.status(201).json(convo);
    } catch (e: any) {
        res.status(400).json({ message: e.message });
    }
};

export const getConversationsCtrl = async (
    req: AuthRequest,
    res: Response
) => {
    const convos = await getUserConversations(req.userId!);
    res.json(convos);
};

export const getMessagesCtrl = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const messages = await getMessages(
            req.params.conversationId,
            req.userId!
        );
        res.json(messages);
    } catch (e: any) {
        res.status(403).json({ message: e.message });
    }
};

export const sendMessageCtrl = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const { text } = req.body;
        const message = await sendMessage(
            req.params.conversationId,
            req.userId!,
            text
        );
        res.status(201).json(message);
    } catch (e: any) {
        res.status(400).json({ message: e.message });
    }
};
