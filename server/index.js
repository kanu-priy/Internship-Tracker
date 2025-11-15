const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());

// ---- DATABASE CONNECTION ----
mongoose
  .connect("mongodb://127.0.0.1:27017/internship-tracker")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// ---- USER SCHEMA ----
const UserSchema = new mongoose.Schema({
  email: String,
  password: String
});

const User = mongoose.model("User", UserSchema);

// ---- REGISTER API ----
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    email,
    password: hashedPassword,
  });

  await newUser.save();

  res.send({ message: "Registered successfully" });
});

// ---- LOGIN API ----
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.status(400).send({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) return res.status(400).send({ message: "Wrong password" });

  const token = jwt.sign({ id: user._id }, "secret123");

  res.send({ message: "Login successful", token });
});

// ---- SERVER START ----
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
