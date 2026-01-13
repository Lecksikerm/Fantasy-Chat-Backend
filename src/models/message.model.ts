import { Schema, model, Types, Document } from "mongoose";


const attachmentSchema = new Schema(
  {
    url: { type: String },
    type: { type: String, enum: ["image", "file", "audio"], required: true }
  },
  { _id: false } 
);

const reactionSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    emoji: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false } 
);

export interface IMessage extends Document {
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  text?: string;
  attachments: {
    url?: string;
    type: "image" | "file" | "audio";
  }[];
  reactions: {
    userId: Types.ObjectId;
    emoji: string;
    createdAt: Date;
  }[];
  status: "sent" | "delivered" | "seen";
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedFor: Types.ObjectId[];
  seenAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
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

    text: { type: String },

    attachments: { type: [attachmentSchema], default: [] },

    reactions: { type: [reactionSchema], default: [] },

    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent"
    },

    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: { type: Date },

    isDeleted: {
      type: Boolean,
      default: false
    },

    deletedFor: { type: [{ type: Types.ObjectId, ref: "User" }], default: [] },

    seenAt: { type: Date },

    deliveredAt: { type: Date }
  },
  { timestamps: true } 
);

messageSchema.index({ conversationId: 1, createdAt: -1 });


export const Message = model<IMessage>("Message", messageSchema);
