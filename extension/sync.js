window.addEventListener("message", (event) => {
  if (event.source !== window) return;

  // React app asking for pending items
  if (event.data.type === "DD_GET_PENDING") {
    chrome.runtime.sendMessage({ type: "GET_PENDING" }, (response) => {
      window.postMessage({ type: "DD_PENDING_RESPONSE", data: response?.data || [] }, "*");
    });
  }

  // React app telling extension to clear pending items
  if (event.data.type === "DD_CLEAR_PENDING") {
    chrome.runtime.sendMessage({ type: "CLEAR_PENDING" }, () => {
      window.postMessage({ type: "DD_CLEAR_RESPONSE", success: true }, "*");
    });
  }

  // React app pushing saved internships to extension
  if (event.data.type === "DD_SYNC_SAVED") {
    chrome.runtime.sendMessage({ type: "SYNC_SAVED", items: event.data.items }, () => {
      window.postMessage({ type: "DD_SYNC_RESPONSE", success: true }, "*");
    });
  }
});
