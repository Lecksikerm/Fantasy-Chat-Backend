import { Router, RequestHandler } from "express";
import {authMiddleware } from "../middlewares/auth.middleware";
import { getMessages } from "../controllers/message.controller";

const router = Router();

router.get(
    "/conversations/:conversationId/messages",
    authMiddleware as RequestHandler,
    getMessages as unknown as RequestHandler
);

export default router;
