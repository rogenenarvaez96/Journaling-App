import express from "express";
import { login, register, refresh, logout, changePassword } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Auth routes
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

// Protected Auth routes
router.put("/password", protect, changePassword);

export default router;
