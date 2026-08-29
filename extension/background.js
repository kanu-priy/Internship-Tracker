/* global chrome */

// ── DeadlineDesk — background service worker ──────────────────────────────
// 1. Dashboard sync bridge  (GET_PENDING / CLEAR_PENDING / SYNC_SAVED)
// 2. Deadline Alarm         (chrome.alarms every 3 hrs)
// 3. Track This handler     (save from content script)
// 4. Highlighter data       (GET_APPLIED_COMPANIES)


// ─────────────────────────────────────────────────────────────────────────
// 1. Dashboard sync bridge
// ─────────────────────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  // Fetch pending internships for dashboard sync
  if (request.type === "GET_PENDING") {
    chrome.storage.local.get(["pendingInternships"], (result) => {
      sendResponse({ data: result.pendingInternships || [] });
    });
    return true;
  }

  // Clear pending internships after dashboard sync
  if (request.type === "CLEAR_PENDING") {
    chrome.storage.local.set({ pendingInternships: [] }, () => {
      sendResponse({ success: true });
    });
    return true;
  }

  // Sync saved internships from database/dashboard
  if (request.type === "SYNC_SAVED") {
    chrome.storage.local.set(
      { savedInternships: request.items || [] },
      () => {
        sendResponse({ success: true });
      }
    );
  }

// 2. Deadline Alarm — every 3 hours via chrome.alarms
// ─────────────────────────────────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("deadlineCheck", { periodInMinutes: 180 });
  console.log("DeadlineDesk: deadline alarm registered");
});

chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create("deadlineCheck", { periodInMinutes: 180 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "deadlineCheck") {
    checkDeadlines();
  }
});

function checkDeadlines() {
  chrome.storage.local.get(
    ["savedInternships", "alarmsEnabled"],
    (result) => {
      if (result.alarmsEnabled === false) return;

      const items = result.savedInternships || [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      items.forEach((item) => {
        if (!item.deadline) return;

        const due = new Date(item.deadline);
        due.setHours(0, 0, 0, 0);

        const daysLeft = Math.round((due - today) / 86400000);

        // Notify at 3 days, 1 day, and deadline day
        if ([0, 1, 3].includes(daysLeft)) {
          const urgency =
            daysLeft === 0
              ? "⚠️ DUE TODAY"
              : daysLeft === 1
              ? "🔔 Due Tomorrow"
              : "📅 Due in 3 Days";

          const notifId = `dd-${item.company}-${daysLeft}`.replace(
            /\s+/g,
            "-"
          );

          chrome.notifications.create(notifId, {
            type: "basic",
            iconUrl: "icon.png",
            title: `${urgency} — ${item.company}`,
            message: `${item.role} · Deadline: ${item.deadline}`,
            priority: daysLeft === 0 ? 2 : 1,
          });
        }
      });

      // Stale logic check (no updates in >7 days)
      items.forEach((item) => {
        const closedStatuses = ["Rejected", "Offer", "No Response"];
        if (closedStatuses.includes(item.status)) return;

        let lastDate = new Date(item.appliedDate);
        if (item.timeline && item.timeline.length > 0) {
          lastDate = new Date(item.timeline[item.timeline.length - 1].date);
        } else if (item.updatedAt) {
          lastDate = new Date(item.updatedAt);
        }
        
        const daysSinceUpdate = Math.round((today - lastDate) / 86400000);
        
        // Notify if it's been exactly 7, 10, or 14 days (prevent spamming every day)
        if ([7, 10, 14].includes(daysSinceUpdate)) {
          const notifId = `stale-${item.company}-${daysSinceUpdate}`.replace(/\s+/g,"-");
          chrome.notifications.create(notifId, {
            type: "basic",
            iconUrl: "icon.png",
            title: `⚠️ Needs Attention — ${item.company}`,
            message: `You haven't updated your ${item.role} app in ${daysSinceUpdate} days. Any news?`,
            priority: 1,
          });
        }
      });
    }
  );
}


  // ─────────────────────────────────────────────────────────────────────────
  // 3 & 4. Internal messages from content script
  // ─────────────────────────────────────────────────────────────────────────

  // Save internship from "Save to DeadlineDesk" button (v2.0 rich extraction)
  if (request.type === "TRACK_THIS") {
    const {
      company, role,
      // V2.0 rich fields (will be "" if not extracted — safe defaults)
      location       = "",
      jobDescription = "",
      skills         = [],
      employmentType = "",
      stipend        = "",
      applicationUrl = "",
      source         = "linkedin",
    } = request.data;

    chrome.storage.local.get(
      ["pendingInternships", "savedInternships"],
      (result) => {
        const pending = result.pendingInternships || [];
        const saved = result.savedInternships || [];

        const newItem = {
          company,
          role,
          status:         "Applied",
          appliedDate:    new Date().toISOString().slice(0, 10),
          deadline:       "",
          savedAt:        new Date().toISOString(),
          // V2.0 rich fields
          location,
          jobDescription,
          skills,
          employmentType,
          stipend,
          applicationUrl,
          source,
        };

        pending.push(newItem);
        saved.push(newItem);

        chrome.storage.local.set(
          {
            pendingInternships: pending,
            savedInternships: saved,
          },
          () => {
            // Safe message to content script
            try {
              chrome.tabs.sendMessage(sender.tab.id, {
                type: "TRACK_CONFIRMED",
                company,
                role,
              });
            } catch(e) {}

            sendResponse({ success: true });
          }
        );
      }
    );

    return true;
  }

  // Return company list for already-applied highlighting
  if (request.type === "GET_APPLIED_COMPANIES") {
    chrome.storage.local.get(["savedInternships"], (result) => {
      const companies = (result.savedInternships || []).map((item) =>
        item.company.toLowerCase().trim()
      );

      sendResponse({ companies });
    });

    return true;
  }
});