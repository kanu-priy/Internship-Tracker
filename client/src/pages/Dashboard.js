// import React, { useEffect, useState } from "react";
// import Navbar from "../components/Navbar";
// import Sidebar from "../components/Sidebar";
// import DashboardCard from "../components/DashboardCard";

// export default function Dashboard() {
//   const [user, setUser] = useState({});
//   const [internships, setInternships] = useState([]);

//   useEffect(() => {
//     const storedUser = localStorage.getItem("user");
//     if (storedUser) setUser(JSON.parse(storedUser));

//     // Placeholder internship data
//     setInternships([
//       { company: "Google", role: "Software Intern", status: "Applied", date: "2025-11-10" },
//       { company: "Microsoft", role: "Frontend Intern", status: "Interview", date: "2025-11-12" },
//       { company: "Adobe", role: "Backend Intern", status: "Offer", date: "2025-11-08" },
//     ]);
//   }, []);

//   // Count by status
//   const summary = internships.reduce(
//     (acc, item) => {
//       acc[item.status] = (acc[item.status] || 0) + 1;
//       return acc;
//     },
//     { Applied: 0, Interview: 0, Offer: 0, Rejected: 0 }
//   );

//   const statusColors = {
//     Applied: "bg-blue-500",
//     Interview: "bg-yellow-500",
//     Offer: "bg-green-500",
//     Rejected: "bg-red-500",
//   };

//   return (
//     <div className="flex min-h-screen">
//       <Sidebar />

//       <div className="flex-1 flex flex-col">
//         <Navbar />

//         <div className="p-6 bg-gray-100 flex-1">
//           <h1 className="text-3xl font-semibold mb-6">Welcome, {user.name || "User"}</h1>

//           {/* Summary Cards */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//             {Object.keys(summary).map((status) => (
//               <DashboardCard
//                 key={status}
//                 title={status}
//                 count={summary[status]}
//                 color={statusColors[status]}
//               />
//             ))}
//           </div>

//           {/* Recent Internships Table */}
//           <div className="bg-white shadow-md rounded-lg overflow-x-auto">
//             <table className="w-full text-left border-collapse">
//               <thead className="bg-gray-200">
//                 <tr>
//                   <th className="p-3">Company</th>
//                   <th className="p-3">Role</th>
//                   <th className="p-3">Status</th>
//                   <th className="p-3">Applied On</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {internships.map((item, index) => (
//                   <tr
//                     key={index}
//                     className="border-b hover:bg-gray-50 transition-colors"
//                   >
//                     <td className="p-3">{item.company}</td>
//                     <td className="p-3">{item.role}</td>
//                     <td className="p-3">
//                       <span
//                         className={`px-2 py-1 rounded-full text-white text-xs ${statusColors[item.status]}`}
//                       >
//                         {item.status}
//                       </span>
//                     </td>
//                     <td className="p-3">{item.date}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import DashboardCard from "../components/DashboardCard";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();   // <-- ADDED

  const [user, setUser] = useState({});
  const [internships, setInternships] = useState([]);

  // UI states for search, filter, sorting
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");
  
  useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) navigate("/login");
}, []);

  useEffect(() => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) setUser(JSON.parse(storedUser));

  const savedInternships =
    JSON.parse(localStorage.getItem("internships")) || [];
  setInternships(savedInternships);
}, []);


  // 🔹 DELETE INTERNSHIP
  const handleDelete = (index) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;

    const updated = internships.filter((_, i) => i !== index);
    setInternships(updated);
    localStorage.setItem("internships", JSON.stringify(updated));
  };

  // 🔹 EDIT → Redirect to EditInternship page
  const handleEdit = (index) => {
    navigate(`/edit/${index}`);   // <-- UPDATED
  };

  // Summary card calculation
  const summary = internships.reduce(
    (acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    },
    { Applied: 0, Interview: 0, OA: 0, Offer: 0, Rejected: 0 }
  );

  const statusColors = {
    Applied: "bg-blue-500",
    Interview: "bg-yellow-500",
    OA: "bg-indigo-500",
    Offer: "bg-green-500",
    Rejected: "bg-red-500",
  };

  // ------------------------------
  // FILTER + SEARCH + SORT LOGIC
  // ------------------------------
  const applyFilters = () => {
    let data = [...internships];

    if (search.trim() !== "") {
      data = data.filter(
        (i) =>
          i.company.toLowerCase().includes(search.toLowerCase()) ||
          i.role.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filterStatus !== "All") {
      data = data.filter((i) => i.status === filterStatus);
    }

    data.sort((a, b) => {
      const da = new Date(a.appliedDate);
      const db = new Date(b.appliedDate);
      return sortOrder === "newest" ? db - da : da - db;
    });

    return data;
  };

  const filteredInternships = applyFilters();

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <div className="p-6 bg-gray-100 flex-1">
          <h1 className="text-3xl font-semibold mb-6">
            Welcome, {user.name || "User"}
          </h1>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {Object.keys(summary).map((status) => (
              <DashboardCard
                key={status}
                title={status}
                count={summary[status]}
                color={statusColors[status]}
              />
            ))}
          </div>

          {/* FILTER BAR */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white p-4 shadow rounded-lg">
            <input
              type="text"
              placeholder="Search by company or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="p-3 border rounded-md flex-1"
            />

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-3 border rounded-md"
            >
              <option value="All">All Status</option>
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="OA">OA</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="p-3 border rounded-md"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          {/* No Internships Message */}
          {internships.length === 0 ? (
            <div className="p-6 bg-white rounded-lg shadow-md text-center text-gray-600">
              <p className="mb-3">No internships applied yet.</p>
              <p>
                Your browser extension will automatically save internship
                applications here after you apply.
                <br />
                You can also manually add internships.
              </p>
            </div>
          ) : filteredInternships.length === 0 ? (
            <div className="p-6 bg-white rounded-lg shadow-md text-center text-gray-600">
              <p>No matching internships found.</p>
            </div>
          ) : (
            // Internships Table
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-3">Company</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Applied On</th>
                    <th className="p-3">Deadline/OA Date</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredInternships.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-3">{item.company}</td>
                      <td className="p-3">{item.role}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-white text-xs ${
                            statusColors[item.status]
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3">{item.appliedDate}</td>
                      <td className="p-3">{item.deadline || "-"}</td>

                      {/* ACTION BUTTONS */}
                      <td className="p-3 flex gap-2">
                        <button
                          onClick={() => handleEdit(index)}
                          className="px-3 py-1 rounded bg-yellow-500 text-white text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          className="px-3 py-1 rounded bg-red-500 text-white text-xs"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
