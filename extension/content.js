chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type !== "EXTRACT_INTERNSHIP") return;

  let company = "";
  let role = "";

  const host = window.location.hostname;

  // 🔹 LINKEDIN
  if (host.includes("linkedin.com")) {
    // Job role
    role = document.querySelector("h1")?.innerText?.trim() || "";

    // Company from aria-label (remove "logo")
    const companyAnchor = [...document.querySelectorAll("a")]
      .find(a => a.href?.includes("/company/"));

    company =
      companyAnchor
        ?.getAttribute("aria-label")
        ?.replace(" logo", "")
        .trim() || "";
  }

  // 🔹 INTERNSHALA
  if (host.includes("internshala.com")) {
    role =
      document.querySelector(".heading_4_5")?.innerText?.trim() || "";

    company =
      document.querySelector(".company_name a")?.innerText?.trim() || "";
  }

  console.log("📌 DeadlineDesk Extracted:", { company, role });

  sendResponse({ company, role });
  return true;
});
// // // chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
// // //   if (request.type !== "EXTRACT_INTERNSHIP") return;

// // //   let company = "";
// // //   let role = "";

// // //   if (location.hostname.includes("linkedin.com")) {
// // //     role = document.querySelector("h1")?.innerText?.trim() || "";

// // //     const companyAnchor = [...document.querySelectorAll("a")]
// // //       .find(a => a.href?.includes("/company/"));

// // //     if (companyAnchor) {
// // //       company =
// // //         companyAnchor.getAttribute("aria-label")
// // //           ?.replace(" logo", "")
// // //           .trim()
// // //         || companyAnchor.innerText.trim();
// // //     }
// // //   }

// // //   // =======================
// // //   // ✅ INTERNSHALA
// // //   // =======================
// // //   if (host.includes("internshala.com")) {
// // //     role =
// // //       document.querySelector(".heading_4_5")?.innerText.trim() || "";

// // //     company =
// // //       document.querySelector(".company_name a")?.innerText.trim() || "";
// // //   }

// // //   console.log("📌 DeadlineDesk Extracted:", { company, role });

// // //   sendResponse({ company, role });
// // //   return true;
// // // });
// // // chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
// // //   if (request.type !== "EXTRACT_INTERNSHIP") return;

// // //   let company = "";
// // //   let role = "";
// // //   const host = window.location.hostname;

// // //   // 🔹 LINKEDIN
// // //   if (host.includes("linkedin.com")) {
// // //     role = document.querySelector("h1")?.innerText?.trim() || "";

// // //     const companyAnchor = [...document.querySelectorAll("a")]
// // //       .find(a => a.href && a.href.includes("/company/"));

// // //     company =
// // //       companyAnchor
// // //         ?.getAttribute("aria-label")
// // //         ?.replace(" logo", "")
// // //         .trim() || "";
// // //   }

// // //   // 🔹 INTERNSHALA
// // //   if (host.includes("internshala.com")) {
// // //     role =
// // //       document.querySelector(".heading_4_5")?.innerText?.trim() || "";
// // //     company =
// // //       document.querySelector(".company_name a")?.innerText?.trim() || "";
// // //   }

// // //   console.log("Extracted:", { company, role });

// // //   sendResponse({ company, role });
// // //   return true;
// // // });
// // chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
// //   if (request.type !== "EXTRACT_INTERNSHIP") return;

// //   let company = "";
// //   let role = "";
// //   const host = window.location.hostname;

// //   // 🔹 LINKEDIN
// //   // if (host.includes("linkedin.com")) {
// //   //   // Role
// //   //   role =
// //   //     document.querySelector("h1")?.innerText?.trim() ||
// //   //     document.querySelector(".jobs-unified-top-card__job-title")?.innerText?.trim() ||
// //   //     "";

// //   //   // Company
// //   //   const companyAnchor = [...document.querySelectorAll("a")]
// //   //     .find(a => a.href && a.href.includes("/company/"));

// //   //   company =
// //   //     companyAnchor
// //   //       ?.getAttribute("aria-label")
// //   //       ?.replace(" logo", "")
// //   //       .trim() || "";
// //   // }
  
// //    if (host.includes("linkedin.com")) {
// //     role = document.querySelector("h1")?.innerText?.trim() || "";

// //     const companyAnchor = [...document.querySelectorAll("a")]
// //       .find(a => a.href && a.href.includes("/company/"));

// //     company =
// //       companyAnchor
// //         ?.getAttribute("aria-label")
// //         ?.replace(" logo", "")
// //         .trim() || "";
// //   }
// //   // 🔹 INTERNSHALA
// //   if (host.includes("internshala.com")) {
// //     role = document.querySelector(".heading_4_5")?.innerText?.trim() || "";
// //     company = document.querySelector(".company_name a")?.innerText?.trim() || "";
// //   }

// //   console.log("✅ Extracted:", { company, role });

// //   sendResponse({ company, role });
// //   return true;
// // });
