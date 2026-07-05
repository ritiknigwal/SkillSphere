import { Link, useLocation } from "react-router-dom";
import NotificationBell from "./notifications/NotificationBell";

function Navbar({ onLogout }) {
  const location = useLocation();
  const role = localStorage.getItem("role");

  const linkStyle = (path) =>
    `px-4 py-2 rounded-xl text-sm font-medium transition ${
      location.pathname === path
        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
        : "text-slate-300 hover:bg-slate-700 hover:text-white"
    }`;

  return (
    <nav className="sticky top-4 z-40 bg-slate-800/90 backdrop-blur border border-slate-700 rounded-2xl shadow-xl p-4 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <Link to="/dashboard" className="text-2xl font-bold text-blue-400">
          SkillSphere 🚀
        </Link>

        <div className="flex flex-wrap justify-center gap-2 bg-slate-900/60 p-2 rounded-2xl">
          <Link to="/dashboard" className={linkStyle("/dashboard")}>
            Dashboard
          </Link>

          <Link to="/chat" className={linkStyle("/chat")}>
            Chat
          </Link>

          <Link to="/profile" className={linkStyle("/profile")}>
            Profile
          </Link>

          {role === "admin" && (
            <Link to="/admin" className={linkStyle("/admin")}>
              Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell />

          <button
            onClick={onLogout}
            className="bg-red-600 px-4 py-2 rounded-xl hover:bg-red-700 text-white text-sm font-semibold transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;