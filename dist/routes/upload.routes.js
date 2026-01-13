"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
});
router.post("/", auth_middleware_1.authMiddleware, (req, res, next) => {
    upload.any()(req, res, (err) => {
        if (err) {
            console.error("Multer error:", err);
            return res.status(400).json({ message: err.message });
        }
        next();
    });
}, async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ message: "No file received" });
        }
        const file = files[0];
        const stream = cloudinary_1.default.uploader.upload_stream({ resource_type: "auto" }, (error, result) => {
            if (error || !result) {
                console.error("Cloudinary error:", error);
                return res.status(500).json({ message: "Cloudinary upload failed" });
            }
            return res.json({
                url: result.secure_url,
                type: result.resource_type
            });
        });
        stream.end(file.buffer);
    }
    catch (err) {
        console.error("Upload handler error:", err);
        res.status(500).json({ message: "Upload failed" });
    }
});
exports.default = router;
