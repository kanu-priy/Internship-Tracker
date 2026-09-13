# ⚡ DeadlineDesk — Intelligent Career & Internship Copilot

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Available-success?style=for-the-badge&logo=render)](https://deadlinedesk-qefj.onrender.com)
[![Chrome Extension](https://img.shields.io/badge/Chrome%20Extension-Pre--Configured%20ZIP-blue?style=for-the-badge&logo=googlechrome)](https://deadlinedesk-qefj.onrender.com/deadlinedesk-extension.zip)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> **DeadlineDesk** is a production-grade career operating system designed to automate your internship and job search workflows. It pairs a **full-stack React & Node.js web dashboard** with a **two-way synced Chrome extension**, automated deadline alarms, ATS resume keyword matching, and a recruiter CRM.

🌐 **Live Deployed App:** [https://deadlinedesk-qefj.onrender.com](https://deadlinedesk-qefj.onrender.com)  
📦 **Download Chrome Extension:** [deadlinedesk-extension.zip](https://deadlinedesk-qefj.onrender.com/deadlinedesk-extension.zip)

---

## ✨ Core Features

* 📊 **Kanban Pipeline:** Visual drag-and-drop board across `Applied` ➔ `OA` ➔ `Interview` ➔ `Offer` ➔ `Rejected` ➔ `No Response`.
* ⚡ **Today Command Center:** Dynamic "Next Best Action" algorithm that calculates your single most urgent task today and flags applications stale for >7 days.
* 🧩 **Two-Way Synced Chrome Extension:** Save jobs directly from LinkedIn and Internshala with 1 click, view upcoming deadlines, and get desktop alarms 3 days, 1 day, and day-of.
* 🎯 **ATS Resume Matcher & Scorer:** Analyzes keyword overlap between your saved resume and job descriptions, highlighting missing tech skills and rewriting bullet points.
* 👥 **Recruiter & Networking CRM:** Track contacts, referrals, and generate hyper-personalized AI cold outreach drafts.
* 📥 **Zero-Risk AI Email Scanner:** Paste OA or interview email updates to automatically extract company, stage, and deadline dates with 1-click database updates.
* 📅 **Calendar Sync & CSV Export:** Export deadlines directly into Google Calendar / Apple Calendar (`.ics`), or export your full dataset to CSV with zero lock-in.
* 💡 **1-Click Demo Onboarding:** New users can click *"⚡ Load Sample Demo Data"* on an empty dashboard to test the complete platform with authentic tier-1 internship workflows.

---

## 🧩 How to Install the Chrome Extension (Free — 30 Seconds)

The extension is **pre-configured** to connect directly to the live cloud server:

1. **Download:** Click [**Download Extension (.zip)**](https://deadlinedesk-qefj.onrender.com/deadlinedesk-extension.zip) or grab `deadlinedesk-extension.zip` from this repository.
2. **Unzip:** Extract the downloaded ZIP file to a folder on your computer.
3. **Open Chrome Extensions:**
   * In Google Chrome, go to `chrome://extensions/`.
   * In the top-right corner, toggle **Developer mode** to **ON**.
4. **Load Unpacked:**
   * Click **Load unpacked** in the top-left corner.
   * Select the unzipped `extension` folder.
5. **Start Browsing:**
   * Open [LinkedIn Jobs](https://www.linkedin.com/jobs) or [Internshala](https://internshala.com).
   * Click **"Save to DeadlineDesk"** on any job — it syncs straight into your live dashboard!

---

## 🛠️ Architecture & Tech Stack

* **Frontend:** React 19, React Router v7, Custom Bespoke CSS System, Responsive Kanban.
* **Backend:** Node.js, Express 5, MongoDB Atlas (Mongoose 8), JWT Authentication, bcrypt.
* **AI Engine:** Google Gemini AI SDK (`@google/genai`) with algorithmic offline fallback.
* **Browser Extension:** Manifest V3, Service Workers, Content Script injection, Chrome Storage & Alarms.
* **Hosting:** Render (Unified Node & Static SPA deployment), MongoDB Atlas Cloud.

---

## 💻 Local Development Setup

If you want to run DeadlineDesk locally:

### 1. Clone the repository
```bash
git clone https://github.com/kanu-priy/Internship-Tracker.git
cd Internship-Tracker
```

### 2. Install dependencies
```bash
npm run install:all
```

### 3. Configure Environment Variables
Create a `.env` file in the `server/` directory:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/internship_tracker
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run the application
```bash
# Terminal 1: Start Backend Server
npm run server

# Terminal 2: Start React Client
npm run client
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
