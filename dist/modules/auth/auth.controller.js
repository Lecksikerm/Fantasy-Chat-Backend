"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.verifyOTP = exports.register = void 0;
const auth_service_1 = require("./auth.service");
const otp_model_1 = require("../../models/otp.model");
const user_model_1 = require("../../models/user.model");
const otp_1 = require("../../utils/otp");
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        await (0, auth_service_1.registerUser)(username, email, password);
        res.status(201).json({
            message: "Registration successful. OTP has been sent to your email."
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.register = register;
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required"
            });
        }
        const user = await user_model_1.User.findOne({ email });
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
        const otpHash = (0, otp_1.hashOTP)(otp);
        const otpRecord = await otp_model_1.OTP.findOne({
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
        await otp_model_1.OTP.deleteMany({ userId: user._id });
        return res.json({
            message: "Account verified successfully"
        });
    }
    catch (error) {
        return res.status(400).json({ message: error.message });
    }
};
exports.verifyOTP = verifyOTP;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await (0, auth_service_1.loginUser)(email, password);
        const user = result.user.toObject();
        user.passwordHash = undefined;
        res.json({ ...result, user });
    }
    catch (error) {
        res.status(401).json({ message: error.message });
    }
};
exports.login = login;
