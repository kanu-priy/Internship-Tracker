const mongoose = require("mongoose");

const ContactHistorySchema = new mongoose.Schema(
  {
    date: { type: String, default: "" },
    note: { type: String, default: "" },
    type: { type: String, default: "Outreach" }, // "Outreach" | "Follow-up" | "Reply" | "Referral"
  },
  { _id: false }
);

const ContactSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    internshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Internship",
      default: null,
    },

    // ── Contact Persona ──────────────────────────────────────────────
    name:        { type: String, required: true },
    company:     { type: String, required: true },
    role:        { type: String, default: "Recruiter" }, // e.g. "Technical Recruiter", "Software Engineer II", "Engineering Manager"
    email:       { type: String, default: "" },
    linkedinUrl: { type: String, default: "" },

    // ── Outreach & Referral Pipeline ──────────────────────────────────
    outreachType: {
      type: String,
      default: "Recruiter Pitch",
      enum: ["Recruiter Pitch", "Coffee Chat", "Referral Request", "Alumni Connection", "General Networking"],
    },
    status: {
      type: String,
      default: "Identified",
      enum: ["Identified", "Contacted", "Follow-up Sent", "Replied", "Referral Secured", "No Response"],
    },
    referralStatus: {
      type: String,
      default: "None",
      enum: ["None", "Requested", "Confirmed", "Declined"],
    },

    // ── Timeline & Reminders ─────────────────────────────────────────
    lastContactDate:  { type: String, default: "" }, // YYYY-MM-DD
    nextFollowUpDate: { type: String, default: "" }, // YYYY-MM-DD

    // ── Communication & Notes ────────────────────────────────────────
    notes:           { type: String, default: "" },
    responseSummary: { type: String, default: "" },
    outreachDraft:   { type: String, default: "" },
    history:         { type: [ContactHistorySchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contact", ContactSchema);
