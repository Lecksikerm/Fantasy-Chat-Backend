import { Router, RequestHandler } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
    createConversationCtrl,
    getConversationsCtrl,
    getMessagesCtrl,
    sendMessageCtrl
} from "./chat.controller";

const router = Router();

router.use(authMiddleware as RequestHandler);

router.post("/conversation", createConversationCtrl as unknown as RequestHandler);
router.get("/conversations", getConversationsCtrl as unknown as RequestHandler);
router.get("/messages/:conversationId", getMessagesCtrl as unknown as RequestHandler);
router.post("/messages/:conversationId", sendMessageCtrl as unknown as RequestHandler);

export default router;
