// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// const app = express();
// app.use(express.json());
// app.use(cors());

// // ---- DATABASE CONNECTION ----
// mongoose
//   .connect("mongodb://127.0.0.1:27017/internship-tracker")
//   .then(() => console.log("MongoDB Connected"))
//   .catch((err) => console.log(err));

// // ---- USER SCHEMA ----
// const UserSchema = new mongoose.Schema({
//   email: String,
//   password: String
// });

// const User = mongoose.model("User", UserSchema);

// // ---- REGISTER API ----
// app.post("/api/register", async (req, res) => {
//   const { email, password } = req.body;

//   const hashedPassword = await bcrypt.hash(password, 10);

//   const newUser = new User({
//     email,
//     password: hashedPassword,
//   });

//   await newUser.save();

//   res.send({ message: "Registered successfully" });
// });

// // ---- LOGIN API ----
// app.post("/api/login", async (req, res) => {
//   const { email, password } = req.body;

//   const user = await User.findOne({ email });

//   if (!user) return res.status(400).send({ message: "User not found" });

//   const isMatch = await bcrypt.compare(password, user.password);

//   if (!isMatch) return res.status(400).send({ message: "Wrong password" });

//   const token = jwt.sign({ id: user._id }, "secret123");

//   res.send({ message: "Login successful", token });
// });

// // ---- SERVER START ----
// app.listen(5000, () => {
//   console.log("Server running on port 5000");
// });
// server/index.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("./models/User");
const Internship = require("./models/Internship");
const auth = require("./middleware/auth");


const app = express();
app.use(cors());
app.use(express.json());

// --- MongoDB connect ---
// const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/deadlinedesk";
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/internship_tracker";
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Helper to sign JWT
function signToken(user) {
  const payload = { id: user._id, email: user.email, name: user.name };
  return jwt.sign(payload, process.env.JWT_SECRET || "dev_secret", { expiresIn: "7d" });
}

// ----------------- REGISTER -----------------
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Account already exists with this email" });

    const saltRounds = 10;
    const hashed = await bcrypt.hash(password, saltRounds);

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


// app.post("/api/internships", async (req, res) => {
//   try {
//     const token = req.headers.authorization?.split(" ")[1];
//     if (!token) return res.status(401).json({ message: "No token" });

//     const user = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");

//     const internship = new Internship({
//       userId: user.id,
//       ...req.body,
//     });

//     await internship.save();

//     res.json({ message: "Saved", internship });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "Error saving internship" });
//   }
// });
// app.post("/api/internships", async (req, res) => {
//   try {
//     const auth = req.headers.authorization;
//     if (!auth) return res.status(401).json({ message: "No token" });

//     const token = auth.split(" ")[1];
//     const payload = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");

//     const internship = new Internship({
//       userId: payload.id,
//       ...req.body,
//     });

//     await internship.save();
//     res.status(201).json(internship);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to save internship" });
//   }
// });
// app.post("/api/internships", async (req, res) => {
//   try {
//     // 🔐 1. Read token
//     const authHeader = req.headers.authorization;
//     if (!authHeader)
//       return res.status(401).json({ message: "No token provided" });

//     const token = authHeader.split(" ")[1];

//     // 🔓 2. Verify token
//     const decoded = jwt.verify(
//       token,
//       process.env.JWT_SECRET || "dev_secret"
//     );

//     // 🧾 3. Validate body
//     const { company, role, appliedDate, status, deadline } = req.body;

//     if (!company || !role) {
//       return res.status(400).json({ message: "Company and role are required" });
//     }

//     // 🏗️ 4. Create internship
//     const internship = new Internship({
//       userId: decoded.id,
//       company,
//       role,
//       appliedDate: appliedDate || new Date().toISOString().slice(0, 10),
//       status: status || "Applied",
//       deadline: deadline || "",
//     });

//     // 💾 5. Save to DB
//     await internship.save();

//     // ✅ 6. Respond
//     res.status(201).json({
//       message: "Internship saved successfully",
//       internship,
//     });
//   } catch (err) {
//     console.error("Save internship error:", err);
//     res.status(500).json({ message: "Failed to save internship" });
//   }
// });
app.post("/api/internships", async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: "No token" });

    const token = auth.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");

    const internship = new Internship({
      userId: payload.id,
      company: req.body.company,
      role: req.body.role,
      status: req.body.status,
      appliedDate: req.body.appliedDate,
      deadline: req.body.deadline || "",
    });

    await internship.save();
    res.status(201).json(internship);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save internship" });
  }
});


app.get("/api/internships", async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: "No token" });

    const token = auth.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");

    const internships = await Internship.find({ userId: payload.id }).sort({
      createdAt: -1,
    });

    res.json(internships);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch internships" });
  }
});



// ----------------- protected test route (optional) -----------------
app.get("/api/me", async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: "No token" });
  const token = auth.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    const user = await User.findById(payload.id).select("-password");
    res.json({ user });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
