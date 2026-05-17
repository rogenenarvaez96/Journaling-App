import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { uploadImage, streamImage, getImages } from "../controllers/imageController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Multer Storage Configuration
// Files are strictly routed into an isolated folder named after the userId
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userDir = path.join(process.cwd(), "server", "uploads", req.user._id.toString());
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    cb(null, userDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Reject anything that isn't a standard image
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed"), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// All image routes are strictly protected by session authentication
router.use(protect);

router.route("/")
  .get(getImages);

router.route("/upload")
  .post(upload.single("image"), uploadImage);

router.route("/:id")
  .get(streamImage);

export default router;
