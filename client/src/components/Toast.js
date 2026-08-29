import React, { useEffect } from "react";

export default function Toast({ message, type = "success", onClose, duration = 3500 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const isError = type === "error";

  return (
    <div className="toast-container">
      <style>{`
        .toast-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 10px;
          background: ${isError ? "#fef2f2" : "#f0fdf4"};
          color: ${isError ? "#991b1b" : "#166534"};
          border: 1px solid ${isError ? "#fecaca" : "#bbf7d0"};
          padding: 12px 18px;
          border-radius: 10px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 14px;
          font-weight: 500;
          animation: slideUp 0.3s ease-out forwards;
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .toast-close {
          background: none;
          border: none;
          color: currentColor;
          cursor: pointer;
          font-size: 16px;
          padding: 0;
          margin-left: 8px;
          display: flex;
          align-items: center;
          opacity: 0.7;
        }
        .toast-close:hover {
          opacity: 1;
        }
      `}</style>
      <span>{isError ? "⚠️" : "✅"}</span>
      <span>{message}</span>
      <button className="toast-close" onClick={onClose}>✕</button>
    </div>
  );
}
