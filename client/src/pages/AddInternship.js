import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function AddInternship() {
  const navigate = useNavigate();

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [appliedDate, setAppliedDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState("Applied");
  const [error, setError] = useState("");

  // Redirect if no token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, []);

  // const handleSubmit = (e) => {
  //   e.preventDefault();

  //   if (!company || !role || !appliedDate) {
  //     setError("Please fill in company, role, and applied date");
  //     return;
  //   }

  //   const newInternship = { company, role, appliedDate, deadline, status };

  //   const savedInternships =
  //     JSON.parse(localStorage.getItem("internships")) || [];

  //   savedInternships.push(newInternship);
  //   localStorage.setItem("internships", JSON.stringify(savedInternships));

  //   navigate("/dashboard");
  // };
  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/api/internships", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        company,
        role,
        status,
        appliedDate,
        deadline,
      }),
    });

    if (!res.ok) throw new Error("Save failed");

    navigate("/dashboard");
  } catch (err) {
    console.error(err);
    alert("Failed to add internship");
  }
};


  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) setError("");
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white shadow-lg rounded-xl p-8"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Add Internship</h2>

        {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}

        <input
          type="text"
          placeholder="Company"
          value={company}
          onChange={handleInputChange(setCompany)}
          className="w-full p-3 mb-3 border rounded-md"
        />

        <input
          type="text"
          placeholder="Role/Position"
          value={role}
          onChange={handleInputChange(setRole)}
          className="w-full p-3 mb-3 border rounded-md"
        />

        {/* Applied Date – dynamic date/text */}
        <input
          type={appliedDate ? "date" : "text"}
          placeholder="Applied Date"
          value={appliedDate}
          onFocus={(e) => (e.target.type = "date")}
          onBlur={(e) => {
            if (!appliedDate) e.target.type = "text";
          }}
          onChange={handleInputChange(setAppliedDate)}
          className="w-full p-3 mb-3 border rounded-md"
        />

        {/* Deadline – dynamic date/text */}
        <input
          type={deadline ? "date" : "text"}
          placeholder="Deadline / OA / Interview Date"
          value={deadline}
          onFocus={(e) => (e.target.type = "date")}
          onBlur={(e) => {
            if (!deadline) e.target.type = "text";
          }}
          onChange={handleInputChange(setDeadline)}
          className="w-full p-3 mb-3 border rounded-md"
        />

        <select
          value={status}
          onChange={handleInputChange(setStatus)}
          className="w-full p-3 mb-4 border rounded-md"
        >
          <option value="Applied">Applied</option>
          <option value="Interview">Interview</option>
          <option value="OA">OA</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
        </select>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 rounded-md"
        >
          Add Internship
        </button>

        <p className="text-center mt-4 text-sm">
          <Link to="/dashboard" className="text-blue-600 underline">
            Back to Dashboard
          </Link>
        </p>
      </form>
    </div>
  );
}
