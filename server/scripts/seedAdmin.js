import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "../models/User.js";
import readline from "readline";

// Load env vars
dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/journal_app");
    console.log("Connected to MongoDB.");

    rl.question("Enter Admin Email: ", (email) => {
      rl.question("Enter Admin Username: ", (username) => {
        rl.question("Enter Admin Password: ", async (password) => {
          try {
            const existingAdmin = await User.findOne({ email });
            if (existingAdmin) {
              console.log("Admin with this email already exists.");
              process.exit(0);
            }

            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            const admin = new User({
              username,
              email,
              passwordHash,
              role: "admin",
              active: true,
            });

            await admin.save();
            console.log("Admin account successfully created!");
            process.exit(0);
          } catch (err) {
            console.error("Error creating admin:", err);
            process.exit(1);
          }
        });
      });
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

seedAdmin();
