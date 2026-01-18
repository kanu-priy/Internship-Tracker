import React from "react";

export default function MyAccount() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg border border-gray-200">
        
        <h1 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
          My Account
        </h1>

        {/* Profile Avatar */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold shadow-md">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-xl border">
            <p className="text-sm text-gray-500">Name</p>
            <p className="text-lg font-medium text-gray-800">{user?.name}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border">
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-lg font-medium text-gray-800">{user?.email}</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex flex-col gap-3">
          <button
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            Edit Profile
          </button>

          <button
            className="w-full py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition"
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
