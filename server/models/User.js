const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, trim: true, unique: true },
  password:   { type: String, required: true }, // hashed
  // ── V2.0: resume text for match scoring ──────────────────────────────────
  resumeText: { type: String, default: "" },
  // ── Email Preferences ──────────────────────────────────────────────────
  emailPreferences: {
    deadlines: { type: Boolean, default: true },
    staleAlerts: { type: Boolean, default: true },
    weeklyDigest: { type: Boolean, default: true },
  },
  // ── Webhook API Key ────────────────────────────────────────────────────
  apiKey: { type: String, default: "" },
  createdAt:  { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
