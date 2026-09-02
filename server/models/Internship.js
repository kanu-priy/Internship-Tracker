const mongoose = require("mongoose");

const TimelineEntrySchema = new mongoose.Schema(
  {
    status: { type: String, default: "" },
    date:   { type: String, default: "" },
    note:   { type: String, default: "" },
  },
  { _id: false }
);

const InternshipSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── Core fields (original) ─────────────────────────────────────────────
    company:     { type: String, default: "" },
    role:        { type: String, default: "" },
    status:      { type: String, default: "Applied" },
    appliedDate: { type: String, default: "" },
    deadline:    { type: String, default: "" },
    notes:       { type: String, default: "" },
    resumeUsed:  { type: String, default: "" },

    // ── Rich extraction fields (V2.0 extension) — all optional with defaults
    location:       { type: String, default: "" },
    jobDescription: { type: String, default: "" },
    skills:         { type: [String], default: [] },
    employmentType: { type: String, default: "" },
    stipend:        { type: String, default: "" },
    applicationUrl: { type: String, default: "" },
    source:         { type: String, default: "manual" }, // "linkedin" | "internshala" | "manual"

    // ── Resume match score (0–100 or null) ────────────────────────────────
    matchScore:     { type: Number, default: null },

    // ── Email Sync & Automation Metadata ───────────────────────────────
    emailSource:          { type: Boolean, default: false },
    lastEmailDate:        { type: String, default: "" },
    emailHashes:          { type: [String], default: [] },
    autoAddedFromEmail:   { type: Boolean, default: false },
    copiedFrom:           { type: String, default: "" },

    // ── Per-application status history ────────────────────────────────────
    timeline: { type: [TimelineEntrySchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Internship", InternshipSchema);