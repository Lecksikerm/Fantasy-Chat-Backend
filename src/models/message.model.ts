import { Schema, model, Types } from "mongoose";

const messageSchema = new Schema(
  {
    conversationId: {
      type: Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true
    },

    senderId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    text: String,

    attachments: [
      {
        url: String,
        type: {
          type: String,
          enum: ["image", "file", "audio"],
          required: true
        }
      }
    ],

    reactions: [
      {
        userId: {
          type: Types.ObjectId,
          ref: "User",
          required: true
        },
        emoji: {
          type: String,
          required: true
        }
      }
    ],

    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent"
    },

    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: Date,

    isDeleted: {
      type: Boolean,
      default: false
    },

    deletedFor: [
      {
        type: Types.ObjectId,
        ref: "User"
      }
    ],

    seenAt: Date
  },
  { timestamps: true }
);

messageSchema.index({ conversationId: 1, createdAt: -1 });

export const Message = model("Message", messageSchema);


