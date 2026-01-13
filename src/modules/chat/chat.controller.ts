import { Request, Response } from "express"; 
import { createConversation, getMessages, getUserConversations, sendMessage } from "./chat.service";

interface CreateConversationRequest extends Request {
    body: {
        otherUserId: string; 
    };
}

export const createConversationCtrl = async (
    req: CreateConversationRequest,  
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
    req: Request,  
    res: Response
) => {
    const convos = await getUserConversations(req.userId!);
    res.json(convos);
};

export const getMessagesCtrl = async (
    req: Request,  
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
    req: Request,  
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