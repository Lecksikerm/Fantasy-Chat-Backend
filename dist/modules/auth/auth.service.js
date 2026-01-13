"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_model_1 = require("../../models/user.model");
const refresh_token_model_1 = require("../../models/refresh-token.model");
const otp_model_1 = require("../../models/otp.model");
const jwt_1 = require("../../utils/jwt");
const mailer_1 = require("../../utils/mailer");
const otp_1 = require("../../utils/otp");
const registerUser = async (username, email, password) => {
    const existing = await user_model_1.User.findOne({
        $or: [{ email }, { username }]
    });
    if (existing) {
        throw new Error("User already exists");
    }
    const passwordHash = await bcrypt_1.default.hash(password, 10);
    const user = await user_model_1.User.create({
        username,
        email,
        passwordHash,
        isVerified: false
    });
    await otp_model_1.OTP.deleteMany({ userId: user._id });
    const otp = (0, otp_1.generateOTP)();
    const otpHash = (0, otp_1.hashOTP)(otp);
    await otp_model_1.OTP.create({
        userId: user._id,
        codeHash: otpHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });
    await (0, mailer_1.sendOTPEmail)(email, otp);
    return;
};
exports.registerUser = registerUser;
const loginUser = async (email, password) => {
    const user = await user_model_1.User.findOne({ email });
    if (!user)
        throw new Error("Invalid credentials");
    if (!user.isVerified) {
        throw new Error("Account not verified");
    }
    const isMatch = await bcrypt_1.default.compare(password, user.passwordHash);
    if (!isMatch)
        throw new Error("Invalid credentials");
    const accessToken = (0, jwt_1.signAccessToken)(user._id);
    const refreshToken = (0, jwt_1.signRefreshToken)(user._id);
    await refresh_token_model_1.RefreshToken.create({
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
exports.loginUser = loginUser;
