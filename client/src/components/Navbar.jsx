import { Link, useLocation } from "react-router-dom";
import NotificationBell from "./notifications/NotificationBell";

function Navbar({ onLogout }) {
  const location = useLocation();

  const linkStyle = (path) =>
    `px-4 py-2 rounded-lg transition ${
      location.pathname === path
        ? "bg-blue-600 text-white"
        : "text-gray-300 hover:bg-slate-700 hover:text-white"
    }`;

  return (
    <nav className="bg-black  shadow-lg p-4 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Logo */}
        <Link
          to="/dashboard"
          className="text-2xl font-bold text-yellow-500"
        >
          SkillSphere 
          
        </Link>

        {/* Navigation */}
        <div className="flex flex-wrap justify-center gap-2">
          <Link to="/dashboard" className={linkStyle("/dashboard")}>
            Dashboard
          </Link>

          <Link to="/chat" className={linkStyle("/chat")}>
            Chat
          </Link>

          <Link to="/profile" className={linkStyle("/profile")}>
            Profile
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          <NotificationBell />

          <button
            onClick={onLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;