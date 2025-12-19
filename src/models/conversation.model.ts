import { Schema, model, Types } from "mongoose";

const conversationSchema = new Schema(
  {
    participants: [
      {
        type: Types.ObjectId,
        ref: "User",
        required: true
      }
    ],
    lastMessage: {
      type: Types.ObjectId,
      ref: "Message"
    }
  },
  { timestamps: true }
);

export const Conversation = model("Conversation", conversationSchema);
