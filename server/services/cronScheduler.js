const cron = require("node-cron");
const Internship = require("../models/Internship");
const User = require("../models/User");
const { sendEmail } = require("./emailService");

function initCronJobs() {
  console.log("⏰ Initializing Cron Scheduler...");

  // Daily Deadline Check at 8:00 AM ('0 8 * * *')
  cron.schedule("0 8 * * *", async () => {
    console.log("⏰ Running Daily Deadline Alert Check...");
    await checkAndSendDeadlineAlerts();
  });

  // Weekly Digest on Sundays at 9:00 AM ('0 9 * * 0')
  cron.schedule("0 9 * * 0", async () => {
    console.log("⏰ Running Weekly Digest Check...");
    await checkAndSendWeeklyDigest();
  });
}

async function checkAndSendDeadlineAlerts() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all users with deadline alerts enabled
    const users = await User.find({ "emailPreferences.deadlines": { $ne: false } });

    for (const user of users) {
      const internships = await Internship.find({
        userId: user._id,
        deadline: { $ne: "" },
        status: { $nin: ["Offer", "Rejected", "No Response"] }
      });

      for (const item of internships) {
        const due = new Date(item.deadline);
        due.setHours(0, 0, 0, 0);
        const daysLeft = Math.round((due - today) / (1000 * 60 * 60 * 24));

        if (daysLeft === 1 || daysLeft === 3) {
          await sendEmail({
            to: user.email,
            subject: `Action Needed: ${item.company} ${item.role} deadline is in ${daysLeft} day${daysLeft > 1 ? "s" : ""}!`,
            title: `Deadline Warning (${daysLeft} Day${daysLeft > 1 ? "s" : ""})`,
            htmlText: `Your application for <strong>${item.role}</strong> at <strong>${item.company}</strong> has an upcoming deadline on <strong>${item.deadline}</strong>. Don't forget to submit or follow up!`,
            actionLink: `http://localhost:3000/dashboard`,
            actionText: "Open Dashboard"
          });
        }
      }
    }
  } catch (err) {
    console.error("❌ Deadline alert cron failed:", err);
  }
}

async function checkAndSendWeeklyDigest() {
  try {
    const users = await User.find({ "emailPreferences.weeklyDigest": { $ne: false } });

    for (const user of users) {
      const internships = await Internship.find({ userId: user._id });
      if (internships.length === 0) continue;

      const active = internships.filter(i => !["Offer", "Rejected", "No Response"].includes(i.status)).length;
      
      await sendEmail({
        to: user.email,
        subject: `Your Weekly Application Digest 📊`,
        title: "Weekly Summary",
        htmlText: `Hi ${user.name}, here is your application progress this week:<br/><br/>
        • <strong>${internships.length}</strong> Total Applications Tracked<br/>
        • <strong>${active}</strong> Active Pipelines In-Progress<br/><br/>
        Keep the momentum going! Check your dashboard to view personalized AI follow-ups and action items.`,
        actionLink: "http://localhost:3000/dashboard",
        actionText: "Go to Dashboard"
      });
    }
  } catch (err) {
    console.error("❌ Weekly digest cron failed:", err);
  }
}

module.exports = { initCronJobs, checkAndSendDeadlineAlerts, checkAndSendWeeklyDigest };
