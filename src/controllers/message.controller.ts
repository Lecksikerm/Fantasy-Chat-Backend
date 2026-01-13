import { Request, Response } from "express";
import { Types } from "mongoose";
import { Message } from "../models/message.model";


interface AuthRequest extends Request {
  userId?: string;
}
export const getMessages = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { conversationId } = req.params;
  const cursor = req.query.cursor as string | undefined;
  const limit = Math.min(Number(req.query.limit) || 20, 100);

  if (!Types.ObjectId.isValid(conversationId)) {
    return res.status(400).json({ message: "Invalid conversationId" });
  }

  const query: any = {
    conversationId: new Types.ObjectId(conversationId),
    isDeleted: false,
    deletedFor: { $ne: userId }
  };

  if (cursor) {
    query.createdAt = { $lt: new Date(cursor) };
  }

  const messages = await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("senderId", "name avatar")
    .lean();

  res.json({
    messages,
    nextCursor: messages.length
      ? (messages[messages.length - 1] as any).createdAt
      : null
  });
};



