import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    userId?: string;
}

export const authMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const header = req.headers.authorization;

        if (!header) {
            return res.status(401).json({ message: "No token provided" });
        }

        const token = header.split(" ")[1];

        const payload = jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET!
        ) as { userId: string };

        req.userId = payload.userId;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};


