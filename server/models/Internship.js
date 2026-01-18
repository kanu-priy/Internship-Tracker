// const mongoose = require("mongoose");

// const InternshipSchema = new mongoose.Schema({
//   userId: String,
//   jobTitle: String,
//   company: String,
//   location: String,
//   savedAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model("Internship", InternshipSchema);
// const mongoose = require("mongoose");

// const InternshipSchema = new mongoose.Schema(
//   {
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     company: String,
//     role: String,
//     appliedDate: String,
//     deadline: String,
//     status: { type: String, default: "Applied" },
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
    company: String,
    role: String,
    status: {
      type: String,
      default: "Applied",
    },
    appliedDate: String,
    deadline: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Internship", InternshipSchema);

