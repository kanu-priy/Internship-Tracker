
// const mongoose = require("mongoose");

// const InternshipSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     company: String,
//     role: String,
//     status: {
//       type: String,
//       default: "Applied",
//     },
//     appliedDate: String,
//     deadline: String,
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Internship", InternshipSchema);

const mongoose = require("mongoose");

const InternshipSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company:     String,
    role:        String,
    status:      { type: String, default: "Applied" },
    appliedDate: String,
    deadline:    String,
    // ── NEW: freeform notes / remarks ──────────────────────────────────────
    notes:       { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Internship", InternshipSchema);