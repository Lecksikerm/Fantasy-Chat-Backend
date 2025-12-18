import jwt from "jsonwebtoken";
import { Types } from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export const signAccessToken = (userId: Types.ObjectId) => {
    return jwt.sign({ sub: userId }, JWT_SECRET, {
        expiresIn: "1d"
    });
};

export const signRefreshToken = (userId: Types.ObjectId) => {
    return jwt.sign({ sub: userId }, JWT_REFRESH_SECRET, {
        expiresIn: "7d"
    });
};
