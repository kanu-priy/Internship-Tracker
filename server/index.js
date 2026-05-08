require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("./models/User");
const Internship = require("./models/Internship");

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/internship_tracker";
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

function signToken(user) {
  const payload = { id: user._id, email: user.email, name: user.name };
  return jwt.sign(payload, process.env.JWT_SECRET || "dev_secret", { expiresIn: "7d" });
}

// helper to verify token — returns payload or throws
function verifyToken(req) {
  const auth = req.headers.authorization;
  if (!auth) throw { status: 401, message: "No token" };
  const token = auth.split(" ")[1];
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
  } catch (err) {
    throw { status: 401, message: "Token expired or invalid" };
  }
}

// ----------------- REGISTER -----------------
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Account already exists with this email" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed });
    await user.save();

    const token = signToken(user);
    res.status(201).json({ message: "Registration successful", token, user: { name: user.name, email: user.email, id: user._id } });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------- LOGIN -----------------
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user);
    res.json({ message: "Login successful", token, user: { name: user.name, email: user.email, id: user._id } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------- POST INTERNSHIP (with duplicate check) -----------------
app.post("/api/internships", async (req, res) => {
  try {
    const payload = verifyToken(req);

    // 🔴 FIX 1: trim and validate
    const company = req.body.company?.trim();
    const role = req.body.role?.trim();

    if (!company || !role)
      return res.status(400).json({ message: "Company and role are required" });

    // 🔴 FIX 2: duplicate check
    const existing = await Internship.findOne({
      userId: payload.id,
      company: { $regex: new RegExp(`^${company}$`, "i") },
      role: { $regex: new RegExp(`^${role}$`, "i") },
    });
    if (existing)
      return res.status(409).json({ message: "Already saved", internship: existing });

    const internship = new Internship({
      userId: payload.id,
      company,
      role,
      status: req.body.status || "Applied",
      appliedDate: req.body.appliedDate || new Date().toISOString().slice(0, 10),
      deadline: req.body.deadline || "",
    });

    await internship.save();
    res.status(201).json(internship);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error(err);
    res.status(500).json({ message: "Failed to save internship" });
  }
});

// ----------------- GET ALL INTERNSHIPS -----------------
app.get("/api/internships", async (req, res) => {
  try {
    const payload = verifyToken(req);
    const internships = await Internship.find({ userId: payload.id }).sort({ createdAt: -1 });
    res.json(internships);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    res.status(500).json({ message: "Failed to fetch internships" });
  }
});

// ----------------- GET SINGLE INTERNSHIP -----------------
app.get("/api/internships/:id", async (req, res) => {
  try {
    const payload = verifyToken(req);
    const internship = await Internship.findById(req.params.id);
    if (!internship) return res.status(404).json({ message: "Not found" });
    if (internship.userId.toString() !== payload.id)
      return res.status(403).json({ message: "Not authorized" });
    res.json(internship);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    res.status(500).json({ message: "Failed to fetch" });
  }
});

// ----------------- UPDATE INTERNSHIP -----------------
app.put("/api/internships/:id", async (req, res) => {
  try {
    const payload = verifyToken(req);

    const internship = await Internship.findById(req.params.id);
    if (!internship) return res.status(404).json({ message: "Not found" });
    if (internship.userId.toString() !== payload.id)
      return res.status(403).json({ message: "Not authorized" });

    const updated = await Internship.findByIdAndUpdate(
      req.params.id,
      {
        company: req.body.company?.trim(),
        role: req.body.role?.trim(),
        status: req.body.status,
        appliedDate: req.body.appliedDate,
        deadline: req.body.deadline || "",
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error("Edit error:", err);
    res.status(500).json({ message: "Failed to update" });
  }
});

// ----------------- DELETE INTERNSHIP -----------------
app.delete("/api/internships/:id", async (req, res) => {
  try {
    const payload = verifyToken(req);

    const internship = await Internship.findById(req.params.id);
    if (!internship) return res.status(404).json({ message: "Not found" });
    if (internship.userId.toString() !== payload.id)
      return res.status(403).json({ message: "Not authorized" });

    await Internship.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error("Delete error:", err);
    res.status(500).json({ message: "Failed to delete" });
  }
});

// ----------------- ME -----------------
app.get("/api/me", async (req, res) => {
  try {
    const payload = verifyToken(req);
    const user = await User.findById(payload.id).select("-password");
    res.json({ user });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    res.status(500).json({ message: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));