// ── DeadlineDesk — background service worker ──────────────────────────────
// 1. Dashboard sync bridge  (GET_PENDING / CLEAR_PENDING)
// 2. Deadline Alarm         (chrome.alarms every 3 hrs)
// 3. Track This handler     (save from content script)
// 4. Highlighter data       (GET_APPLIED_COMPANIES)

// ─────────────────────────────────────────────────────────────────────────
// 1. Dashboard sync bridge
// ─────────────────────────────────────────────────────────────────────────
chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_PENDING") {
    chrome.storage.local.get(["pendingInternships"], (result) => {
      sendResponse({ data: result.pendingInternships || [] });
    });
    return true;
  }

  if (request.type === "CLEAR_PENDING") {
    chrome.storage.local.set({ pendingInternships: [] }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// ─────────────────────────────────────────────────────────────────────────
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
  if (alarm.name === "deadlineCheck") checkDeadlines();
});

function checkDeadlines() {
  // Respect user toggle — if alarmsEnabled is false, skip
  chrome.storage.local.get(["savedInternships", "alarmsEnabled"], (result) => {
    if (result.alarmsEnabled === false) return;

    const items = result.savedInternships || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    items.forEach((item) => {
      if (!item.deadline) return;

      const due = new Date(item.deadline);
      due.setHours(0, 0, 0, 0);
      const daysLeft = Math.round((due - today) / 86400000);

      // Notify at 3 days, 1 day, and day-of
      if ([0, 1, 3].includes(daysLeft)) {
        const urgency =
          daysLeft === 0 ? "⚠️ DUE TODAY"
          : daysLeft === 1 ? "🔔 Due Tomorrow"
          : "📅 Due in 3 Days";

        const notifId = `dd-${item.company}-${daysLeft}`.replace(/\s+/g, "-");

        chrome.notifications.create(notifId, {
          type:     "basic",
          iconUrl:  "icon.png",
          title:    `${urgency} — ${item.company}`,
          message:  `${item.role} · Deadline: ${item.deadline}`,
          priority: daysLeft === 0 ? 2 : 1,
        });
      }
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────
// 3 & 4. Internal messages from content script
// ─────────────────────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  // "Track This" button clicked on job page → save to local queue
  if (request.type === "TRACK_THIS") {
  const { company, role } = request.data;

  chrome.storage.local.get(
    ["pendingInternships", "savedInternships"],
    (result) => {
      const pending = result.pendingInternships || [];
      const saved = result.savedInternships || [];

      const newItem = {
        company,
        role,
        status: "Applied",
        appliedDate: new Date().toISOString().slice(0, 10),
        deadline: "",
        savedAt: new Date().toISOString(),
      };

      pending.push(newItem);
      saved.push(newItem);

      chrome.storage.local.set(
        {
          pendingInternships: pending,
          savedInternships: saved,
        },
        () => {
          chrome.tabs.sendMessage(sender.tab.id, {
            type: "TRACK_CONFIRMED",
            company,
            role,
          });

          sendResponse({ success: true });
        }
      );
    }
  );

  return true;
}

  // Already-Applied highlighter → return lowercased company list
  if (request.type === "GET_APPLIED_COMPANIES") {
    chrome.storage.local.get(["savedInternships"], (result) => {
      const companies = (result.savedInternships || []).map((i) =>
        i.company.toLowerCase().trim()
      );
      sendResponse({ companies });
    });
    return true;
  }
});