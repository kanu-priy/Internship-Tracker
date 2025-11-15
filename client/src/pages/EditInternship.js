import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function EditInternship() {
  const navigate = useNavigate();
  const { index } = useParams(); // internship index from URL

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [appliedDate, setAppliedDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState("Applied");
  const [error, setError] = useState("");

  useEffect(() => {
    const internships = JSON.parse(localStorage.getItem("internships")) || [];

    // if index is invalid
    if (!internships[index]) {
      navigate("/dashboard");
      return;
    }

    const data = internships[index];

    setCompany(data.company);
    setRole(data.role);
    setAppliedDate(data.appliedDate);
    setDeadline(data.deadline || "");
    setStatus(data.status);
  }, [index, navigate]);

  const handleUpdate = (e) => {
    e.preventDefault();

    if (!company || !role || !appliedDate) {
      setError("Company, Role, and Applied Date are required");
      return;
    }

    const updatedInternship = {
      company,
      role,
      appliedDate,
      deadline,
      status,
    };

    const internships = JSON.parse(localStorage.getItem("internships")) || [];
    internships[index] = updatedInternship; // update specific internship
    localStorage.setItem("internships", JSON.stringify(internships));

    navigate("/dashboard");
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleUpdate}
        className="w-full max-w-md bg-white shadow-lg rounded-xl p-8"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          Edit Internship
        </h2>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <input
          type="text"
          placeholder="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="w-full p-3 mb-3 border rounded-md"
        />

        <input
          type="text"
          placeholder="Role / Position"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-3 mb-3 border rounded-md"
        />

        <input
          type="date"
          value={appliedDate}
          onChange={(e) => setAppliedDate(e.target.value)}
          className="w-full p-3 mb-3 border rounded-md"
        />

        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full p-3 mb-3 border rounded-md"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
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
          className="w-full bg-blue-600 text-white py-3 rounded-md"
        >
          Update Internship
        </button>

        <p className="text-center mt-4 text-sm">
          <a href="/dashboard" className="text-blue-600 underline">
            Back to Dashboard
          </a>
        </p>
      </form>
    </div>
  );
}
