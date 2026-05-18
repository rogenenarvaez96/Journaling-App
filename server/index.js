import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import journalRoutes from "./routes/journalRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

// Enforce security in production: Crash if JWT secrets are missing/default
if (process.env.NODE_ENV === "production") {
  if (!process.env.JWT_SECRET || !process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET === "temp_secret") {
    console.error("FATAL ERROR: JWT_SECRET or REFRESH_TOKEN_SECRET is missing or insecurely configured in production.");
    process.exit(1);
  }
}

// Connect to MongoDB
connectDB();

const app = express();

// Security and middleware
app.use(helmet({ crossOriginResourcePolicy: false })); // Allow cross-origin for local dev if needed

// Configure CORS to dynamically accept local network IPs or explicitly configured domains
app.use(cors({ 
  origin: function(origin, callback) {
    return callback(null, true); // Allow any origin for local network flexibility
  }, 
  credentials: true 
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // Increased to 5000 to prevent 429 errors when loading multiple images in the gallery
  message: "Too many requests from this IP, please try again after 15 minutes."
});
app.use("/api/", apiLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/journals", journalRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/settings", settingsRoutes);

// Public uploads serving
app.use("/public", express.static(path.join(process.cwd(), "server", "uploads", "public")));

// Private uploads (should NOT be exposed via express.static normally, 
// but we leave this here as a reminder that we will build an authenticated route later)
// DO NOT DO: app.use("/uploads", express.static("uploads"));

// Server startup triggered again
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
