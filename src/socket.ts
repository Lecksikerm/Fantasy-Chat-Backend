import { Server } from "socket.io";
import http from "http";
import * as jwt from "jsonwebtoken";
import { Message } from "./models/message.model";
import { redis } from "./config/redis";

interface SocketUser {
  userId: string;
}

export const initSocket = (server: http.Server) => {
  const io = new Server(server, {
    cors: { origin: "*" }
  });

  
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("No token"));

      const payload = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET!
      ) as SocketUser;

      socket.data.userId = payload.userId;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.data.userId;

    //  USER ONLINE
    await redis.sadd("online_users", userId);
    console.log(`🟢 User online: ${userId}`);

    // Notify others
    io.emit("user-online", userId);

    // Join conversation room
    socket.on("join-conversation", (conversationId: string) => {
      socket.join(conversationId);
    });

    //  Send message
    socket.on(
      "💬 send-message",
      async ({ conversationId, text }) => {
        if (!conversationId || !text) return;

        const message = await Message.create({
          conversationId,
          senderId: userId,
          text,
          attachments: []
        });

        io.to(conversationId).emit("new-message", message);
      }
    );

    socket.on("disconnect", async () => {
      //  USER OFFLINE
      await redis.srem("online_users", userId);
      console.log(`🔴 User offline: ${userId}`);

      io.emit("user-offline", userId);
    });
  });

  return io;
};




