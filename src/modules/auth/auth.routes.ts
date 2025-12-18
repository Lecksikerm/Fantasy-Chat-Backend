import { Router } from "express";
import { login, register, verifyOTP } from "./auth.controller";

const router = Router();

router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);

export default router;
