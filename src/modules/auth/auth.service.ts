import bcrypt from "bcrypt";
import { User } from "../../models/user.model";
import { RefreshToken } from "../../models/refresh-token.model";
import { OTP } from "../../models/otp.model";
import { signAccessToken, signRefreshToken } from "../../utils/jwt";

import { sendOTPEmail } from "../../utils/mailer";
import { generateOTP, hashOTP } from "../../utils/otp";


export const registerUser = async (
    username: string,
    email: string,
    password: string
) => {
    const existing = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (existing) {
        throw new Error("User already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
        username,
        email,
        passwordHash,
        isVerified: false
    });

    await OTP.deleteMany({ userId: user._id });

    const otp = generateOTP();
    const otpHash = hashOTP(otp);

    await OTP.create({
        userId: user._id,
        codeHash: otpHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    await sendOTPEmail(email, otp);

    return;
};

export const loginUser = async (email: string, password: string) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error("Invalid credentials");

    if (!user.isVerified) {
        throw new Error("Account not verified");
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) throw new Error("Invalid credentials");

    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    await RefreshToken.create({
        userId: user._id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    return {
        user,
        accessToken,
        refreshToken
    };
};

