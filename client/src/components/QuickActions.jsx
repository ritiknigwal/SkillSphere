import { Link } from "react-router-dom";

function QuickActions() {
  return (
    <div className="grid md:grid-cols-5 gap-5 mb-6">
      {/*Profile*/}
      <Link
        to="/profile"
        className="bg-orange-400 p-5 rounded-xl hover:bg-slate-700 transition"
      >
        <h3 className="text-xl font-bold">👤 Profile</h3>

        <p className="text-white-1000 mt-2">Update your profile</p>
      </Link>

      {/* Chat */}
      <Link
        to="/chat"
        className="bg-orange-400 p-5 rounded-xl hover:bg-slate-700 transition"
      >
        <h3 className="text-xl font-bold">💬 Messages</h3>

        <p className="text-white-800 mt-2">Open your chats</p>
      </Link>

      {/* Skill Exchange */}
      <Link
        to="/exchange"
        className="bg-orange-400 p-5 rounded-xl hover:bg-slate-700 transition"
      >
        <h3 className="text-xl font-bold">🤝 Skill Exchange</h3>

        <p className="text-white-800 mt-2">Exchange skills with people</p>
      </Link>

      {/* Session */}
      <Link
        to="/sessions"
        className="bg-orange-400 p-5 rounded-xl hover:bg-slate-700 transition"
      >
        <h3 className="text-xl font-bold">📅 Sessions</h3>

        <p className="text-white-800 mt-2">
          Book and manage learning sessions
        </p>
      </Link>

      {/* Video Call */}
      <Link
        to="/video-call"
        className="bg-orange-400 p-5 rounded-xl hover:bg-slate-700 transition"
      >
        <h3 className="text-xl font-bold">📹 Video Call</h3>

        <p className="text-white-800 mt-2">Start a secure video call</p>
      </Link>

      {/* Availability */}
      <Link
        to="/availability"
        className="bg-orange-400 p-5 rounded-xl hover:bg-slate-700 transition"
      >
        <h3 className="text-xl font-bold">📆 Availability</h3>

        <p className="text-white-800 mt-2">
          Manage your available time slots
        </p>
      </Link>

      {/* connections */}
      <Link
        to="/connections"
        className="bg-orange-400 p-5 rounded-xl hover:bg-slate-700 transition"
      >
        <h3 className="text-xl font-bold">👥 Connections</h3>

        <p className="text-white-800 mt-2">Manage your network requests</p>
      </Link>

      {/* Reviews & Ratings */}
      <Link
        to="/reviews"
        className="bg-orange-400 p-5 rounded-xl hover:bg-slate-700 transition"
      >
        <h3 className="text-xl font-bold">⭐ Reviews & Ratings</h3>

        <p className="text-white-800 mt-2">View your reviews and ratings</p>
      </Link>

      {/* Premium */}
      <div className="bg-orange-400 p-5 rounded-xl">
        <h3 className="text-xl font-bold">⭐ Premium</h3>

        <p className="text-white-800 mt-2">Coming Soon</p>
      </div>
    </div>
  );
}

export default QuickActions;