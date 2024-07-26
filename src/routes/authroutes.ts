import {
  login,
  signup,
  verifyEmail,
  forgotPassword,
  resetPassword,
  adminlogin,
} from "../controller/authController";

import { Router } from "express";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/verify/:token", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/adminLogin", adminlogin);

export default router;
