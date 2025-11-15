// export default function Navbar() {
//   return (
//     <div className="h-16 shadow-md flex items-center justify-end px-6 bg-white">
//       <p className="font-medium">Welcome, User</p>
//     </div>
//   );
// }
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("internships"); // optional: clear saved internships
    navigate("/login");
  }

  return (
    <div className="w-full bg-white shadow p-4 flex justify-between items-center">
      <h2 className="text-xl font-bold">Internship Tracker</h2>

      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded-md"
      >
        Logout
      </button>
    </div>
  );
}
