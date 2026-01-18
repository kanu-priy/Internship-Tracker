document.getElementById("saveBtn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { type: "EXTRACT_INTERNSHIP" },
      (response) => {

        if (!response || !response.company || !response.role) {
          alert(" Could not extract internship details");
          return;
        }

        chrome.storage.local.get(["token"], async (result) => {
          const token = result.token;

          if (!token) {
            alert("Please login to DeadlineDesk first");
            return;
          }

          try {
            const res = await fetch("http://localhost:5000/api/internships", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                company: response.company,
                role: response.role,
                status: "Applied",
                appliedDate: new Date().toISOString().slice(0, 10),
                deadline: "",
              }),
            });

            if (!res.ok) throw new Error("Save failed");

            alert("✅ Internship saved successfully");
          } catch (err) {
            console.error(err);
            alert("Failed to save internship");
          }
        });
      }
    );
  });
});

// // const saveBtn = document.getElementById("saveBtn");
// // const statusEl = document.getElementById("status");

// // saveBtn.addEventListener("click", () => {
// //   statusEl.innerText = "⏳ Extracting...";

// //   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
// //     if (!tabs[0]) {
// //       statusEl.innerText = "❌ No active tab";
// //       return;
// //     }

// //     chrome.tabs.sendMessage(
// //       tabs[0].id,
// //       { type: "EXTRACT_INTERNSHIP" },
// //       async (response) => {
// //         console.log("📥 Popup received:", response);

// //         if (!response || !response.company || !response.role) {
// //           statusEl.innerText = "❌ Extraction failed";
// //           return;
// //         }

// //         statusEl.innerText = "💾 Saving...";

// //         try {
// //           const res = await fetch("http://localhost:5000/api/internships", {
// //             method: "POST",
// //             headers: {
// //               "Content-Type": "application/json",
// //             },
// //             body: JSON.stringify({
// //               company: response.company,
// //               role: response.role,
// //               status: "Applied",
// //               appliedDate: new Date().toISOString().slice(0, 10),
// //               deadline: "",
// //             }),
// //           });

// //           if (!res.ok) throw new Error();

// //           statusEl.innerText = "✅ Saved successfully!";
// //         } catch (err) {
// //           console.error(err);
// //           statusEl.innerText = "❌ Save failed";
// //         }
// //       }
// //     );
// //   });
// // });
