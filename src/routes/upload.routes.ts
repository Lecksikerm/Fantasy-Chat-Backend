import { Router } from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

router.post(
  "/",
  authMiddleware,
  (req, res, next) => {
    upload.any()(req, res, (err) => {
      if (err) {
        console.error("Multer error:", err);
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No file received" });
      }

      const file = files[0];

      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "auto" },
        (error, result) => {
          if (error || !result) {
            console.error("Cloudinary error:", error);
            return res.status(500).json({ message: "Cloudinary upload failed" });
          }

          return res.json({
            url: result.secure_url,
            type: result.resource_type
          });
        }
      );

      stream.end(file.buffer);
    } catch (err) {
      console.error("Upload handler error:", err);
      res.status(500).json({ message: "Upload failed" });
    }
  }
);

export default router;



