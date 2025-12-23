import { Server } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";
import { Message } from "./models/message.model";
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
      if (!token) {
        return next(new Error("No token provided"));
      }

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

    await redis.sadd("online_users", userId);
    console.log(`🟢 User online: ${userId}`);
    io.emit("user-online", userId);

    socket.on("join-conversation", (conversationId: string) => {
      console.log(`${userId} joined conversation ${conversationId}`);
      socket.join(conversationId);
    });


    socket.on(
      "get-unread-count",
      async ({ conversationId }: { conversationId: string }) => {
        if (!conversationId) return;

        const unreadCount = await Message.countDocuments({
          conversationId,
          senderId: { $ne: userId },
          seenBy: { $ne: userId }
        });

        socket.emit("unread-count", {
          conversationId,
          count: unreadCount
        });
      }
    );

    socket.on(
      "mark-seen",
      async ({ conversationId }: { conversationId: string }) => {
        if (!conversationId) return;

        await Message.updateMany(
          {
            conversationId,
            senderId: { $ne: userId },
            seenBy: { $ne: userId }
          },
          {
            $addToSet: { seenBy: userId }
          }
        );

        socket.to(conversationId).emit("messages-seen", {
          conversationId,
          userId
        });
      }
    );

    socket.on(
      "send-message",
      async ({
        conversationId,
        text
      }: {
        conversationId: string;
        text: string;
      }) => {
        if (!conversationId || !text) return;

        const message = await Message.create({
          conversationId,
          senderId: userId,
          text,
          attachments: [],
          deliveredAt: new Date()
        });

        io.to(conversationId).emit("new-message", message);
      }
    );

    socket.on(
      "typing",
      ({ conversationId }: { conversationId: string }) => {
        socket.to(conversationId).emit("user-typing", { userId });
      }
    );

    socket.on(
      "stop-typing",
      ({ conversationId }: { conversationId: string }) => {
        socket.to(conversationId).emit("user-stop-typing", { userId });
      }
    );

    socket.on("disconnect", async () => {
      await redis.srem("online_users", userId);
      console.log(`🔴 User offline: ${userId}`);
      io.emit("user-offline", userId);
    });
  });

  return io;
};






