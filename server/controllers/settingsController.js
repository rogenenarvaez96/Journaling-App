import Settings from "../models/Settings.js";
import User from "../models/User.js";
import path from "path";
import fs from "fs";

// Initialize Default Settings if they don't exist
const initSettings = async () => {
  const count = await Settings.countDocuments();
  if (count === 0) {
    await Settings.create({});
  }
};
initSettings();

// @desc    Get global settings
// @route   GET /api/settings
// @access  Public
export const getSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne().lean();
    const userCount = await User.countDocuments();
    
    res.json({
      ...settings,
      isFirstRun: userCount === 0
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching settings" });
  }
};

// @desc    Update global settings
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = async (req, res) => {
  try {
    const { appName, slogan, logoUrl, registrationEnabled } = req.body;
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings();
    }
    
    if (appName !== undefined) settings.appName = appName;
    if (slogan !== undefined) settings.slogan = slogan;
    if (logoUrl !== undefined) settings.logoUrl = logoUrl;
    if (registrationEnabled !== undefined) settings.registrationEnabled = registrationEnabled;

    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } catch (error) {
    res.status(500).json({ message: "Error updating settings" });
  }
};

// @desc    Upload a public logo
// @route   POST /api/settings/upload-logo
// @access  Private/Admin
export const uploadLogo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file provided" });
    
    // The public file URL
    const logoUrl = `/public/${req.file.filename}`;
    
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();
    
    settings.logoUrl = logoUrl;
    await settings.save();

    res.json({ logoUrl });
  } catch (error) {
    res.status(500).json({ message: "Error uploading logo" });
  }
};
