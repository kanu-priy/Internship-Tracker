// import React, { useEffect, useState, useCallback } from "react";
// import Navbar from "../components/Navbar";
// import Sidebar from "../components/Sidebar";
// import DashboardCard from "../components/DashboardCard";
// import { useNavigate } from "react-router-dom";

// export default function Dashboard() {
//   const navigate = useNavigate();

//   const [user, setUser] = useState({});
//   const [internships, setInternships] = useState([]);

//   const [search, setSearch] = useState("");
//   const [filterStatus, setFilterStatus] = useState("All");
//   const [sortOrder, setSortOrder] = useState("newest");

//   /* ---------------------------------------
//      🔐 AUTH CHECK
//   ----------------------------------------*/
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token) navigate("/login");
//   }, [navigate]);

//   /* ---------------------------------------
//      👤 LOAD USER
//   ----------------------------------------*/
//   useEffect(() => {
//     const storedUser = localStorage.getItem("user");
//     if (storedUser) {
//       try {
//         setUser(JSON.parse(storedUser));
//       } catch {
//         localStorage.removeItem("user");
//       }
//     }
//   }, []);

//   /* ---------------------------------------
//      📡 FETCH INTERNSHIPS (MEMOIZED)
//   ----------------------------------------*/
//   const fetchInternships = useCallback(async () => {
//     try {
//       const token = localStorage.getItem("token");

//       const res = await fetch("http://localhost:5000/api/internships", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!res.ok) throw new Error("Fetch failed");

//       const data = await res.json();
//       setInternships(data);
//     } catch (err) {
//       console.error("Fetch internships failed", err);
//     }
//   }, []);

//   /* ---------------------------------------
//      🚀 INITIAL LOAD
//   ----------------------------------------*/
//   useEffect(() => {
//     fetchInternships();
//   }, [fetchInternships]);

//   /* ---------------------------------------
//      🧩 LISTEN FROM EXTENSION
//   ----------------------------------------*/
//   // useEffect(() => {
//   //   function handleMessage(event) {
//   //     if (event.data?.type === "ADD_INTERNSHIP_DEADLINEDESK") {
//   //       console.log("🔄 Extension added internship → refreshing");
//   //       fetchInternships();
//   //     }
//   //   }

//   //   window.addEventListener("message", handleMessage);
//   //   return () => window.removeEventListener("message", handleMessage);
//   // }, [fetchInternships]);
//   useEffect(() => {
//   async function handleMessage(event) {
//     if (event.data?.type === "ADD_INTERNSHIP_DEADLINEDESK") {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         alert("Please login first");
//         return;
//       }

//       try {
//         const res = await fetch("http://localhost:5000/api/internships", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify(event.data.internship),
//         });

//         if (!res.ok) throw new Error("Save failed");

//         // refresh dashboard
//         fetchInternships();
//         alert("Internship saved to MongoDB");
//       } catch (err) {
//         console.error(err);
//         alert("Failed to save internship");
//       }
//     }
//   }

//   window.addEventListener("message", handleMessage);
//   return () => window.removeEventListener("message", handleMessage);
// }, []);


//   /* ---------------------------------------
//      ❌ DELETE
//   ----------------------------------------*/
//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this internship?")) return;

//     try {
//       const token = localStorage.getItem("token");
//       await fetch(`http://localhost:5000/api/internships/${id}`, {
//         method: "DELETE",
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       fetchInternships();
//     } catch (err) {
//       console.error("Delete failed", err);
//     }
//   };

//   /* ---------------------------------------
//      ✏️ EDIT
//   ----------------------------------------*/
//   const handleEdit = (id) => {
//     navigate(`/edit/${id}`);
//   };

//   /* ---------------------------------------
//      📊 SUMMARY
//   ----------------------------------------*/
//   const summary = internships.reduce(
//     (acc, item) => {
//       acc[item.status] = (acc[item.status] || 0) + 1;
//       return acc;
//     },
//     { Applied: 0, Interview: 0, OA: 0, Offer: 0, Rejected: 0 }
//   );

//   const statusColors = {
//     Applied: "bg-blue-500",
//     Interview: "bg-yellow-500",
//     OA: "bg-indigo-500",
//     Offer: "bg-green-500",
//     Rejected: "bg-red-500",
//   };

//   /* ---------------------------------------
//      🔍 FILTER + SORT
//   ----------------------------------------*/
//   const filteredInternships = internships
//     .filter((i) => {
//       if (filterStatus !== "All" && i.status !== filterStatus) return false;
//       if (
//         search &&
//         !i.company.toLowerCase().includes(search.toLowerCase()) &&
//         !i.role.toLowerCase().includes(search.toLowerCase())
//       )
//         return false;
//       return true;
//     })
//     .sort((a, b) => {
//       const da = new Date(a.appliedDate);
//       const db = new Date(b.appliedDate);
//       return sortOrder === "newest" ? db - da : da - db;
//     });

//   /* ---------------------------------------
//      🧩 UI
//   ----------------------------------------*/
//   return (
//     <div className="flex min-h-screen">
//       <Sidebar />

//       <div className="flex-1 flex flex-col">
//         <Navbar />

//         <div className="p-6 bg-gray-100 flex-1">
//           <h1 className="text-3xl font-semibold mb-6">
//             Welcome, {user.name || "User"}
//           </h1>

//           {/* Summary Cards */}
//           <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
//             {Object.keys(summary).map((status) => (
//               <DashboardCard
//                 key={status}
//                 title={status}
//                 count={summary[status]}
//                 color={statusColors[status]}
//               />
//             ))}
//           </div>

//           {/* Filters */}
//           <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white p-4 shadow rounded-lg">
//             <input
//               type="text"
//               placeholder="Search company or role"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="p-3 border rounded-md flex-1"
//             />

//             <select
//               value={filterStatus}
//               onChange={(e) => setFilterStatus(e.target.value)}
//               className="p-3 border rounded-md"
//             >
//               <option value="All">All</option>
//               {Object.keys(summary).map((s) => (
//                 <option key={s} value={s}>
//                   {s}
//                 </option>
//               ))}
//             </select>

//             <select
//               value={sortOrder}
//               onChange={(e) => setSortOrder(e.target.value)}
//               className="p-3 border rounded-md"
//             >
//               <option value="newest">Newest</option>
//               <option value="oldest">Oldest</option>
//             </select>
//           </div>

//           {/* Table */}
//           {filteredInternships.length === 0 ? (
//             <div className="bg-white p-6 rounded shadow text-center">
//               No internships found.
//             </div>
//           ) : (
//             <div className="bg-white shadow rounded overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-gray-200">
//                   <tr>
//                     <th className="p-3">Company</th>
//                     <th className="p-3">Role</th>
//                     <th className="p-3">Status</th>
//                     <th className="p-3">Applied</th>
//                     <th className="p-3">Deadline</th>
//                     <th className="p-3">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredInternships.map((item) => (
//                     <tr key={item._id} className="border-b">
//                       <td className="p-3">{item.company}</td>
//                       <td className="p-3">{item.role}</td>
//                       <td className="p-3">
//                         <span
//                           className={`px-2 py-1 text-xs text-white rounded ${statusColors[item.status]}`}
//                         >
//                           {item.status}
//                         </span>
//                       </td>
//                       <td className="p-3">{item.appliedDate}</td>
//                       <td className="p-3">{item.deadline || "-"}</td>
//                       <td className="p-3 flex gap-2">
//                         <button
//                           onClick={() => handleEdit(item._id)}
//                           className="bg-yellow-500 text-white px-3 py-1 text-xs rounded"
//                         >
//                           Edit
//                         </button>
//                         <button
//                           onClick={() => handleDelete(item._id)}
//                           className="bg-red-500 text-white px-3 py-1 text-xs rounded"
//                         >
//                           Delete
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
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
  const navigate = useNavigate();

  const [user, setUser] = useState({});
  const [internships, setInternships] = useState([]);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");

  // --------------------------------------------------
  // AUTH CHECK + FETCH
  // --------------------------------------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchInternships();
  }, [navigate]);

  // --------------------------------------------------
  // FETCH INTERNSHIPS
  // --------------------------------------------------
  async function fetchInternships() {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/internships", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Fetch failed");

      const data = await res.json();
      setInternships(data);
    } catch (err) {
      console.error("❌ Fetch internships failed", err);
    }
  }

  // --------------------------------------------------
  // 🔥 LISTEN FROM EXTENSION & SAVE TO BACKEND
  // --------------------------------------------------
  useEffect(() => {
    async function handleMessage(event) {
      if (event.data?.type !== "ADD_INTERNSHIP_DEADLINEDESK") return;

      const internship = event.data.internship;

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("Please login to DeadlineDesk first");
          return;
        }

        const res = await fetch("http://localhost:5000/api/internships", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            company: internship.company,
            role: internship.role,
            status: "Applied",
            appliedDate: internship.appliedDate,
            deadline: internship.deadline || "",
          }),
        });

        if (!res.ok) throw new Error("Save failed");

        console.log("✅ Internship saved from extension");
        fetchInternships(); // refresh dashboard
      } catch (err) {
        console.error("❌ Extension save failed", err);
        alert("Failed to save extracted internship");
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // --------------------------------------------------
  // LOAD USER
  // --------------------------------------------------
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this internship?")) return;

    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5000/api/internships/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setInternships((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  // --------------------------------------------------
  // EDIT
  // --------------------------------------------------
  const handleEdit = (id) => {
    navigate(`/edit/${id}`);
  };

  // --------------------------------------------------
  // SUMMARY
  // --------------------------------------------------
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

  // --------------------------------------------------
  // FILTER + SORT
  // --------------------------------------------------
  const filteredInternships = internships
    .filter((i) => {
      if (filterStatus !== "All" && i.status !== filterStatus) return false;
      if (
        search &&
        !i.company.toLowerCase().includes(search.toLowerCase()) &&
        !i.role.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    })
    .sort((a, b) => {
      const da = new Date(a.appliedDate);
      const db = new Date(b.appliedDate);
      return sortOrder === "newest" ? db - da : da - db;
    });

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <div className="p-6 bg-gray-100 flex-1">
          <h1 className="text-3xl font-semibold mb-6">
            Welcome, {user.name || "User"}
          </h1>

          {/* Summary */}
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

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white p-4 shadow rounded-lg">
            <input
              type="text"
              placeholder="Search company or role"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="p-3 border rounded-md flex-1"
            />

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-3 border rounded-md"
            >
              <option value="All">All</option>
              {Object.keys(summary).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="p-3 border rounded-md"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>

          {/* Table */}
          {filteredInternships.length === 0 ? (
            <div className="bg-white p-6 rounded shadow text-center">
              No internships found.
            </div>
          ) : (
            <div className="bg-white shadow rounded overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-3">Company</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Applied</th>
                    <th className="p-3">Deadline</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInternships.map((item) => (
                    <tr key={item._id} className="border-b">
                      <td className="p-3">{item.company}</td>
                      <td className="p-3">{item.role}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 text-xs text-white rounded ${statusColors[item.status]}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3">{item.appliedDate}</td>
                      <td className="p-3">{item.deadline || "-"}</td>
                      <td className="p-3 flex gap-2">
                        <button
                          onClick={() => handleEdit(item._id)}
                          className="bg-yellow-500 text-white px-3 py-1 text-xs rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="bg-red-500 text-white px-3 py-1 text-xs rounded"
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
