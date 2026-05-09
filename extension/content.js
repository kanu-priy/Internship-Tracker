// ── DeadlineDesk — content script ─────────────────────────────────────────
// Feature A: "Track This" floating button on LinkedIn & Internshala
// Feature B: Already-Applied company highlighter (runs + watches for SPA nav)

(function () {
  "use strict";

  const host          = window.location.hostname;
  const isLinkedIn    = host.includes("linkedin.com");
  const isInternshala = host.includes("internshala.com");

  if (!isLinkedIn && !isInternshala) return;

  // ── Helpers ──────────────────────────────────────────────────────────────
  function extractJobInfo() {
    let company = "", role = "";

    if (isLinkedIn) {
      // Role
      for (const sel of [
        ".job-details-jobs-unified-top-card__job-title h1",
        ".jobs-unified-top-card__job-title h1",
        ".t-24.t-bold.inline",
        "h1",
      ]) {
        const t = document.querySelector(sel)?.innerText?.trim();
        if (t && t.length > 1 && t.length < 200) { role = t; break; }
      }

      // Company — named selectors
      for (const sel of [
        ".job-details-jobs-unified-top-card__company-name a",
        ".job-details-jobs-unified-top-card__company-name",
        ".jobs-unified-top-card__company-name a",
        ".jobs-unified-top-card__company-name",
        "a.app-aware-link[href*='/company/']",
        ".topcard__org-name-link",
      ]) {
        const t = document.querySelector(sel)?.innerText?.trim();
        if (t && t.length > 1 && t.length < 200) { company = t; break; }
      }

      // Company — /company/ anchor scan
      if (!company) {
        for (const a of document.querySelectorAll("a[href*='/company/']")) {
          const t = a.innerText?.trim();
          if (t && t.length > 1 && t.length < 200) { company = t; break; }
        }
      }

      // Company — subtitle "CompanyName · Location · ..." fallback
      if (!company) {
        for (const sel of [
          ".job-details-jobs-unified-top-card__primary-description-without-tagline",
          ".job-details-jobs-unified-top-card__primary-description",
          ".jobs-unified-top-card__subtitle-primary-grouping",
        ]) {
          const first = document.querySelector(sel)?.innerText?.split("·")[0]?.trim();
          if (first && first.length > 1 && first.length < 200) { company = first; break; }
        }
      }
    }

    if (isInternshala) {
  // Role — try multiple selectors
  for (const sel of [
    ".heading_4_5",
    ".internship_heading h1",
    ".profile h1",
    ".internship-heading h1",
    "h1",
  ]) {
    const t = document.querySelector(sel)?.innerText?.trim();
    if (t && t.length > 1 && t.length < 200) { role = t; break; }
  }

  // Company — try multiple selectors
  for (const sel of [
    ".company_name a",
    ".company_name",
    ".company-name a",
    ".company-name",
    ".internship_header .company",
    "a.link_display_like_text",
  ]) {
    const t = document.querySelector(sel)?.innerText?.trim();
    if (t && t.length > 1 && t.length < 200) { company = t; break; }
  }

  // Fallback — log what's available
  if (!company || !role) {
    console.log("DeadlineDesk debug:", {
      h1: document.querySelector("h1")?.innerText,
      allCompanyEls: [...document.querySelectorAll("[class*='company']")].map(e => ({ class: e.className, text: e.innerText?.trim() }))
    });
  }
}
}

  // ── Feature A — "Track This" floating button ──────────────────────────────
  let trackBtn    = null;
  let toast       = null;
  let hideTimer   = null;

  function injectTrackButton() {
    if (document.getElementById("dd-track-btn")) return;

    // Button
    trackBtn = document.createElement("button");
    trackBtn.id = "dd-track-btn";
    trackBtn.innerHTML = `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2.5"
           stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="16"/>
        <line x1="8" y1="12" x2="16" y2="12"/>
      </svg>
      Track This`;

    Object.assign(trackBtn.style, {
      position:      "fixed",
      bottom:        "28px",
      right:         "28px",
      zIndex:        "2147483647",
      display:       "flex",
      alignItems:    "center",
      gap:           "7px",
      padding:       "10px 20px",
      background:    "linear-gradient(135deg,#f59e0b,#d97706)",
      border:        "none",
      borderRadius:  "30px",
      color:         "#000",
      fontFamily:    "'DM Sans',system-ui,sans-serif",
      fontWeight:    "700",
      fontSize:      "13px",
      cursor:        "pointer",
      boxShadow:     "0 6px 24px rgba(245,158,11,0.55),0 2px 8px rgba(0,0,0,0.3)",
      transition:    "transform .15s,box-shadow .2s",
      letterSpacing: "0.01em",
    });

    trackBtn.addEventListener("mouseenter", () => {
      trackBtn.style.transform = "translateY(-2px)";
      trackBtn.style.boxShadow = "0 10px 32px rgba(245,158,11,0.65),0 2px 8px rgba(0,0,0,0.3)";
    });
    trackBtn.addEventListener("mouseleave", () => {
      trackBtn.style.transform = "";
      trackBtn.style.boxShadow = "0 6px 24px rgba(245,158,11,0.55),0 2px 8px rgba(0,0,0,0.3)";
    });

    trackBtn.addEventListener("click", handleTrack);
    document.body.appendChild(trackBtn);

    // Toast
    toast = document.createElement("div");
    toast.id = "dd-toast";
    Object.assign(toast.style, {
      position:       "fixed",
      bottom:         "78px",
      right:          "28px",
      zIndex:         "2147483647",
      padding:        "9px 16px",
      background:     "rgba(8,12,20,0.93)",
      border:         "1px solid rgba(16,185,129,0.4)",
      borderRadius:   "12px",
      color:          "#6ee7b7",
      fontFamily:     "'DM Sans',system-ui,sans-serif",
      fontSize:       "13px",
      fontWeight:     "500",
      backdropFilter: "blur(14px)",
      opacity:        "0",
      transform:      "translateY(8px)",
      transition:     "opacity .25s,transform .25s",
      pointerEvents:  "none",
      whiteSpace:     "nowrap",
    });
    document.body.appendChild(toast);
  }

  function showToast(msg, isError = false) {
    toast.textContent      = msg;
    toast.style.color       = isError ? "#fca5a5" : "#6ee7b7";
    toast.style.borderColor = isError ? "rgba(248,113,113,0.4)" : "rgba(16,185,129,0.4)";
    toast.style.opacity     = "1";
    toast.style.transform   = "translateY(0)";
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      toast.style.opacity   = "0";
      toast.style.transform = "translateY(8px)";
    }, 3000);
  }

  function handleTrack() {
    const { company, role } = extractJobInfo();

    if (!company && !role) {
      showToast("❌ Couldn't read job details from this page", true);
      return;
    }

    // Optimistic UI — turn green immediately
    trackBtn.style.background = "linear-gradient(135deg,#10b981,#059669)";
    trackBtn.innerHTML = "✅ Tracked!";

    chrome.runtime.sendMessage({ type: "TRACK_THIS", data: { company, role } }, (res) => {
      if (res?.success) {
        showToast(`✅ "${role || company}" saved to queue`);
        runHighlighter(); // re-highlight immediately
      } else {
        showToast("❌ Save failed — try again", true);
      }
      // Reset button after 2.5s
      setTimeout(() => {
        trackBtn.style.background = "linear-gradient(135deg,#f59e0b,#d97706)";
        trackBtn.innerHTML = `
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5"
               stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          Track This`;
      }, 2500);
    });
  }

  // Background may also send TRACK_CONFIRMED — handle gracefully
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "TRACK_CONFIRMED") {
      showToast(`✅ Saved: ${msg.role} @ ${msg.company}`);
    }
  });

  // ── Feature B — Already-Applied Highlighter ───────────────────────────────
  function runHighlighter() {
    chrome.runtime.sendMessage({ type: "GET_APPLIED_COMPANIES" }, (res) => {
      if (!res?.companies?.length) return;
      if (isLinkedIn)    highlightLinkedIn(res.companies);
      if (isInternshala) highlightInternshala(res.companies);
    });
  }

  function markApplied(nameEl, cardEl) {
    if (nameEl.dataset.ddMarked) return;
    nameEl.dataset.ddMarked = "1";

    const badge = document.createElement("span");
    badge.textContent = "✓ Applied";
    Object.assign(badge.style, {
      display:       "inline-flex",
      alignItems:    "center",
      marginLeft:    "8px",
      padding:       "2px 8px",
      background:    "rgba(16,185,129,0.15)",
      border:        "1px solid rgba(16,185,129,0.35)",
      borderRadius:  "20px",
      color:         "#34d399",
      fontSize:      "11px",
      fontWeight:    "600",
      fontFamily:    "'DM Sans',system-ui,sans-serif",
      verticalAlign: "middle",
      whiteSpace:    "nowrap",
    });
    nameEl.appendChild(badge);

    if (cardEl) {
      cardEl.style.borderLeft   = "3px solid rgba(16,185,129,0.55)";
      cardEl.style.paddingLeft  = "4px";
    }
  }

  function matchesApplied(name, applied) {
    const n = name.toLowerCase().trim();
    return applied.some((a) => n.includes(a) || a.includes(n.split(" ")[0]));
  }

  function highlightLinkedIn(applied) {
    document.querySelectorAll(".job-card-container").forEach((card) => {
      const nameEl = card.querySelector(
        ".job-card-container__company-name," +
        ".artdeco-entity-lockup__subtitle," +
        ".job-card-container__primary-description"
      );
      if (!nameEl) return;
      if (matchesApplied(nameEl.innerText || "", applied)) markApplied(nameEl, card);
    });
  }

  function highlightInternshala(applied) {
    document.querySelectorAll(".company_name, .internship_meta").forEach((el) => {
      if (matchesApplied(el.innerText || "", applied)) markApplied(el, el.closest(".individual_internship"));
    });
  }

  // ── Init ────────────────────────────────────────────────────────────────────
  function init() {
    injectTrackButton();
    runHighlighter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Re-run highlighter on LinkedIn SPA navigation
  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      setTimeout(runHighlighter, 1200);
    }
  }).observe(document.body, { childList: true, subtree: true });

})();