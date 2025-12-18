import { Request, Response } from "express";
import { registerUser, loginUser } from "./auth.service";
import { OTP } from "../../models/otp.model";
import { User } from "../../models/user.model";
import { hashOTP } from "../../utils/otp";


export const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;

        await registerUser(username, email, password);

        res.status(201).json({
            message:
                "Registration successful. OTP has been sent to your email."
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};



export const verifyOTP = async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required"
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                message: "User already verified"
            });
        }

        const otpHash = hashOTP(otp);

        const otpRecord = await OTP.findOne({
            userId: user._id,
            codeHash: otpHash
        });

        if (!otpRecord) {
            return res.status(400).json({
                message: "Invalid or expired OTP"
            });
        }

        user.isVerified = true;
        await user.save();

        await OTP.deleteMany({ userId: user._id });

        return res.json({
            message: "Account verified successfully"
        });
    } catch (error: any) {
        return res.status(400).json({ message: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const result = await loginUser(email, password);

        const user = result.user.toObject(); 
        (user as any).passwordHash = undefined;

        res.json({ ...result, user });      
    } catch (error: any) {
        res.status(401).json({ message: error.message });
    }
};
