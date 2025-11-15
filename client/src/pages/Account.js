import React from "react";

export default function Account() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">My Account</h1>

      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        <p className="text-lg">
          <strong>Name:</strong> {user.name}
        </p>
        <p className="text-lg mt-3">
          <strong>Email:</strong> {user.email}
        </p>
      </div>
    </div>
  );
}
