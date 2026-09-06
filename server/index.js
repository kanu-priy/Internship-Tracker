require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const crypto = require("crypto");
const { GoogleGenAI } = require("@google/genai");

const upload = multer({ storage: multer.memoryStorage() });
function getAIClient() {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

const User = require("./models/User");
const Internship = require("./models/Internship");
const Contact = require("./models/Contact");

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" })); // raised limit for resume text + JD text

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

// ── Keyword overlap match scorer ──────────────────────────────────────────
// Pure JS, zero external API. Extracts keywords from resume + JD and
// computes an overlap score. Returns { score, matched, missing }.
function computeMatch(resumeText, jobDescription, skills = []) {
  // Map of canonical keywords to their synonyms
  const SYNONYM_MAP = {
    "javascript": ["js", "javascript", "ecmascript"],
    "typescript": ["ts", "typescript"],
    "python": ["python", "py"],
    "java": ["java"],
    "c++": ["c++", "cpp"],
    "c#": ["c#", "csharp", "c sharp"],
    "go": ["go", "golang"],
    "rust": ["rust"],
    "kotlin": ["kotlin"],
    "swift": ["swift"],
    "react": ["react", "reactjs", "react.js"],
    "vue": ["vue", "vuejs", "vue.js"],
    "angular": ["angular", "angularjs", "angular.js"],
    "nextjs": ["next", "nextjs", "next.js"],
    "nodejs": ["node", "nodejs", "node.js"],
    "express": ["express", "expressjs", "express.js"],
    "django": ["django"],
    "flask": ["flask"],
    "fastapi": ["fastapi"],
    "spring": ["spring", "springboot", "spring boot"],
    "sql": ["sql"],
    "mysql": ["mysql"],
    "postgresql": ["postgresql", "postgres"],
    "mongodb": ["mongodb", "mongo"],
    "redis": ["redis"],
    "aws": ["aws", "amazon web services"],
    "gcp": ["gcp", "google cloud"],
    "azure": ["azure"],
    "docker": ["docker"],
    "kubernetes": ["kubernetes", "k8s"],
    "git": ["git", "github", "gitlab"],
    "linux": ["linux", "unix", "ubuntu"],
    "ci/cd": ["ci/cd", "ci-cd", "continuous integration"],
    "machine learning": ["machine learning", "ml"],
    "deep learning": ["deep learning", "dl"],
    "artificial intelligence": ["ai", "artificial intelligence"],
    "tensorflow": ["tensorflow", "tf"],
    "pytorch": ["pytorch"],
    "nlp": ["nlp", "natural language processing"],
    "html": ["html", "html5"],
    "css": ["css", "css3"],
    "tailwind": ["tailwind", "tailwindcss"],
    "api": ["api", "apis", "rest", "restful", "graphql"]
  };

  const jdText = ((jobDescription || "") + " " + skills.join(" ")).toLowerCase();
  const resText = (resumeText || "").toLowerCase();

  const jdKeywords = new Set();
  const matched = new Set();

  for (const [canonical, synonyms] of Object.entries(SYNONYM_MAP)) {
    // Check if any synonym exists in JD
    const inJd = synonyms.some(syn => {
      const escaped = syn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`(^|\\s|\\W)${escaped}(\\s|\\W|$)`, "i").test(jdText);
    });

    if (inJd) {
      jdKeywords.add(canonical);
      // Check if any synonym exists in Resume
      const inRes = synonyms.some(syn => {
        const escaped = syn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp(`(^|\\s|\\W)${escaped}(\\s|\\W|$)`, "i").test(resText);
      });
      if (inRes) {
        matched.add(canonical);
      }
    }
  }

  const jdArr = Array.from(jdKeywords);
  const matchedArr = Array.from(matched);

  if (jdArr.length === 0) {
    return { score: 70, matched: [], missing: [] };
  }

  const missingArr = jdArr.filter(kw => !matched.has(kw));
  const score = Math.round((matchedArr.length / jdArr.length) * 100);

  return { score, matched: matchedArr, missing: missingArr };
}

async function computeMatchAsync(resumeText, jobDescription, role, company) {
  if (process.env.GEMINI_API_KEY) {
    try {
      const prompt = `You are an expert technical recruiter evaluating a candidate's resume for the role of "${role}" at "${company}". 
Job Description (if any): "${jobDescription || 'N/A'}"
Candidate Resume: "${resumeText.substring(0, 3000)}" // Truncated for limit

Analyze the match based on skills, experience, and the role title. Return ONLY a JSON object with the following structure:
{"score": <number 0-100>, "matched": ["skill1", "skill2"], "missing": ["missing_skill1"]}
Do not wrap it in markdown block. Just valid JSON.`;
      
      const response = await getAIClient().models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
        contents: prompt,
      });
      let text = response.text || "{}";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        if (typeof result.score === "number") {
          return result;
        }
      }
    } catch (err) {
      console.error("AI Match Error, falling back to heuristics:", err);
    }
  }

  // Fallback heuristics if no API key or API fails
  let textToMatch = jobDescription || "";
  if (!textToMatch.trim()) {
    textToMatch = `${role} ${role} ${company}`;
  }
  return computeMatch(resumeText, textToMatch, []);
}


// ═══════════════════════════════════════════════════════════════════════════
// ORIGINAL ROUTES — completely unchanged
// ═══════════════════════════════════════════════════════════════════════════

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

    const company = req.body.company?.trim();
    const role = req.body.role?.trim();

    if (!company || !role)
      return res.status(400).json({ message: "Company and role are required" });

    // Duplicate check
    const existing = await Internship.findOne({
      userId: payload.id,
      company: { $regex: new RegExp(`^${company}$`, "i") },
      role: { $regex: new RegExp(`^${role}$`, "i") },
    });
    if (existing)
      return res.status(409).json({ message: "Already saved", internship: existing });

    const today = new Date().toISOString().slice(0, 10);

    const internship = new Internship({
      userId: payload.id,
      company,
      role,
      status:         req.body.status || "Applied",
      appliedDate:    req.body.appliedDate || today,
      deadline:       req.body.deadline || "",
      notes:          req.body.notes || "",
      resumeUsed:     req.body.resumeUsed || "",
      // ── V2.0 rich fields (optional — extension sends them, manual add doesn't) ──
      location:       req.body.location || "",
      jobDescription: req.body.jobDescription || "",
      skills:         req.body.skills || [],
      employmentType: req.body.employmentType || "",
      stipend:        req.body.stipend || "",
      applicationUrl: req.body.applicationUrl || "",
      source:         req.body.source || "manual",
      // ── Initial timeline entry ─────────────────────────────────────────
      timeline: [{ status: req.body.status || "Applied", date: today, note: "Application saved" }],
    });

    await internship.save();
    res.status(201).json(internship);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error(err);
    res.status(500).json({ message: "Failed to save internship" });
  }
});

// ----------------- BULK IMPORT APPLICATIONS (CSV / Sheets) -----------------
app.post("/api/internships/bulk-import", async (req, res) => {
  try {
    const payload = verifyToken(req);
    const { applications } = req.body;

    if (!Array.isArray(applications) || applications.length === 0) {
      return res.status(400).json({ message: "Applications list is required." });
    }

    const today = new Date().toISOString().slice(0, 10);
    const existing = await Internship.find({ userId: payload.id }).select("company role appliedDate");
    const existingSet = new Set(
      existing.map(a => `${a.company.toLowerCase().trim()}|${a.role.toLowerCase().trim()}`)
    );

    const toInsert = [];
    let skippedCount = 0;

    for (const app of applications) {
      if (!app.company || !app.company.trim() || !app.role || !app.role.trim()) {
        skippedCount++;
        continue;
      }

      const key = `${app.company.toLowerCase().trim()}|${app.role.toLowerCase().trim()}`;
      if (existingSet.has(key)) {
        skippedCount++;
        continue;
      }

      existingSet.add(key);
      toInsert.push({
        userId: payload.id,
        company: app.company.trim(),
        role: app.role.trim(),
        status: app.status || "Applied",
        appliedDate: app.appliedDate || today,
        deadline: app.deadline || "",
        notes: app.notes || "Imported via CSV / Spreadsheet",
        source: "spreadsheet_import",
        timeline: [{ status: app.status || "Applied", date: app.appliedDate || today, note: "Imported via Spreadsheet" }]
      });
    }

    let inserted = [];
    if (toInsert.length > 0) {
      inserted = await Internship.insertMany(toInsert);
    }

    res.json({
      success: true,
      importedCount: inserted.length,
      skippedCount,
      totalProcessed: applications.length
    });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error("Bulk import error:", err);
    res.status(500).json({ message: "Failed to bulk import applications" });
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

    // ── If status is changing, append to timeline ─────────────────────────
    let updatedTimeline = internship.timeline || [];
    if (req.body.status && req.body.status !== internship.status) {
      updatedTimeline = [
        ...updatedTimeline,
        {
          status: req.body.status,
          date: new Date().toISOString().slice(0, 10),
          note: req.body.timelineNote || "",
        },
      ];
    }

    const updated = await Internship.findByIdAndUpdate(
      req.params.id,
      {
        company:    req.body.company?.trim()    || internship.company,
        role:       req.body.role?.trim()       || internship.role,
        status:     req.body.status             || internship.status,
        appliedDate: req.body.appliedDate       || internship.appliedDate,
        deadline:   req.body.deadline           ?? internship.deadline,
        notes:      req.body.notes              ?? internship.notes,
        resumeUsed: req.body.resumeUsed         ?? internship.resumeUsed,
        // V2.0 fields — only update if provided
        ...(req.body.location       !== undefined && { location: req.body.location }),
        ...(req.body.jobDescription !== undefined && { jobDescription: req.body.jobDescription }),
        ...(req.body.skills         !== undefined && { skills: req.body.skills }),
        ...(req.body.employmentType !== undefined && { employmentType: req.body.employmentType }),
        ...(req.body.stipend        !== undefined && { stipend: req.body.stipend }),
        ...(req.body.applicationUrl !== undefined && { applicationUrl: req.body.applicationUrl }),
        timeline: updatedTimeline,
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


// ═══════════════════════════════════════════════════════════════════════════
// V2.0 NEW ROUTES — purely additive, original routes above are untouched
// ═══════════════════════════════════════════════════════════════════════════

// ----------------- GET RESUME TEXT -----------------
app.get("/api/me/resume", async (req, res) => {
  try {
    const payload = verifyToken(req);
    const user = await User.findById(payload.id).select("resumeText");
    res.json({ resumeText: user.resumeText || "" });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------- SAVE / UPDATE RESUME TEXT -----------------
app.put("/api/me/resume", async (req, res) => {
  try {
    const payload = verifyToken(req);
    const { resumeText } = req.body;

    if (typeof resumeText !== "string")
      return res.status(400).json({ message: "resumeText must be a string" });

    await User.findByIdAndUpdate(payload.id, { resumeText });
    res.json({ message: "Resume saved" });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------- UPLOAD RESUME PDF -----------------
app.post("/api/me/resume/upload", upload.single("resume"), async (req, res) => {
  try {
    const payload = verifyToken(req);
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // Parse the PDF
    const data = await pdfParse(req.file.buffer);
    const resumeText = data.text || "";

    if (!resumeText.trim()) {
      return res.status(400).json({ message: "Could not extract text from this PDF" });
    }

    // Save to user
    await User.findByIdAndUpdate(payload.id, { resumeText });
    res.json({ message: "Resume parsed and saved", resumeText });
  } catch (err) {
    console.error("PDF upload error:", err);
    if (err.status) return res.status(err.status).json({ message: err.message });
    res.status(500).json({ message: "Failed to parse PDF" });
  }
});

// ----------------- COMPUTE RESUME MATCH SCORE -----------------
// POST /api/internships/:id/match
// Reads the user's saved resume, compares to this internship's JD+skills,
// stores the score, and returns the breakdown.
app.post("/api/internships/:id/match", async (req, res) => {
  try {
    const payload = verifyToken(req);

    const internship = await Internship.findById(req.params.id);
    if (!internship) return res.status(404).json({ message: "Not found" });
    if (internship.userId.toString() !== payload.id)
      return res.status(403).json({ message: "Not authorized" });

    const user = await User.findById(payload.id).select("resumeText");
    if (!user.resumeText)
      return res.status(400).json({ message: "No resume found. Please add your resume first." });

    const { score, matched, missing } = await computeMatchAsync(
      user.resumeText,
      internship.jobDescription,
      internship.role,
      internship.company
    );

    // Persist score on internship so it doesn't need to be recomputed
    await Internship.findByIdAndUpdate(req.params.id, { matchScore: score });

    res.json({ score, matched, missing });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error("Match error:", err);
    res.status(500).json({ message: "Failed to compute match" });
  }
});

// ----------------- BULK COMPUTE MATCH FOR ALL INTERNSHIPS -----------------
// POST /api/me/match-all
// Re-scores every internship for this user in one shot.
app.post("/api/me/match-all", async (req, res) => {
  try {
    const payload = verifyToken(req);
    const user = await User.findById(payload.id).select("resumeText");
    if (!user.resumeText)
      return res.status(400).json({ message: "No resume found." });

    const internships = await Internship.find({ userId: payload.id });
    const results = [];

    for (const internship of internships) {
      const { score } = await computeMatchAsync(
        user.resumeText,
        internship.jobDescription,
        internship.role,
        internship.company
      );
      await Internship.findByIdAndUpdate(internship._id, { matchScore: score });
      results.push({ id: internship._id, score });
    }

    res.json({ updated: results.length, results });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    res.status(500).json({ message: "Failed to bulk match" });
  }
});
// ----------------- AI ACTIONS (Email & Interview) -----------------
app.post("/api/me/ai-actions/email", async (req, res) => {
  try {
    const payload = verifyToken(req);
    const user = await User.findById(payload.id);
    const { company, role, jobDescription } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      // High-quality smart fallback template when Gemini API key is not configured
      const candidateName = user?.name || "Candidate";
      const smartEmail = `Hi ${company} Recruiting Team,\n\nI recently came across the ${role} position at ${company} and wanted to reach out directly. With my background in software engineering and hands-on project experience, I've built robust full-stack applications and solved complex technical challenges.\n\nI greatly admire ${company}'s work and would love the opportunity to contribute to your team. Please find my resume attached—I would welcome a brief 10-minute conversation to discuss how my skills align with your goals.\n\nBest regards,\n${candidateName}\n\n[Note: Add your GEMINI_API_KEY in server/.env for hyper-personalized AI generation with live resume context.]`;
      return res.json({ result: smartEmail, isFallback: true });
    }

    const prompt = `You are a career coach. Write a short, highly compelling cold email (or LinkedIn DM) to a recruiter at "${company}" for the "${role}" role. 
Use the candidate's resume and the job description to personalize it. Make it professional but conversational. Do not include subject lines if it's a DM, just the body. Limit to 150 words.

Candidate Resume: "${(user.resumeText || "").substring(0, 3000)}"
Job Description: "${(jobDescription || "").substring(0, 3000)}"`;

    const response = await getAIClient().models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      contents: prompt,
    });
    
    res.json({ result: response.text });
  } catch (err) {
    console.error("AI Email error, falling back to smart template:", err.message);
    const user = await User.findById(req.userId || "").catch(() => null);
    const candidateName = user?.name || "Candidate";
    const smartEmail = `Hi ${req.body.company || "Hiring"} Recruiting Team,\n\nI recently came across the ${req.body.role || "Software Engineer"} position and wanted to reach out directly. With my background in software engineering and hands-on project experience, I've built robust full-stack applications and solved complex technical challenges.\n\nI would love the opportunity to contribute to your team. Please find my resume attached—I would welcome a brief 10-minute conversation to discuss how my skills align with your goals.\n\nBest regards,\n${candidateName}\n\n[Generated via DeadlineDesk Smart Template]`;
    res.json({ result: smartEmail, isFallback: true });
  }
});

app.post("/api/me/ai-actions/interview", async (req, res) => {
  try {
    const payload = verifyToken(req);
    const user = await User.findById(payload.id);
    const { company, role, jobDescription, skills } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      const skillList = skills && skills.length > 0 ? skills.join(", ") : "system design, algorithms, and core domain skills";
      const smartQuestions = `### Top 5 Interview Questions for ${role} at ${company}\n\n1. **Technical Deep Dive**: Can you walk me through an impactful project where you utilized ${skillList}? What trade-offs or scalability challenges did you encounter?\n2. **System Design / Architecture**: How would you design a scalable service or component relevant to ${company}'s core business model?\n3. **Debugging & Problem Solving**: Tell me about a time you faced a critical bug or unexpected production issue. How did you isolate root cause and resolve it under pressure?\n4. **Collaboration & Ownership**: Describe a scenario where you disagreed with a teammate or team lead on technical direction. How did you build alignment?\n5. **Role Alignment**: Why specifically ${company} for this ${role} role, and what unique perspective or strengths do you bring?\n\n*(Generated via DeadlineDesk Smart Template)*`;
      return res.json({ result: smartQuestions, isFallback: true });
    }

    const prompt = `You are an expert technical interviewer at "${company}" interviewing a candidate for the "${role}" role. 
Based on the job description and the required skills (${skills?.join(', ')}), what are the top 5 most likely interview questions you will ask this candidate?
Provide a mix of technical and behavioral questions tailored to their resume. Output it as a clean Markdown list.

Candidate Resume: "${(user.resumeText || "").substring(0, 3000)}"
Job Description: "${(jobDescription || "").substring(0, 3000)}"`;

    const response = await getAIClient().models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      contents: prompt,
    });
    
    res.json({ result: response.text });
  } catch (err) {
    console.error("AI Interview error, falling back to smart template:", err.message);
    const skillList = req.body.skills && req.body.skills.length > 0 ? req.body.skills.join(", ") : "system design, algorithms, and core domain skills";
    const smartQuestions = `### Top 5 Interview Questions for ${req.body.role || "this role"} at ${req.body.company || "Company"}\n\n1. **Technical Deep Dive**: Can you walk me through an impactful project where you utilized ${skillList}? What trade-offs or scalability challenges did you encounter?\n2. **System Design / Architecture**: How would you design a scalable service or component relevant to this team?\n3. **Debugging & Problem Solving**: Tell me about a time you faced a critical bug or unexpected production issue. How did you isolate root cause and resolve it under pressure?\n4. **Collaboration & Ownership**: Describe a scenario where you disagreed with a teammate on technical direction. How did you build alignment?\n5. **Role Alignment**: Why specifically this company and what unique perspective or strengths do you bring?\n\n*(Generated via DeadlineDesk Smart Template)*`;
    res.json({ result: smartQuestions, isFallback: true });
  }
});

// ----------------- AI ACTIONS (Ghost Buster Follow-Up Generator) -----------------
app.post("/api/me/ai-actions/follow-up", async (req, res) => {
  try {
    const payload = verifyToken(req);
    const user = await User.findById(payload.id);
    const { company, role, daysStale, status } = req.body;
    const candidateName = user?.name || "Candidate";

    if (!process.env.GEMINI_API_KEY) {
      const stageText = status === "Interview" ? "following up after our recent conversation" : "following up on my application";
      const smartFollowUp = `Subject: Following up: ${role} Application - ${candidateName}\n\nHi ${company} Recruiting Team,\n\nI hope you are having a wonderful week.\n\nI am writing to respectfully check in regarding my ${role} candidacy. It has been about ${daysStale || 7} days since my last update, and I remain very enthusiastic about the opportunity to contribute to ${company}.\n\nPlease let me know if there are any additional materials, code samples, or details I can provide to assist your team in evaluating my application. Thank you so much for your time and consideration.\n\nWarm regards,\n${candidateName}\n\n[Generated via DeadlineDesk Ghost Buster]`;
      return res.json({ result: smartFollowUp, isFallback: true });
    }

    const prompt = `You are a polite, highly effective career coach. Write a professional follow-up email to a recruiter at "${company}" for the "${role}" position.
Context:
- It has been ${daysStale || 7} days since the candidate applied or last heard back.
- Current stage: "${status || 'Applied'}".
- Candidate Name: "${candidateName}".

Instructions:
- Keep it under 120 words.
- Enthusiastic, respectful, concise, and courteous.
- Include a clear, professional Subject line.`;

    const response = await getAIClient().models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      contents: prompt,
    });

    res.json({ result: response.text });
  } catch (err) {
    console.error("AI Follow-up error, falling back to smart template:", err.message);
    const user = await User.findById(req.userId || "").catch(() => null);
    const candidateName = user?.name || "Candidate";
    const smartFollowUp = `Subject: Following up: ${req.body.role || "Role"} Application - ${candidateName}\n\nHi ${req.body.company || "Company"} Recruiting Team,\n\nI hope you are having a great week.\n\nI am writing to respectfully check in regarding my ${req.body.role || "Software Engineer"} application. I remain very enthusiastic about the opportunity to contribute to ${req.body.company || "your team"}.\n\nPlease let me know if there is any other information I can provide. Thank you so much for your time.\n\nWarm regards,\n${candidateName}\n\n[Generated via DeadlineDesk Ghost Buster]`;
    res.json({ result: smartFollowUp, isFallback: true });
  }
});

// ----------------- NETWORKING & CONTACTS CRM ROUTES -----------------

// GET /api/contacts (List with optional filters)
app.get("/api/contacts", async (req, res) => {
  try {
    const payload = verifyToken(req);
    const { status, referralStatus, search } = req.query;

    let filter = { userId: payload.id };
    if (status && status !== "All") filter.status = status;
    if (referralStatus && referralStatus !== "All") filter.referralStatus = referralStatus;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { role: { $regex: search, $options: "i" } },
      ];
    }

    const contacts = await Contact.find(filter)
      .populate("internshipId", "company role status deadline")
      .sort({ updatedAt: -1 });

    res.json(contacts);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    res.status(500).json({ message: "Failed to fetch contacts" });
  }
});

// POST /api/contacts (Create new contact)
app.post("/api/contacts", async (req, res) => {
  try {
    const payload = verifyToken(req);
    const {
      name,
      company,
      role,
      email,
      linkedinUrl,
      outreachType,
      status,
      referralStatus,
      nextFollowUpDate,
      notes,
      internshipId,
    } = req.body;

    if (!name || !company) {
      return res.status(400).json({ message: "Name and Company are required." });
    }

    const today = new Date().toISOString().slice(0, 10);
    const currentStatus = status || "Identified";
    const initialHistory = [];

    if (currentStatus === "Contacted" || currentStatus === "Follow-up Sent") {
      initialHistory.push({
        date: today,
        note: `Initial outreach sent via ${outreachType || "Recruiter Pitch"}`,
        type: "Outreach"
      });
    }

    const contact = new Contact({
      userId: payload.id,
      internshipId: internshipId || null,
      name: name.trim(),
      company: company.trim(),
      role: role ? role.trim() : "Recruiter",
      email: email ? email.trim() : "",
      linkedinUrl: linkedinUrl ? linkedinUrl.trim() : "",
      outreachType: outreachType || "Recruiter Pitch",
      status: currentStatus,
      referralStatus: referralStatus || "None",
      lastContactDate: currentStatus !== "Identified" ? today : "",
      nextFollowUpDate: nextFollowUpDate || "",
      notes: notes || "",
      history: initialHistory,
    });

    await contact.save();
    res.status(201).json(contact);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    res.status(500).json({ message: "Failed to create contact" });
  }
});

// PUT /api/contacts/:id (Update contact)
app.put("/api/contacts/:id", async (req, res) => {
  try {
    const payload = verifyToken(req);
    const contact = await Contact.findOne({ _id: req.params.id, userId: payload.id });
    if (!contact) return res.status(404).json({ message: "Contact not found" });

    const today = new Date().toISOString().slice(0, 10);
    const prevStatus = contact.status;
    const prevReferral = contact.referralStatus;

    Object.assign(contact, req.body);

    // Track status change history automatically
    if (req.body.status && req.body.status !== prevStatus) {
      contact.lastContactDate = today;
      contact.history.push({
        date: today,
        note: `Status updated from "${prevStatus}" to "${req.body.status}"`,
        type: req.body.status === "Replied" ? "Reply" : "Follow-up"
      });
    }

    if (req.body.referralStatus && req.body.referralStatus !== prevReferral) {
      contact.history.push({
        date: today,
        note: `Referral status updated to "${req.body.referralStatus}"`,
        type: "Referral"
      });
    }

    await contact.save();
    res.json(contact);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    res.status(500).json({ message: "Failed to update contact" });
  }
});

// DELETE /api/contacts/:id
app.delete("/api/contacts/:id", async (req, res) => {
  try {
    const payload = verifyToken(req);
    const result = await Contact.findOneAndDelete({ _id: req.params.id, userId: payload.id });
    if (!result) return res.status(404).json({ message: "Contact not found" });
    res.json({ message: "Contact deleted successfully" });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    res.status(500).json({ message: "Failed to delete contact" });
  }
});

// POST /api/me/ai-actions/contact-outreach (Personalized AI Outreach Engine)
app.post("/api/me/ai-actions/contact-outreach", async (req, res) => {
  try {
    const payload = verifyToken(req);
    const user = await User.findById(payload.id);
    const { contactName, company, role, outreachType, targetRole, customNote } = req.body;
    const candidateName = user?.name || "Candidate";

    if (!process.env.GEMINI_API_KEY) {
      let smartDraft = "";
      if (outreachType === "Referral Request") {
        smartDraft = `Subject: Question regarding ${targetRole || "Software Engineering"} roles at ${company} — ${candidateName}\n\nHi ${contactName},\n\nI hope you are having a wonderful week!\n\nI noticed your great work as ${role || "Engineer"} at ${company}. I am currently preparing to apply for the ${targetRole || "Software Engineer"} position at ${company}. Having built full-stack projects in React and Node.js, I would be deeply grateful for your perspective on the team culture.\n\nIf you feel my background could be a strong fit, I would be honored to be considered for an internal referral. Regardless, thank you so much for your time and any quick advice!\n\nWarm regards,\n${candidateName}\n\n[Generated via DeadlineDesk Outreach Engine]`;
      } else if (outreachType === "Coffee Chat") {
        smartDraft = `Subject: Quick 10-min chat on your journey at ${company}? — ${candidateName}\n\nHi ${contactName},\n\nI came across your profile and was really inspired by your journey at ${company} as ${role || "Engineer"}.\n\nAs an aspiring software engineer preparing for tech internships, I'd love to learn about the engineering challenges your team tackles. Would you be open to a brief 10-15 minute virtual coffee chat sometime in the next couple of weeks?\n\nThank you so much for your time and guidance!\n\nBest regards,\n${candidateName}\n\n[Generated via DeadlineDesk Outreach Engine]`;
      } else {
        smartDraft = `Subject: Application & Inquiry: ${targetRole || "Software Engineer Intern"} at ${company} — ${candidateName}\n\nHi ${contactName},\n\nI recently applied for the ${targetRole || "Software Engineer"} opening at ${company} and wanted to reach out directly. With hands-on experience building scalable applications, I've developed full-stack systems with modern architectures.\n\nI admire ${company}'s products and would love to contribute to your engineering goals. Please let me know if you would be open to a brief conversation about how my skills align with the team.\n\nWarm regards,\n${candidateName}\n\n[Generated via DeadlineDesk Outreach Engine]`;
      }
      return res.json({ result: smartDraft, isFallback: true });
    }

    const prompt = `You are a world-class career strategist and networking coach. 
Write a highly compelling, personalized LinkedIn message or cold email from candidate "${candidateName}" to "${contactName}" who works as "${role}" at "${company}".

Goal of Outreach: "${outreachType || 'Recruiter Pitch'}"
Target Role Candidate is Pursuing: "${targetRole || 'Software Engineering Intern'}"
Additional Note / Context: "${customNote || 'N/A'}"
Candidate Resume Context: "${(user.resumeText || "").substring(0, 2500)}"

Instructions:
- Keep it concise (under 140 words).
- Make it warm, authentic, professional, and respectful of their time.
- Directly highlight 1 relevant achievement or project from the candidate's resume that proves technical credibility.
- Include a clear Subject line at the beginning.`;

    const response = await getAIClient().models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      contents: prompt,
    });

    res.json({ result: response.text });
  } catch (err) {
    console.error("AI Contact Outreach error, falling back to smart template:", err.message);
    const candidateName = req.body.candidateName || "Candidate";
    const smartDraft = `Subject: Reaching out regarding ${req.body.targetRole || "Software Engineering"} at ${req.body.company} — ${candidateName}\n\nHi ${req.body.contactName},\n\nI hope you're having a great week! I am reaching out regarding the ${req.body.targetRole || "Software Engineer"} role at ${req.body.company}. With a strong background in software engineering, I would love to connect and learn more about your team's current focus.\n\nThank you for your time and consideration!\n\nBest regards,\n${candidateName}`;
    res.json({ result: smartDraft, isFallback: true });
  }
});

// ----------------- APPLICATION CONVERSION FUNNEL & ANALYTICS -----------------

// GET /api/me/analytics
app.get("/api/me/analytics", async (req, res) => {
  try {
    const payload = verifyToken(req);
    const internships = await Internship.find({ userId: payload.id });
    const contacts = await Contact.find({ userId: payload.id });

    const totalApplied = internships.length;
    const stageCounts = {
      Applied: 0,
      OA: 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0,
      "No Response": 0,
    };

    internships.forEach(item => {
      const s = item.status || "Applied";
      if (stageCounts[s] !== undefined) stageCounts[s]++;
      else stageCounts.Applied++;
    });

    // Funnel milestones (A candidate who reached Interview also reached or bypassed OA)
    const oaReached = stageCounts.OA + stageCounts.Interview + stageCounts.Offer;
    const interviewReached = stageCounts.Interview + stageCounts.Offer;
    const offers = stageCounts.Offer;

    const funnel = {
      total: totalApplied,
      applied: totalApplied,
      oa: oaReached,
      interview: interviewReached,
      offer: offers,
      rejected: stageCounts.Rejected,
      noResponse: stageCounts["No Response"],
      rates: {
        appliedToOA: totalApplied > 0 ? Math.round((oaReached / totalApplied) * 100) : 0,
        oaToInterview: oaReached > 0 ? Math.round((interviewReached / oaReached) * 100) : (totalApplied > 0 ? Math.round((interviewReached / totalApplied) * 100) : 0),
        interviewToOffer: interviewReached > 0 ? Math.round((offers / interviewReached) * 100) : 0,
        overallConversion: totalApplied > 0 ? Math.round((offers / totalApplied) * 100) : 0,
      }
    };

    // Networking metrics
    const totalContacts = contacts.length;
    const contactedCount = contacts.filter(c => c.status !== "Identified").length;
    const repliedCount = contacts.filter(c => c.status === "Replied" || c.status === "Referral Secured").length;
    const referralsRequested = contacts.filter(c => c.referralStatus === "Requested" || c.referralStatus === "Confirmed").length;
    const referralsConfirmed = contacts.filter(c => c.referralStatus === "Confirmed").length;

    const todayStr = new Date().toISOString().slice(0, 10);
    const pendingFollowUps = contacts.filter(c => {
      if (c.status === "Replied" || c.status === "Referral Secured") return false;
      if (c.nextFollowUpDate && c.nextFollowUpDate <= todayStr) return true;
      if (c.status === "Contacted" && c.lastContactDate) {
        const diffDays = Math.round((new Date(todayStr) - new Date(c.lastContactDate)) / (1000 * 60 * 60 * 24));
        return diffDays >= 5;
      }
      return false;
    });

    const networking = {
      totalContacts,
      contactedCount,
      repliedCount,
      replyRate: contactedCount > 0 ? Math.round((repliedCount / contactedCount) * 100) : 0,
      referralsRequested,
      referralsConfirmed,
      referralWinRate: referralsRequested > 0 ? Math.round((referralsConfirmed / referralsRequested) * 100) : 0,
      pendingFollowUpCount: pendingFollowUps.length,
    };

    // Weekly Velocity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysStr = sevenDaysAgo.toISOString().slice(0, 10);

    const recentApps = internships.filter(i => i.appliedDate && i.appliedDate >= sevenDaysStr).length;
    const recentOutreach = contacts.filter(c => c.lastContactDate && c.lastContactDate >= sevenDaysStr).length;

    res.json({
      funnel,
      stageCounts,
      networking,
      weeklyVelocity: {
        recentApps,
        recentOutreach,
        weeklyGoal: 10,
        goalProgress: Math.min(100, Math.round((recentApps / 10) * 100)),
      }
    });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    res.status(500).json({ message: "Failed to compute analytics" });
  }
});

// ----------------- EMAIL PREFERENCES & NOTIFICATION ROUTES -----------------
const { initCronJobs, checkAndSendDeadlineAlerts } = require("./services/cronScheduler");
const { sendEmail } = require("./services/emailService");

// Initialize Cron Jobs
initCronJobs();

// GET /api/me/preferences
app.get("/api/me/preferences", async (req, res) => {
  try {
    const payload = verifyToken(req);
    const user = await User.findById(payload.id).select("emailPreferences email name");
    res.json({
      email: user.email,
      name: user.name,
      emailPreferences: user.emailPreferences || { deadlines: true, staleAlerts: true, weeklyDigest: true }
    });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    res.status(500).json({ message: "Failed to fetch preferences" });
  }
});

// PUT /api/me/preferences
app.put("/api/me/preferences", async (req, res) => {
  try {
    const payload = verifyToken(req);
    const { emailPreferences } = req.body;
    const user = await User.findByIdAndUpdate(
      payload.id,
      { emailPreferences },
      { new: true }
    ).select("emailPreferences");
    res.json(user.emailPreferences);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    res.status(500).json({ message: "Failed to update preferences" });
  }
});

// POST /api/me/test-email (Instantly triggers a test deadline notification)
app.post("/api/me/test-email", async (req, res) => {
  try {
    const payload = verifyToken(req);
    const user = await User.findById(payload.id);
    
    const result = await sendEmail({
      to: user.email,
      subject: "Test Notification: Deadline Alert Active ⚡",
      title: "Test Alert",
      htmlText: `Hi ${user.name}, your DeadlineDesk email notification system is active and working properly! You will receive automatic alerts 3 days and 1 day before any internship deadlines.`,
      actionLink: "http://localhost:3000/dashboard",
      actionText: "Go to Dashboard"
    });

    res.json({ message: "Test email dispatched successfully!", result });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    res.status(500).json({ message: "Failed to send test email" });
  }
});

// ----------------- AI EMAIL PARSER (2-Step Preview & Confidence Scoring) -----------------
app.post("/api/me/parse-email", async (req, res) => {
  try {
    const payload = verifyToken(req);
    const { emailText, action, targetId, customDate, customStatus } = req.body;

    if (!emailText || !emailText.trim()) {
      return res.status(400).json({ message: "Email text is required." });
    }

    // Duplicate Check using full normalized text hash (preventing prefix collisions)
    const emailHash = crypto.createHash("sha256").update(emailText.toLowerCase().replace(/\s+/g, " ").trim()).digest("hex");
    const userApps = await Internship.find({ userId: payload.id });
    const existingDuplicate = userApps.find(app => app.emailHashes && app.emailHashes.includes(emailHash));

    // STEP 2: EXPLICIT CONFIRM & SAVE
    if (action === "CONFIRM") {
      let targetDoc = null;
      if (targetId) {
        targetDoc = await Internship.findById(targetId);
      } else {
        // Fallback auto-match
        const promptComp = req.body.company || "";
        targetDoc = userApps.find(app => 
          app.company.toLowerCase().includes(promptComp.toLowerCase().trim()) ||
          promptComp.toLowerCase().includes(app.company.toLowerCase().trim())
        );
      }

      if (!targetDoc) {
        return res.status(404).json({ message: "Matching target application not found." });
      }

      const today = new Date().toISOString().slice(0, 10);
      const newStatus = customStatus || req.body.status || targetDoc.status;
      const newDate = customDate || req.body.extractedDate || targetDoc.deadline;

      targetDoc.status = newStatus;
      if (newDate) targetDoc.deadline = newDate;
      targetDoc.emailSource = true;
      targetDoc.lastEmailDate = today;
      if (!targetDoc.emailHashes.includes(emailHash)) {
        targetDoc.emailHashes.push(emailHash);
      }
      targetDoc.timeline.push({
        status: newStatus,
        date: today,
        note: `Updated via Email Scanner: ${req.body.summary || "Recruiter email processed"}`,
      });

      await targetDoc.save();
      return res.json({ success: true, updatedInternship: targetDoc });
    }

    // STEP 1: PARSE & PREVIEW WITH CONFIDENCE SCORES
    const selectedTarget = targetId ? userApps.find(a => a._id.toString() === targetId) : null;
    let parsed = null;

    if (process.env.GEMINI_API_KEY) {
      try {
        const prompt = `You are an AI assistant for DeadlineDesk. Analyze the following job-related email received by a student.
Extract the company name, category status, any deadline or interview date, and a short 1-sentence summary.
Calculate confidence scores from 0.00 to 1.00 for company, status, and date.

${selectedTarget ? `Known context: Candidate selected application for "${selectedTarget.company}" (${selectedTarget.role}).` : ""}

Valid Status Categories: "Applied", "Interview", "OA", "Offer", "Rejected", "No Response".

Email Content:
"${emailText.substring(0, 4000)}"

Return ONLY a valid JSON object with no markdown formatting:
{
  "company": "<exact company name or null>",
  "company_confidence": 0.95,
  "role": "<job role or null>",
  "role_confidence": 0.85,
  "status": "<one of Applied|Interview|OA|Offer|Rejected|No Response>",
  "status_confidence": 0.90,
  "extractedDate": "<YYYY-MM-DD date or null>",
  "date_confidence": 0.80,
  "summary": "<1 sentence explanation>",
  "overall_confidence": 0.88
}`;

        const response = await getAIClient().models.generateContent({
          model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
          contents: prompt,
        });

        const text = response.text || "{}";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        }
      } catch (geminiErr) {
        console.error("Gemini parse failed, falling back to rule-based parser:", geminiErr);
      }
    }

    // Rule-based fallback if no Gemini key or if Gemini call failed
    if (!parsed) {
      let detectedStatus = "Applied";
      let statusConf = 0.70;
      if (/offer|congratulations|pleased to offer|compensation package/i.test(emailText)) {
        detectedStatus = "Offer"; statusConf = 0.95;
      } else if (/interview|phone screen|technical round|chat with the team|availability for a call/i.test(emailText)) {
        detectedStatus = "Interview"; statusConf = 0.90;
      } else if (/online assessment|coding challenge|hackerrank|codesignal|oa\b|assessment link/i.test(emailText)) {
        detectedStatus = "OA"; statusConf = 0.92;
      } else if (/unfortunately|not moving forward|pursue other candidates|regret to inform|high volume of applicants/i.test(emailText)) {
        detectedStatus = "Rejected"; statusConf = 0.95;
      }

      let detectedCompany = null;
      let compConf = 0.60;
      // If user explicitly selected target in dropdown, prioritize it!
      if (selectedTarget) {
        detectedCompany = selectedTarget.company;
        compConf = 0.98;
      } else {
        // Match against existing applications first
        for (const app of userApps) {
          if (new RegExp(`\\b${app.company}\\b`, "i").test(emailText)) {
            detectedCompany = app.company;
            compConf = 0.90;
            break;
          }
        }
        if (!detectedCompany) {
          const compMatch = emailText.match(/(?:at|from|with|team at|careers at)\s+([A-Z][A-Za-z0-9&]+(?:\s+[A-Z][A-Za-z0-9&]+)?)/);
          if (compMatch && compMatch[1] && !["The", "Our", "This", "Your", "Please", "We", "I"].includes(compMatch[1])) {
            detectedCompany = compMatch[1];
            compConf = 0.80;
          }
        }
      }

      const dateMatch = emailText.match(/\b(202\d-[01]\d-[0-3]\d)\b/);
      const finalCompany = detectedCompany || selectedTarget?.company || "Company";
      const finalRole = selectedTarget?.role || "Software Engineer";

      parsed = {
        company: finalCompany,
        company_confidence: compConf,
        role: finalRole,
        role_confidence: selectedTarget ? 0.95 : 0.75,
        status: detectedStatus,
        status_confidence: statusConf,
        extractedDate: dateMatch ? dateMatch[1] : null,
        date_confidence: dateMatch ? 0.85 : 0.40,
        summary: `Identified update: ${detectedStatus} for ${finalCompany}.`,
        overall_confidence: Number(((compConf + statusConf) / 2).toFixed(2))
      };
    } else if (selectedTarget && (!parsed.company || parsed.company === "null")) {
      parsed.company = selectedTarget.company;
      parsed.company_confidence = 0.98;
      if (!parsed.role || parsed.role === "null") parsed.role = selectedTarget.role;
    }

    // Find possible matching internships for low confidence / multi-choice selection
    const possibleMatches = userApps.map(app => {
      let score = 0;
      if (parsed.company && app.company.toLowerCase().includes(parsed.company.toLowerCase().trim())) score += 0.6;
      if (parsed.role && app.role.toLowerCase().includes(parsed.role.toLowerCase().trim())) score += 0.3;
      return { _id: app._id, company: app.company, role: app.role, status: app.status, score };
    }).filter(m => m.score > 0).sort((a, b) => b.score - a.score);

    res.json({
      parsed,
      isDuplicate: !!existingDuplicate,
      duplicateDate: existingDuplicate ? (existingDuplicate.lastEmailDate || "earlier") : null,
      possibleMatches,
      emailHash
    });
  } catch (err) {
    console.error("AI Email Parse Error:", err);
    res.status(500).json({ message: "Failed to parse email." });
  }
});

// ----------------- LIVE JOB DISCOVERY HUBS -----------------
app.get("/api/me/recommendations", async (req, res) => {
  try {
    const payload = verifyToken(req);
    const userApps = await Internship.find({ userId: payload.id });
    const targetRole = userApps[0]?.role || "Software Engineer Intern";
    const encodedRole = encodeURIComponent(targetRole);

    const livePortals = [
      {
        portal: "LinkedIn Jobs",
        title: `${targetRole} Openings`,
        url: `https://www.linkedin.com/jobs/search/?keywords=${encodedRole}&f_E=1`,
        badge: "Live Search",
        badgeColor: "#0077b5",
        description: `Direct search on LinkedIn filtered for active student & internship postings.`
      },
      {
        portal: "Levels.fyi Internships",
        title: "Top Verified Tech Roles",
        url: "https://www.levels.fyi/internships/",
        badge: "Stipends & Salaries",
        badgeColor: "#10b981",
        description: "Explore verified software engineering internships with transparent stipend benchmarks."
      },
      {
        portal: "Indeed Jobs",
        title: `Fresh ${targetRole} Feed`,
        url: `https://www.indeed.com/jobs?q=${encodedRole}+internship&sort=date`,
        badge: "New Postings",
        badgeColor: "#2563eb",
        description: "Live postings from companies hiring right now, sorted by newest first."
      },
      {
        portal: "Simplify Hub",
        title: "Verified Community Roles",
        url: "https://simplify.jobs/",
        badge: "1-Click Apply",
        badgeColor: "#8b5cf6",
        description: "Real-time tech internship postings with instant 1-click autofill applications."
      }
    ];

    res.json({ recommendations: livePortals, targetRole });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    res.status(500).json({ message: "Failed to generate recommendations" });
  }
});

// ----------------- INTEGRATIONS & WEBHOOK ROUTES -----------------

// GET /api/me/calendar.ics (Generates iCalendar feed for Google/Apple Calendar)
app.get("/api/me/calendar.ics", async (req, res) => {
  try {
    const token = req.query.token || (req.headers.authorization ? req.headers.authorization.split(" ")[1] : null);
    if (!token) return res.status(401).send("Unauthorized");
    const payload = verifyToken({ headers: { authorization: `Bearer ${token}` } });

    const internships = await Internship.find({
      userId: payload.id,
      deadline: { $ne: "" }
    });

    let icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//DeadlineDesk//Internship Tracker//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH"
    ];

    internships.forEach(item => {
      const dateStr = item.deadline.replace(/-/g, ""); // YYYYMMDD
      icsContent.push(
        "BEGIN:VEVENT",
        `UID:${item._id}@deadlinedesk.local`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
        `DTSTART;VALUE=DATE:${dateStr}`,
        `SUMMARY:Deadline: ${item.company} (${item.role})`,
        `DESCRIPTION:Deadline for ${item.role} at ${item.company}. Status: ${item.status}`,
        "STATUS:CONFIRMED",
        "END:VEVENT"
      );
    });

    icsContent.push("END:VCALENDAR");

    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="deadlinedesk-calendar.ics"');
    res.send(icsContent.join("\r\n"));
  } catch (err) {
    console.error("Calendar export error:", err);
    res.status(500).send("Error generating calendar feed");
  }
});

// POST /api/me/api-key (Get or generate personal API key)
app.post("/api/me/api-key", async (req, res) => {
  try {
    const payload = verifyToken(req);
    let user = await User.findById(payload.id);
    if (!user.apiKey) {
      user.apiKey = "dd_sk_" + crypto.randomBytes(16).toString("hex");
      await user.save();
    }
    res.json({ apiKey: user.apiKey });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    res.status(500).json({ message: "Failed to generate API Key" });
  }
});

// POST /api/v1/webhooks/add-internship (Zapier / Webhook Ingestion API)
app.post("/api/v1/webhooks/add-internship", async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"] || req.body.apiKey;
    if (!apiKey) return res.status(401).json({ message: "Missing x-api-key header or body key" });

    const user = await User.findOne({ apiKey });
    if (!user) return res.status(403).json({ message: "Invalid API Key" });

    const { company, role, status, appliedDate, deadline, notes } = req.body;
    if (!company || !role) {
      return res.status(400).json({ message: "Company and role are required" });
    }

    const today = new Date().toISOString().slice(0, 10);
    const internship = new Internship({
      userId: user._id,
      company: company.trim(),
      role: role.trim(),
      status: status || "Applied",
      appliedDate: appliedDate || today,
      deadline: deadline || "",
      notes: notes || "Added via Webhook / Zapier integration",
      source: "webhook",
      timeline: [{ status: status || "Applied", date: today, note: "Added via Zapier/Webhook" }]
    });

    await internship.save();
    res.status(201).json({ success: true, message: "Internship added via Webhook", internship });
  } catch (err) {
    console.error("Webhook ingestion error:", err);
    res.status(500).json({ message: "Failed to ingest application via webhook" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));