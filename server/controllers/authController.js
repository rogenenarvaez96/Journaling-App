import User from "../models/User.js";
import Settings from "../models/Settings.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Generate Access and Refresh Tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || "temp_secret",
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN_SECRET || "temp_refresh_secret",
    { expiresIn: "7d" }
  );
  return { accessToken, refreshToken };
};

// Register user (Bootstraps Admin)
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const userCount = await User.countDocuments();
    let role = "user";

    // If first user, bypass restrictions and make admin
    if (userCount === 0) {
      role = "admin";
    } else {
      // Check if registration is enabled globally
      let settings = await Settings.findOne();
      if (settings && settings.registrationEnabled === false) {
        return res.status(403).json({ message: "Public registration is currently disabled." });
      }
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      passwordHash,
      role
    });

    const savedUser = await newUser.save();
    
    // Automatically log them in after registration
    const { accessToken, refreshToken } = generateTokens(savedUser);
    savedUser.refreshToken = refreshToken;
    await savedUser.save();

    res.status(201).json({
      accessToken,
      refreshToken,
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        role: savedUser.role,
      }
    });

  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Registration failed." });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verify user exists and is active
    const user = await User.findOne({ email });
    if (!user || !user.active) {
      return res.status(401).json({ message: "Invalid credentials or account inactive." });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Save refresh token to user model
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during login." });
  }
};

// Refresh token
export const refresh = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(401).json({ message: "No refresh token provided." });

    // Verify token
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET || "temp_refresh_secret");
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ message: "Invalid refresh token." });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "temp_secret",
      { expiresIn: "15m" }
    );

    res.json({ accessToken });
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired refresh token." });
  }
};

// Logout
export const logout = async (req, res) => {
  try {
    const { userId } = req.body;
    await User.findByIdAndUpdate(userId, { refreshToken: "" });
    res.json({ message: "Logged out successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error during logout." });
  }
};

// Change Password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found." });

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password." });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password updated successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error during password change." });
  }
};
