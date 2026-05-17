import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    appName: {
      type: String,
      required: true,
      default: "Journal.",
    },
    slogan: {
      type: String,
      required: true,
      default: "Your private collection of memories",
    },
    logoUrl: {
      type: String,
      default: "",
    },
    registrationEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.model("Settings", settingsSchema);
export default Settings;
