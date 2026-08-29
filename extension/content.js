// ── DeadlineDesk — content script v2.0 ───────────────────────────────────
// Feature A: "Save to DeadlineDesk" floating button on LinkedIn & Internshala
//            Now extracts: company, role, location, JD, skills, stipend, URL, source
// Feature B: Already-Applied company highlighter (runs + watches for SPA nav)

(function () {
  "use strict";

  const host          = window.location.hostname;
  const isLinkedIn    = host.includes("linkedin.com");
  const isInternshala = host.includes("internshala.com");

  if (!isLinkedIn && !isInternshala) return;

  // ── Helpers ──────────────────────────────────────────────────────────────

  function getText(selectors, doc = document) {
    for (const sel of selectors) {
      const elements = doc.querySelectorAll(sel);
      for (const el of elements) {
        const t = el.innerText?.trim();
        if (t && t.length > 1 && t.length < 500) return t;
      }
    }
    return "";
  }

  function extractSkillsFromText(text) {
    if (!text) return [];
    const TECH_KEYWORDS = [
      "javascript","typescript","python","java","c++","c#","go","rust","kotlin","swift",
      "react","vue","angular","nextjs","node.js","nodejs","express","django","flask","spring",
      "sql","mysql","postgresql","mongodb","redis","firebase","graphql","rest","api",
      "html","css","tailwind","sass","bootstrap","docker","kubernetes","aws","azure","gcp",
      "git","linux","machine learning","deep learning","tensorflow","pytorch","scikit",
      "data structures","algorithms","system design","oop","microservices",
      "react native","flutter","android","ios","figma","redux",
      "numpy","pandas","opencv","spark","hadoop","kafka","elasticsearch",
      "networking","os","dbms","data science","computer vision","blockchain",
    ];
    const lower = text.toLowerCase();
    return TECH_KEYWORDS.filter((kw) => lower.includes(kw));
  }

  // ── Rich job info extraction ──────────────────────────────────────────────
  function extractJobInfo() {
    let company = "", role = "", location = "", jobDescription = "",
        skills = [], employmentType = "", stipend = "",
        applicationUrl = window.location.href,
        source = isLinkedIn ? "linkedin" : "internshala";

    if (isLinkedIn) {
      // Role
      role = getText([
        ".job-details-jobs-unified-top-card__job-title h1",
        ".jobs-unified-top-card__job-title h1",
        ".job-details-jobs-unified-top-card__job-title",
        ".jobs-unified-top-card__job-title",
        ".t-24.t-bold.inline",
        "h1.t-24",
        "h2.t-24",
        "h1",
        ".job-card-list__title",
        ".artdeco-entity-lockup__title"
      ]);

      // Company — named selectors
      company = getText([
        ".job-details-jobs-unified-top-card__company-name a",
        ".job-details-jobs-unified-top-card__company-name",
        ".jobs-unified-top-card__company-name a",
        ".jobs-unified-top-card__company-name",
        ".topcard__org-name-link",
        ".job-card-container__primary-description",
        ".artdeco-entity-lockup__subtitle"
      ]);

      // Company — /company/ anchor scan fallback
      if (!company) {
        for (const a of document.querySelectorAll("a[href*='/company/']")) {
          const t = a.innerText?.trim();
          if (t && t.length > 1 && t.length < 200) { company = t; break; }
        }
      }

      // Company — subtitle fallback
      if (!company) {
        company = getText([
          ".job-details-jobs-unified-top-card__primary-description-without-tagline",
          ".job-details-jobs-unified-top-card__primary-description",
          ".jobs-unified-top-card__subtitle-primary-grouping",
        ])?.split("·")[0]?.trim() || "";
      }

      // Title tag fallback
      if (!role || !company) {
        const titleParts = document.title.replace(/^\(\d+\+?\)\s*/, "").split(" | ");
        if (titleParts.length >= 2) {
          if (!role) role = titleParts[0].trim();
          if (!company) company = titleParts[1].trim();
        }
      }
      
      if (!role) role = "Unknown Role";
      if (!company) company = "Unknown Company";

      // Location
      location = getText([
        ".job-details-jobs-unified-top-card__primary-description-without-tagline .tvm__text",
        ".jobs-unified-top-card__bullet",
        ".jobs-unified-top-card__workplace-type",
      ]);

      // Employment type
      employmentType = getText([
        ".job-details-jobs-unified-top-card__job-insight--highlight .ui-label",
        ".jobs-unified-top-card__workplace-type",
      ]);

      // Full Job Description text
      const jdEl = document.querySelector(
        ".jobs-description__content .jobs-box__html-content, " +
        ".jobs-description-content__text, " +
        ".jobs-description__content"
      );
      if (jdEl) jobDescription = jdEl.innerText?.trim()?.slice(0, 4000) || "";

      // Skills from JD
      skills = extractSkillsFromText(jobDescription);

      // Also check explicit skill tags
      document.querySelectorAll(
        ".job-details-skill-match-status-list span, .job-details-how-you-match__skills-item-subtitle"
      ).forEach((el) => {
        const t = el.innerText?.trim().toLowerCase();
        if (t && !skills.includes(t)) skills.push(t);
      });
    }

    if (isInternshala) {
      // Role
      role = getText([
        ".heading_4_5",
        ".internship_heading h1",
        ".profile h1",
        ".internship-heading h1",
        "h1",
      ]);

      // Company
      company = getText([
        ".company_name a",
        ".company_name",
        ".company-name a",
        ".company-name",
        ".internship_header .company",
        "a.link_display_like_text",
      ]);

      // Location
      location = getText([
        ".location_link",
        ".other_detail_item .item_body.basic_info_txt:first-of-type",
        ".internship_other_details_container .location",
      ]);

      // Stipend
      stipend = getText([
        ".stipend_container .stipend",
        "#stipend",
        ".stipend",
      ]);

      // Employment type
      employmentType = "Internship";

      // Full JD
      const jdEl = document.querySelector(
        "#internship_description, .internship-details, .about_internship"
      );
      if (jdEl) jobDescription = jdEl.innerText?.trim()?.slice(0, 4000) || "";

      skills = extractSkillsFromText(jobDescription);

      // Debug log if extraction fails
      if (!company || !role) {
        console.log("DeadlineDesk debug:", {
          h1: document.querySelector("h1")?.innerText,
          allCompanyEls: [...document.querySelectorAll("[class*='company']")]
            .map(e => ({ class: e.className, text: e.innerText?.trim().slice(0, 50) })),
        });
      }
    }

    return { company, role, location, jobDescription, skills, employmentType, stipend, applicationUrl, source };
  }

  // ── Feature A — "Save to DeadlineDesk" floating button ──────────────────
  let trackBtn  = null;
  let toast     = null;
  let hideTimer = null;

  function injectTrackButton() {
    if (document.getElementById("dd-track-btn")) return;

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
      Save to DeadlineDesk`;

    Object.assign(trackBtn.style, {
      position:      "fixed",
      bottom:        "28px",
      right:         "28px",
      zIndex:        "2147483647",
      display:       "flex",
      alignItems:    "center",
      gap:           "7px",
      padding:       "10px 20px",
      background:    "#0f172a",
      border:        "1px solid rgba(255,255,255,0.1)",
      borderRadius:  "30px",
      color:         "#ffffff",
      fontFamily:    "'Inter', -apple-system, sans-serif",
      fontWeight:    "600",
      fontSize:      "13px",
      cursor:        "pointer",
      boxShadow:     "0 4px 12px rgba(0,0,0,0.15)",
      transition:    "transform .15s, box-shadow .2s",
      letterSpacing: "0.01em",
    });

    trackBtn.addEventListener("mouseenter", () => {
      trackBtn.style.transform = "translateY(-2px)";
      trackBtn.style.boxShadow = "0 8px 24px rgba(0,0,0,0.2)";
    });
    trackBtn.addEventListener("mouseleave", () => {
      trackBtn.style.transform = "";
      trackBtn.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
    });

    trackBtn.addEventListener("click", handleTrack);
    document.body.appendChild(trackBtn);

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
    toast.textContent       = msg;
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
    const jobInfo = extractJobInfo();
    const { company, role } = jobInfo;

    if (!company && !role) {
      showToast("❌ Couldn't read job details from this page", true);
      return;
    }

    trackBtn.style.background = "#10b981";
    trackBtn.style.color = "#ffffff";
    trackBtn.innerHTML = "⏳ Saving...";

    // Send ALL extracted fields to background
    try {
      chrome.runtime.sendMessage({ type: "TRACK_THIS", data: jobInfo }, (res) => {
        if (chrome.runtime.lastError) {
          trackBtn.style.background = "#ef4444";
          trackBtn.innerHTML = "❌ Failed";
          showToast("❌ Please refresh the page. Extension was updated.", true);
        } else if (res?.success) {
          trackBtn.innerHTML = "✅ Saved!";
          showToast(`✅ "${role || company}" saved to DeadlineDesk`);
          runHighlighter();
        } else {
          trackBtn.style.background = "#ef4444";
          trackBtn.innerHTML = "❌ Failed";
          showToast("❌ Save failed — try again", true);
        }
        setTimeout(() => {
          trackBtn.style.background = "#0f172a";
          trackBtn.style.color = "#ffffff";
          trackBtn.innerHTML = `
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5"
                 stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            Save to DeadlineDesk`;
        }, 2500);
      });
    } catch (e) {
      if (e.message.includes("Extension context invalidated")) {
        trackBtn.style.background = "#ef4444";
        trackBtn.innerHTML = "🔄 Refresh Page";
        showToast("❌ Extension was updated. Please refresh the page!", true);
      }
    }
  }

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "TRACK_CONFIRMED") {
      showToast(`✅ Saved: ${msg.role} @ ${msg.company}`);
    }
  });

  // ── Feature B — Already-Applied Highlighter (unchanged) ──────────────────
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
      cardEl.style.borderLeft  = "3px solid rgba(16,185,129,0.55)";
      cardEl.style.paddingLeft = "4px";
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
      if (matchesApplied(el.innerText || "", applied))
        markApplied(el, el.closest(".individual_internship"));
    });
  }

  // ── Init ──────────────────────────────────────────────────────────────────
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