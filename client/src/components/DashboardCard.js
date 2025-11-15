import React from "react";

export default function DashboardCard({ title, count, color }) {
  return (
    <div className={`p-4 rounded-lg shadow-md text-white ${color}`}>
      <p className="text-sm">{title}</p>
      <p className="text-2xl font-bold">{count}</p>
    </div>
  );
}
