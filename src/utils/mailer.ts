import nodemailer from "nodemailer";

export const mailer = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: false,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

export const sendOTPEmail = async (
    to: string,
    otp: string
) => {
    await mailer.sendMail({
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
