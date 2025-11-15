export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-gray-900 text-white p-6">
      <h2 className="text-xl font-bold mb-6">DeadlineDesk</h2>

      <ul className="space-y-4">
        <li><a href="/dashboard" className="block hover:text-gray-300">Dashboard</a></li>
        <li><a href="/add" className="block hover:text-gray-300">Add Internship</a></li>
        <li><a href="/profile" className="block hover:text-gray-300">Profile</a></li>

        {/* ⭐ Added My Account Link */}
        <li><a href="/account" className="block hover:text-gray-300">My Account</a></li>
      </ul>
    </div>
  );
}
