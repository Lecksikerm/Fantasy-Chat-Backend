"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOTPEmail = exports.mailer = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
exports.mailer = nodemailer_1.default.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: false,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});
const sendOTPEmail = async (to, otp) => {
    await exports.mailer.sendMail({
        from: `"Fantasy Chat" <${process.env.MAIL_USER}>`,
        to,
        subject: "Verify your account",
        html: `
      <h2>Account Verification</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This code expires in 10 minutes.</p>
    `
    });
};
exports.sendOTPEmail = sendOTPEmail;
