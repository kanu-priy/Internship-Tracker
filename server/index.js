require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const { GoogleGenAI } = require("@google/genai");

const upload = multer({ storage: multer.memoryStorage() });
const ai = new GoogleGenAI({}); // will use process.env.GEMINI_API_KEY if available

const User = require("./models/User");
const Internship = require("./models/Internship");

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
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      let text = response.text || "{}";
      text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
      const result = JSON.parse(text);
      if (typeof result.score === "number") {
        return result;
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
      return res.status(400).json({ message: "Gemini API Key is not configured." });
    }

    const prompt = `You are a career coach. Write a short, highly compelling cold email (or LinkedIn DM) to a recruiter at "${company}" for the "${role}" role. 
Use the candidate's resume and the job description to personalize it. Make it professional but conversational. Do not include subject lines if it's a DM, just the body. Limit to 150 words.

Candidate Resume: "${(user.resumeText || "").substring(0, 3000)}"
Job Description: "${(jobDescription || "").substring(0, 3000)}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    res.json({ result: response.text });
  } catch (err) {
    console.error("AI Email error:", err);
    res.status(500).json({ message: "Failed to generate email." });
  }
});

app.post("/api/me/ai-actions/interview", async (req, res) => {
  try {
    const payload = verifyToken(req);
    const user = await User.findById(payload.id);
    const { company, role, jobDescription, skills } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ message: "Gemini API Key is not configured." });
    }

    const prompt = `You are an expert technical interviewer at "${company}" interviewing a candidate for the "${role}" role. 
Based on the job description and the required skills (${skills?.join(', ')}), what are the top 5 most likely interview questions you will ask this candidate?
Provide a mix of technical and behavioral questions tailored to their resume. Output it as a clean Markdown list.

Candidate Resume: "${(user.resumeText || "").substring(0, 3000)}"
Job Description: "${(jobDescription || "").substring(0, 3000)}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    res.json({ result: response.text });
  } catch (err) {
    console.error("AI Interview error:", err);
    res.status(500).json({ message: "Failed to generate interview questions." });
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

// ----------------- AI EMAIL PARSER & AUTO-SYNC -----------------
app.post("/api/me/parse-email", async (req, res) => {
  try {
    const payload = verifyToken(req);
    const { emailText, autoApply } = req.body;

    if (!emailText || !emailText.trim()) {
      return res.status(400).json({ message: "Email text is required." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ message: "Gemini API Key is not configured." });
    }

    const prompt = `You are an AI assistant for DeadlineDesk, an internship tracker. Analyze the following job-related email received by a student.
Extract the company name, category status, any deadline or interview date, and a short 1-sentence summary.

Valid Status Categories: "Applied", "Interview", "OA", "Offer", "Rejected", "No Response".

Email Content:
"${emailText.substring(0, 4000)}"

Return ONLY a valid JSON object with no markdown formatting:
{
  "company": "<company name or null>",
  "role": "<job role or null>",
  "status": "<one of Applied|Interview|OA|Offer|Rejected|No Response>",
  "extractedDate": "<YYYY-MM-DD date or null>",
  "summary": "<1 sentence explanation>"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let text = response.text || "{}";
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(text);

    let updatedInternship = null;

    if (autoApply && parsed.company) {
      const companyRegex = new RegExp(`^${parsed.company.trim()}$`, "i");
      let existing = await Internship.findOne({
        userId: payload.id,
        company: companyRegex,
      });

      if (!existing) {
        // Fallback loose regex search
        existing = await Internship.findOne({
          userId: payload.id,
          company: { $regex: parsed.company.trim(), $options: "i" },
        });
      }

      if (existing) {
        const today = new Date().toISOString().slice(0, 10);
        existing.status = parsed.status || existing.status;
        if (parsed.extractedDate) {
          existing.deadline = parsed.extractedDate;
        }
        existing.timeline.push({
          status: parsed.status,
          date: today,
          note: `Auto-updated via Email Scanner: ${parsed.summary}`,
        });
        await existing.save();
        updatedInternship = existing;
      }
    }

    res.json({ parsed, updatedInternship });
  } catch (err) {
    console.error("AI Email Parse Error:", err);
    res.status(500).json({ message: "Failed to parse email." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));