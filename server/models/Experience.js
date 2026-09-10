const mongoose = require("mongoose");

const ExperienceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    round: {
      type: String,
      enum: ["OA", "Technical", "Technical Interview", "Behavioral", "HR", "System Design", "Behavioral + Technical"],
      default: "OA",
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    topics: {
      type: [String],
      default: [],
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    isAnonymous: {
      type: Boolean,
      default: true,
    },
    authorName: {
      type: String,
      default: "Anonymous Candidate",
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Experience", ExperienceSchema);
