import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
    createConversationCtrl,
    getConversationsCtrl,
    getMessagesCtrl,
    sendMessageCtrl
} from "./chat.controller";

const router = Router();

router.use(authMiddleware);

router.post("/conversation", createConversationCtrl);
router.get("/conversations", getConversationsCtrl);
router.get("/messages/:conversationId", getMessagesCtrl);
router.post("/messages/:conversationId", sendMessageCtrl);

export default router;
