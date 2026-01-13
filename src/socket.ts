import { Server } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";
import { Message } from "./models/message.model";
import { User } from "./models/user.model";
import { redis } from "./config/redis";

interface SocketUserPayload {
  userId: string;
}

export const initSocket = (server: http.Server) => {
  const io = new Server(server, {
    cors: { origin: "*" }
  });

  /* ------------------ AUTH MIDDLEWARE ------------------ */
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token"));

      const payload = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET!
      ) as SocketUserPayload;

      socket.data.userId = payload.userId;
      next();
    } catch {
      return next(new Error("Unauthorized"));
    }
  });

  /* ------------------ CONNECTION ------------------ */
  io.on("connection", async (socket) => {
    const userId = socket.data.userId;
    const socketKey = `user_sockets:${userId}`;

    // Track connected sockets count
    const count = await redis.incr(socketKey);

    if (count === 1) {
      await redis.sadd("online_users", userId);
      io.emit("user-online", { userId });
    }

    // Emit current online users
    const onlineUsers = await redis.smembers("online_users");
    socket.emit("online-users", onlineUsers);

    /* ------------------ JOIN CONVERSATION ------------------ */
    socket.on("join-conversation", async (conversationId: string) => {
      socket.join(conversationId);

      // Mark delivered if user opened the chat
      await Message.updateMany(
        {
          conversationId,
          senderId: { $ne: userId },
          status: "sent"
        },
        { status: "delivered", deliveredAt: new Date() }
      );

      socket.to(conversationId).emit("message-status-bulk", {
        status: "delivered"
      });
    });

    /* ------------------ SEND MESSAGE ------------------ */
    socket.on(
      "send-message",
      async ({ conversationId, text, attachments = [] }) => {
        if (!conversationId || (!text && !attachments.length)) return;

        const message = await Message.create({
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
      }
    );

    /* ------------------ EDIT MESSAGE ------------------ */
    socket.on("edit-message", async ({ messageId, newText }) => {
      const message = await Message.findById(messageId);
      if (!message) return;
      if (message.senderId.toString() !== userId) return;

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
      const message = await Message.findById(messageId);
      if (!message) return;
      if (message.senderId.toString() !== userId) return;

      message.isDeleted = true;
      message.text = "This message was deleted";
      message.attachments = [];
      await message.save();

      io.to(message.conversationId.toString()).emit(
        "message-deleted-for-everyone",
        { messageId }
      );
    });

    /* ------------------ DELETE FOR ME ------------------ */
    socket.on("delete-message-for-me", async ({ messageId }) => {
      const message = await Message.findById(messageId);
      if (!message) return;

      if (!message.deletedFor.includes(userId)) {
        message.deletedFor.push(userId);
        await message.save();
      }

      socket.emit("message-deleted-for-me", { messageId });
    });

    /* ------------------ REACTIONS ------------------ */
    socket.on("toggle-reaction", async ({ messageId, emoji }) => {
      const message = await Message.findById(messageId);
      if (!message) return;

      const index = message.reactions.findIndex(
        (r) => r.userId.toString() === userId && r.emoji === emoji
      );

      if (index >= 0) {
        message.reactions.splice(index, 1);
      } else {
        message.reactions.push({ userId, emoji, createdAt: new Date() });
      }

      await message.save();

      io.to(message.conversationId.toString()).emit(
        "message-reactions-updated",
        { messageId, reactions: message.reactions }
      );
    });

    /* ------------------ DELIVERED RECEIPTS ------------------ */
    socket.on("message-delivered", async ({ messageId }) => {
      const message = await Message.findById(messageId);
      if (!message) return;

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
      await Message.updateMany(
        {
          conversationId,
          senderId: { $ne: userId },
          status: { $ne: "seen" }
        },
        { status: "seen", seenAt: new Date() }
      );

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
      const unread = await Message.countDocuments({
        conversationId,
        senderId: { $ne: userId },
        status: { $ne: "seen" }
      });

      socket.emit("unread-count", { conversationId, count: unread });
    });

    /* ------------------ DISCONNECT ------------------ */
    socket.on("disconnect", async () => {
      const remaining = await redis.decr(socketKey);

      if (remaining <= 0) {
        await redis.del(socketKey);
        await redis.srem("online_users", userId);

        const lastSeen = new Date();
        await User.findByIdAndUpdate(userId, { lastSeen });

        io.emit("user-offline", { userId, lastSeen });

        const updatedOnline = await redis.smembers("online_users");
        io.emit("online-users", updatedOnline);
      }

      socket.broadcast.emit("user-stop-typing", { userId });
    });
  });

  return io;
};








