import User from "../models/User.js";
import bcrypt from "bcrypt";

// Get all users (Admin only)
export const getUsers = async (req, res) => {
  try {
    // Return all users excluding their password hash
    const users = await User.find({}).select("-passwordHash").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

// Create a new user or admin (Admin only)
export const createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password securely
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email,
      passwordHash,
      role: role || "user"
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      active: user.active
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating user" });
  }
};

// Update user details like active status or password (Admin only)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { active, password, role } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update active status or role
    if (active !== undefined) user.active = active;
    if (role !== undefined) user.role = role;

    // Reset password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating user" });
  }
};

// Delete a user (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    // Prevent admin from deleting themselves
    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }
    await User.findByIdAndDelete(id);
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user" });
  }
};
