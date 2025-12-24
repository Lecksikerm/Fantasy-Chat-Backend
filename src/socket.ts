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
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", async (socket) => {
    const userId: string = socket.data.userId;
    const socketKey = `user_sockets:${userId}`;

    const count = await redis.incr(socketKey);
    if (count === 1) {
      await redis.sadd("online_users", userId);
      io.emit("user-online", { userId });
    }

    const onlineUsers = await redis.smembers("online_users");
    socket.emit("online-users", onlineUsers);

    socket.on("disconnect", async () => {
      const remaining = await redis.decr(socketKey);

      if (remaining <= 0) {
        await redis.del(socketKey);
        await redis.srem("online_users", userId);

        const lastSeen = new Date();
        await User.findByIdAndUpdate(userId, { lastSeen });

        io.emit("user-offline", { userId, lastSeen });
      }

      socket.broadcast.emit("user-stop-typing", { userId });
    });

    socket.on("join-conversation", (conversationId: string) => {
      socket.join(conversationId);
    });

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

        socket.emit("message-sent", message);
        socket.to(conversationId).emit("new-message", message);
      }
    );

    socket.on(
      "edit-message",
      async ({ messageId, newText }) => {
        const message = await Message.findById(messageId);
        if (!message) return;
        if (message.senderId.toString() !== userId) return;
        if (message.isDeleted) return;

        message.text = newText;
        message.isEdited = true;
        message.editedAt = new Date();
        await message.save();

        io.to(message.conversationId.toString()).emit("message-edited", {
          messageId,
          newText,
          editedAt: message.editedAt
        });
      }
    );

    socket.on(
      "delete-message-for-everyone",
      async ({ messageId }) => {
        const message = await Message.findById(messageId);
        if (!message) return;
        if (message.senderId.toString() !== userId) return;
        if (message.isDeleted) return;

        message.isDeleted = true;
        message.text = "This message was deleted";
        message.attachments.splice(0);
        await message.save();

        io.to(message.conversationId.toString()).emit(
          "message-deleted-for-everyone",
          { messageId }
        );
      }
    );

    socket.on(
      "delete-message-for-me",
      async ({ messageId }) => {
        const message = await Message.findById(messageId);
        if (!message) return;

        if (!message.deletedFor.includes(userId as any)) {
          message.deletedFor.push(userId as any);
          await message.save();
        }

        socket.emit("message-deleted-for-me", { messageId });
      }
    );

    socket.on(
      "toggle-reaction",
      async ({ messageId, emoji }) => {
        const message = await Message.findById(messageId);
        if (!message) return;

        const idx = message.reactions.findIndex(
          r =>
            r.userId.toString() === userId &&
            r.emoji === emoji
        );

        if (idx > -1) {
          message.reactions.splice(idx, 1);
        } else {
          message.reactions.push({ userId, emoji });
        }

        await message.save();

        io.to(message.conversationId.toString()).emit(
          "message-reactions-updated",
          {
            messageId,
            reactions: message.reactions
          }
        );
      }
    );

    socket.on(
      "message-delivered",
      async ({ messageId }) => {
        const message = await Message.findById(messageId);
        if (!message) return;

        if (message.status === "sent") {
          message.status = "delivered";
          await message.save();

          socket.to(message.conversationId.toString()).emit(
            "message-status",
            { messageId, status: "delivered" }
          );
        }
      }
    );

    socket.on(
      "mark-seen",
      async ({ conversationId }) => {
        await Message.updateMany(
          {
            conversationId,
            senderId: { $ne: userId },
            status: { $ne: "seen" }
          },
          { status: "seen", seenAt: new Date() }
        );

        socket.to(conversationId).emit("messages-seen", {
          conversationId
        });
      }
    );

    socket.on("typing", ({ conversationId }) => {
      socket.to(conversationId).emit("user-typing", { userId });
    });

    socket.on("stop-typing", ({ conversationId }) => {
      socket.to(conversationId).emit("user-stop-typing", { userId });
    });
  });

  return io;
};







