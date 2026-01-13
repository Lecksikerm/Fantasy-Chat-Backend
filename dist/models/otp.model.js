"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTP = void 0;
const mongoose_1 = require("mongoose");
const otpSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, { timestamps: { createdAt: true, updatedAt: false } });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
exports.OTP = (0, mongoose_1.model)("OTP", otpSchema);
