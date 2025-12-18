import { Schema, model, Types } from "mongoose";

export interface IOTP {
  userId: Types.ObjectId;
  codeHash: string;
  expiresAt: Date;
  createdAt: Date;
}

const otpSchema = new Schema<IOTP>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    codeHash: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OTP = model<IOTP>("OTP", otpSchema);
