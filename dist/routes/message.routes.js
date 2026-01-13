"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const message_controller_1 = require("../controllers/message.controller");
const router = (0, express_1.Router)();
router.get("/conversations/:conversationId/messages", auth_middleware_1.authMiddleware, message_controller_1.getMessages);
exports.default = router;
