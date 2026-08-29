// ── DeadlineDesk Popup ────────────────────────────────────────────────────
// Tab 1 (Add):    Manual entry form
// Tab 2 (Queue):  View & delete saved applications
// Tab 3 (Alarms): Deadline alarm toggle + upcoming deadlines list

let selectedStatus = "Applied";

// ── Toast ─────────────────────────────────────────────────────────────────
function showToast(msg, type = "info", ms = 2600) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.className = `toast ${type} show`;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), ms);
}

// ── Storage helpers ───────────────────────────────────────────────────────
// loadQueue reads savedInternships (for display in popup Queue tab)
function loadQueue(cb) {
  chrome.storage.local.get(["savedInternships"], (r) => cb(r.savedInternships || []));
}

// saveQueue writes savedInternships (popup display) AND pendingInternships (dashboard sync)
function saveQueue(items, cb) {
  // ✅ FIX: always keep pendingInternships in sync with savedInternships
  chrome.storage.local.get(["pendingInternships"], (r) => {
    const currentPending = r.pendingInternships || [];

    // Find items that are in savedInternships but not yet in pendingInternships
    const pendingKeys = new Set(
      currentPending.map((i) => `${i.company}|${i.role}|${i.appliedDate}`)
    );

    const newPending = [...currentPending];
    items.forEach((item) => {
      const key = `${item.company}|${item.role}|${item.appliedDate}`;
      if (!pendingKeys.has(key)) {
        newPending.push(item);
        pendingKeys.add(key);
      }
    });

    chrome.storage.local.set(
      { savedInternships: items, pendingInternships: newPending },
      () => {
        refreshBadges(items);
        if (cb) cb(items);
      }
    );
  });
}

// ── Tab navigation ────────────────────────────────────────────────────────
function initTabs() {
  document.querySelectorAll(".nav-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".nav-tab").forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
      tab.classList.add("active");
      const viewId = tab.dataset.view;
      document.getElementById(viewId).classList.add("active");
      if (viewId === "view-queue")  loadQueue(renderQueue);
      if (viewId === "view-alarms") loadQueue(renderAlarms);
    });
  });
}

// ── Badge counts in nav tabs ──────────────────────────────────────────────
function refreshBadges(items) {
  document.getElementById("tab-queue-count").textContent = items.length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const urgentCount = items.filter((i) => {
    if (!i.deadline) return false;
    const due = new Date(i.deadline);
    due.setHours(0, 0, 0, 0);
    return Math.round((due - today) / 86400000) <= 3;
  }).length;

  const badge = document.getElementById("tab-alarm-count");
  badge.style.display = urgentCount > 0 ? "inline" : "none";
  badge.textContent   = urgentCount;
}

// ── Status pills ──────────────────────────────────────────────────────────
function initStatusPills() {
  document.querySelectorAll(".s-pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".s-pill").forEach((b) => (b.className = "s-pill"));
      selectedStatus = btn.dataset.s;
      const statusClass = selectedStatus.replace(" ", "-");
      btn.classList.add(`sel-${statusClass}`);
    });
  });
}

// ── Render queue list ─────────────────────────────────────────────────────
function renderQueue(items) {
  const list = document.getElementById("queueList");
  list.innerHTML = "";

  if (!items.length) {
    list.innerHTML = `<div class="empty-state"><span><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></span>Nothing saved yet.<br>Use the Add tab or "Track This" on a job page.</div>`;
    return;
  }

  items.forEach((item, i) => {
    const div = document.createElement("div");
    div.className = "q-item";
    const statusClass = item.status.replace(" ", "-");
    div.innerHTML = `
      <div class="q-item-info">
        <div class="q-company">${item.company}</div>
        <div class="q-role">${item.role}</div>
        <div class="q-date">Applied: ${item.appliedDate}${item.deadline ? " · Due: " + item.deadline : ""}</div>
      </div>
      <span class="q-status qs-${statusClass}">${item.status}</span>
      <button class="btn-del-q" data-i="${i}" title="Remove">✕</button>
    `;
    list.appendChild(div);
  });

  list.querySelectorAll(".btn-del-q").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.i);
      loadQueue((current) => {
        const removed = current.splice(idx, 1)[0];

        // ✅ FIX: also remove from pendingInternships
        chrome.storage.local.get(["pendingInternships"], (r) => {
          const pending = (r.pendingInternships || []).filter(
            (p) => !(p.company === removed.company && p.role === removed.role && p.appliedDate === removed.appliedDate)
          );
          chrome.storage.local.set({ pendingInternships: pending });
        });

        saveQueue(current, renderQueue);
        showToast("Removed", "info");
      });
    });
  });
}

// ── Render alarms / upcoming deadlines ────────────────────────────────────
function renderAlarms(items) {
  const list = document.getElementById("upcomingList");
  list.innerHTML = "";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = items
    .filter((i) => i.deadline)
    .map((i) => {
      const due = new Date(i.deadline);
      due.setHours(0, 0, 0, 0);
      return { ...i, daysLeft: Math.round((due - today) / 86400000) };
    })
    .filter((i) => i.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 6);

  if (!upcoming.length) {
    list.innerHTML = `<div class="empty-state"><span><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg></span>No upcoming deadlines.<br>Add a deadline when logging an application.</div>`;
    return;
  }

  upcoming.forEach((item) => {
    const div = document.createElement("div");
    div.className = "deadline-item";

    const urgencyClass = item.daysLeft === 0 ? "urgency-hot"
                       : item.daysLeft <= 3  ? "urgency-soon"
                       :                       "urgency-normal";
    const daysClass    = item.daysLeft === 0 ? "days-hot"
                       : item.daysLeft <= 3  ? "days-soon"
                       :                       "days-ok";
    const daysLabel    = item.daysLeft === 0 ? "Today!"
                       : item.daysLeft === 1 ? "Tomorrow"
                       :                       `${item.daysLeft}d left`;

    div.innerHTML = `
      <div class="deadline-urgency ${urgencyClass}"></div>
      <div class="deadline-info">
        <div class="deadline-company">${item.company}</div>
        <div class="deadline-role">${item.role}</div>
      </div>
      <div class="deadline-days ${daysClass}">${daysLabel}</div>
    `;
    list.appendChild(div);
  });
}

// ── Inline confirm (replaces browser confirm() which is blocked in MV3) ──
function inlineConfirm(message, onConfirm) {
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position:fixed; inset:0; z-index:999;
    background:rgba(255,255,255,0.85); backdrop-filter:blur(4px);
    display:flex; align-items:center; justify-content:center;
  `;
  overlay.innerHTML = `
    <style>
      #ic-cancel:hover { border-color: #cccccc !important; }
      #ic-confirm:hover { background: #b54d42 !important; color: #fff !important; }
    </style>
    <div style="background:#ffffff;border:1px solid #eaeaea;
                border-radius:8px;padding:24px 20px;max-width:260px;width:90%;text-align:center;box-shadow:0 10px 25px rgba(0,0,0,0.05);">
      <div style="font-size:13px;color:#111827;font-weight:500;margin-bottom:18px;line-height:1.5;">${message}</div>
      <div style="display:flex;gap:8px;justify-content:center;">
        <button id="ic-cancel" style="flex:1;padding:9px;background:#ffffff;
          border:1px solid #eaeaea;border-radius:6px;color:#111827;
          font-size:12px;font-weight:500;cursor:pointer;font-family:inherit;transition:all .2s;">Cancel</button>
        <button id="ic-confirm" style="flex:1;padding:9px;background:#ffffff;
          border:1px solid #b54d42;border-radius:6px;color:#b54d42;
          font-size:12px;font-weight:500;cursor:pointer;font-family:inherit;transition:all .2s;">Clear All</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector("#ic-cancel").addEventListener("click",  () => overlay.remove());
  overlay.querySelector("#ic-confirm").addEventListener("click", () => { overlay.remove(); onConfirm(); });
}

// ── Main ──────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {

  // Default applied date = today
  document.getElementById("inp-date").value = new Date().toISOString().slice(0, 10);

  // Load initial badge counts
  loadQueue(refreshBadges);

  initTabs();
  initStatusPills();

  // ── Highlight if already applied (based on active tab) ───────────────────
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0 && tabs[0].url && !tabs[0].url.startsWith("chrome://")) {
      const title = (tabs[0].title || "").toLowerCase();
      chrome.storage.local.get(["savedInternships"], (r) => {
        const saved = r.savedInternships || [];
        const appliedItem = saved.find(item => item.company && title.includes(item.company.toLowerCase()));
        
        if (appliedItem) {
          // Pre-fill form
          document.getElementById("inp-company").value = appliedItem.company;
          document.getElementById("inp-role").value = appliedItem.role;
          
          // Highlight save button
          const btn = document.getElementById("saveBtn");
          btn.innerHTML = `⚠️ Already Applied (${appliedItem.appliedDate})`;
          btn.style.background = "var(--amber-dim)";
          btn.style.color = "var(--amber)";
          btn.style.borderColor = "var(--amber)";
        }
      });
    }
  });

  // ── Save button ───────────────────────────────────────────────────────────
  document.getElementById("saveBtn").addEventListener("click", () => {
    const company  = document.getElementById("inp-company").value.trim();
    const role     = document.getElementById("inp-role").value.trim();
    const date     = document.getElementById("inp-date").value;
    const deadline = document.getElementById("inp-deadline").value;

    if (!company) { showToast("Enter a company name", "error"); return; }
    if (!role)    { showToast("Enter a role / position", "error"); return; }
    if (!date)    { showToast("Select the applied date", "error"); return; }

    // ✅ FIX: load BOTH keys and write to BOTH
    chrome.storage.local.get(["savedInternships", "pendingInternships"], (result) => {
      const saved   = result.savedInternships   || [];
      const pending = result.pendingInternships || [];

      const newItem = {
        company, role,
        status:      selectedStatus,
        appliedDate: date,
        deadline:    deadline || "",
        savedAt:     new Date().toISOString(),
      };

      saved.push(newItem);
      pending.push(newItem); // ✅ dashboard reads this

      chrome.storage.local.set({ savedInternships: saved, pendingInternships: pending }, () => {
        refreshBadges(saved);
        showToast(`✅ Saved: ${role} @ ${company}`, "success");
        document.getElementById("inp-company").value  = "";
        document.getElementById("inp-role").value     = "";
        document.getElementById("inp-deadline").value = "";
      });
    });
  });

  // ── Clear all ────────────────────────────────────────────────────────────
  document.getElementById("clearAllBtn").addEventListener("click", () => {
    inlineConfirm("Clear all saved applications?", () => {
      // ✅ FIX: clear BOTH keys
      chrome.storage.local.set({ savedInternships: [], pendingInternships: [] }, () => {
        refreshBadges([]);
        renderQueue([]);
        showToast("Queue cleared", "info");
      });
    });
  });

  // ── Alarm toggle ──────────────────────────────────────────────────────────
  chrome.storage.local.get(["alarmsEnabled"], (r) => {
    document.getElementById("alarmToggle").checked = r.alarmsEnabled !== false;
  });
  document.getElementById("alarmToggle").addEventListener("change", (e) => {
    chrome.storage.local.set({ alarmsEnabled: e.target.checked });
    showToast(e.target.checked ? "🔔 Alarms on" : "🔕 Alarms off", "info");
  });

  // ── Test notification ─────────────────────────────────────────────────────
  document.getElementById("testAlarmBtn").addEventListener("click", () => {
    chrome.notifications.create("dd-test-" + Date.now(), {
      type:     "basic",
      iconUrl:  "icon.png",
      title:    "⚠️ DUE TODAY — Google",
      message:  "SWE Intern · Deadline: today",
      priority: 2,
    });
    showToast("Test notification fired!", "success");
  });

  // ── Open dashboard ────────────────────────────────────────────────────────
  // const openDash = () => chrome.tabs.create({ url: "http://localhost:3000/dashboard" });
  // document.getElementById("openDashboard").addEventListener("click",  openDash);
  // document.getElementById("openDashboard2").addEventListener("click", openDash);
   const openDash = () => {
  chrome.tabs.query({ url: "http://localhost:3000/*" }, (tabs) => {
    if (tabs.length > 0) {
      // Dashboard already open — reload it so autoSync fires
      chrome.tabs.reload(tabs[0].id);
      chrome.tabs.update(tabs[0].id, { active: true });
    } else {
      // Not open — open fresh tab
      chrome.tabs.create({ url: "http://localhost:3000/dashboard" });
    }
  });
};

document.getElementById("openDashboard").addEventListener("click",  openDash);
document.getElementById("openDashboard2").addEventListener("click", openDash);
});