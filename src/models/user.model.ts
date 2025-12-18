import { Schema, model, Types } from "mongoose";

export interface IUser {
    _id: Types.ObjectId;
    username: string;
    email: string;
    passwordHash: string;
    avatar?: string;
    isVerified: boolean;
    isOnline: boolean;
    lastSeen?: Date;
    createdAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        passwordHash: {
            type: String,
            required: true
        },
        avatar: String,
        isVerified: {
            type: Boolean,
            default: false
        },
        isOnline: {
            type: Boolean,
            default: false
        },
        lastSeen: Date
    },
    {
        timestamps: { createdAt: true, updatedAt: false }
    }
);

export const User = model<IUser>("User", userSchema);
