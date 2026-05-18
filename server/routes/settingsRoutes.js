import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { getSettings, updateSettings, uploadLogo } from "../controllers/settingsController.js";
import { exportBackup, importBackup } from "../controllers/backupController.js";
import { protect, authorizeRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Multer storage for public logos
const publicStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const publicDir = path.join(process.cwd(), "server", "uploads", "public");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    cb(null, publicDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "logo-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only standard image formats (JPEG, PNG, WebP, GIF) are allowed"), false);
  }
};

const upload = multer({ storage: publicStorage, fileFilter });

// Memory storage for backup zip upload
const memoryUpload = multer({ storage: multer.memoryStorage() });

// Public route to get settings
router.get("/", getSettings);

// Protected routes for all users
router.post("/backup/export", protect, exportBackup);
router.post("/backup/import", protect, memoryUpload.single("backup"), importBackup);

// Protected Admin routes
router.put("/", protect, authorizeRole("admin"), updateSettings);
router.post("/upload-logo", protect, authorizeRole("admin"), upload.single("logo"), uploadLogo);

export default router;
