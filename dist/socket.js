"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const message_model_1 = require("./models/message.model");
const user_model_1 = require("./models/user.model");
const redis_1 = require("./config/redis");
const initSocket = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: { origin: "*" }
    });
    /* ------------------ AUTH MIDDLEWARE ------------------ */
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token)
                return next(new Error("No token"));
            const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_ACCESS_SECRET);
            socket.data.userId = payload.userId;
            next();
        }
        catch {
            return next(new Error("Unauthorized"));
        }
    });
    /* ------------------ CONNECTION ------------------ */
    io.on("connection", async (socket) => {
        const userId = socket.data.userId;
        const socketKey = `user_sockets:${userId}`;
        // Track connected sockets count
        const count = await redis_1.redis.incr(socketKey);
        if (count === 1) {
            await redis_1.redis.sadd("online_users", userId);
            io.emit("user-online", { userId });
        }
        // Emit current online users
        const onlineUsers = await redis_1.redis.smembers("online_users");
        socket.emit("online-users", onlineUsers);
        /* ------------------ JOIN CONVERSATION ------------------ */
        socket.on("join-conversation", async (conversationId) => {
            socket.join(conversationId);
            // Mark delivered if user opened the chat
            await message_model_1.Message.updateMany({
                conversationId,
                senderId: { $ne: userId },
                status: "sent"
            }, { status: "delivered", deliveredAt: new Date() });
            socket.to(conversationId).emit("message-status-bulk", {
                status: "delivered"
            });
        });
        /* ------------------ SEND MESSAGE ------------------ */
        socket.on("send-message", async ({ conversationId, text, attachments = [] }) => {
            if (!conversationId || (!text && !attachments.length))
                return;
            const message = await message_model_1.Message.create({
                conversationId,
                senderId: userId,
                text,
                attachments,
                status: "sent"
            });
            // Send back to sender
            socket.emit("message-sent", message);
            // Deliver to others
            socket.to(conversationId).emit("new-message", message);
        });
        /* ------------------ EDIT MESSAGE ------------------ */
        socket.on("edit-message", async ({ messageId, newText }) => {
            const message = await message_model_1.Message.findById(messageId);
            if (!message)
                return;
            if (message.senderId.toString() !== userId)
                return;
            message.text = newText;
            message.isEdited = true;
            message.editedAt = new Date();
            await message.save();
            io.to(message.conversationId.toString()).emit("message-edited", {
                messageId,
                newText,
                editedAt: message.editedAt
            });
        });
        /* ------------------ DELETE FOR EVERYONE ------------------ */
        socket.on("delete-message-for-everyone", async ({ messageId }) => {
            const message = await message_model_1.Message.findById(messageId);
            if (!message)
                return;
            if (message.senderId.toString() !== userId)
                return;
            message.isDeleted = true;
            message.text = "This message was deleted";
            message.attachments = [];
            await message.save();
            io.to(message.conversationId.toString()).emit("message-deleted-for-everyone", { messageId });
        });
        /* ------------------ DELETE FOR ME ------------------ */
        socket.on("delete-message-for-me", async ({ messageId }) => {
            const message = await message_model_1.Message.findById(messageId);
            if (!message)
                return;
            if (!message.deletedFor.includes(userId)) {
                message.deletedFor.push(userId);
                await message.save();
            }
            socket.emit("message-deleted-for-me", { messageId });
        });
        /* ------------------ REACTIONS ------------------ */
        socket.on("toggle-reaction", async ({ messageId, emoji }) => {
            const message = await message_model_1.Message.findById(messageId);
            if (!message)
                return;
            const index = message.reactions.findIndex((r) => r.userId.toString() === userId && r.emoji === emoji);
            if (index >= 0) {
                message.reactions.splice(index, 1);
            }
            else {
                message.reactions.push({ userId, emoji, createdAt: new Date() });
            }
            await message.save();
            io.to(message.conversationId.toString()).emit("message-reactions-updated", { messageId, reactions: message.reactions });
        });
        /* ------------------ DELIVERED RECEIPTS ------------------ */
        socket.on("message-delivered", async ({ messageId }) => {
            const message = await message_model_1.Message.findById(messageId);
            if (!message)
                return;
            if (message.status === "sent") {
                message.status = "delivered";
                message.deliveredAt = new Date();
                await message.save();
                socket
                    .to(message.conversationId.toString())
                    .emit("message-status", { messageId, status: "delivered" });
            }
        });
        /* ------------------ SEEN ------------------ */
        socket.on("mark-seen", async ({ conversationId }) => {
            await message_model_1.Message.updateMany({
                conversationId,
                senderId: { $ne: userId },
                status: { $ne: "seen" }
            }, { status: "seen", seenAt: new Date() });
            socket.to(conversationId).emit("messages-seen", { conversationId });
        });
        /* ------------------ TYPING ------------------ */
        socket.on("typing", ({ conversationId }) => {
            socket.to(conversationId).emit("user-typing", { userId });
        });
        socket.on("stop-typing", ({ conversationId }) => {
            socket.to(conversationId).emit("user-stop-typing", { userId });
        });
        /* ------------------ UNREAD COUNT ------------------ */
        socket.on("get-unread-count", async ({ conversationId }) => {
            const unread = await message_model_1.Message.countDocuments({
                conversationId,
                senderId: { $ne: userId },
                status: { $ne: "seen" }
            });
            socket.emit("unread-count", { conversationId, count: unread });
        });
        /* ------------------ DISCONNECT ------------------ */
        socket.on("disconnect", async () => {
            const remaining = await redis_1.redis.decr(socketKey);
            if (remaining <= 0) {
                await redis_1.redis.del(socketKey);
                await redis_1.redis.srem("online_users", userId);
                const lastSeen = new Date();
                await user_model_1.User.findByIdAndUpdate(userId, { lastSeen });
                io.emit("user-offline", { userId, lastSeen });
                const updatedOnline = await redis_1.redis.smembers("online_users");
                io.emit("online-users", updatedOnline);
            }
            socket.broadcast.emit("user-stop-typing", { userId });
        });
    });
    return io;
};
exports.initSocket = initSocket;
