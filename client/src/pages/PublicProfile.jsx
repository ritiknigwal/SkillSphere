import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/axios";
import ReviewList from "../components/reviews/ReviewList";
import ConnectionButton from "../components/connections/ConnectionButton";

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5050"
    : "https://skillsphere-1k44.onrender.com";

const getFileUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}${path}`;
};

function PublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await API.get(`/user/${id}`);
      setUser(res.data.user);
    } catch (err) {
      alert("Failed to load user profile");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex justify-center items-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 shadow-xl">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <img
              src={
                user.profileImage
                  ? getFileUrl(user.profileImage)
                  : `https://ui-avatars.com/api/?name=${user.fullName}`
              }
              alt="Profile"
              className="w-40 h-40 rounded-full object-cover border-4 border-white/30"
            />

            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold">{user.fullName}</h1>

              <p className="text-blue-100 text-lg mt-2">
                {user.headline || "Skill Provider"}
              </p>

              <p className="text-blue-100 mt-2">
                📍 {user.location || "India"}
              </p>

              <p className="mt-3 text-yellow-300 text-xl font-semibold">
                ⭐ {user.rating || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-3">About</h2>
          <p className="text-gray-300 leading-7">
            {user.bio || "No bio added yet."}
          </p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4">Portfolio Links</h2>

          <div className="flex flex-wrap gap-3">
            {user.github && (
              <a
                href={user.github}
                target="_blank"
                rel="noreferrer"
                className="bg-slate-700 px-5 py-3 rounded-xl hover:bg-slate-600"
              >
                GitHub
              </a>
            )}

            {user.linkedin && (
              <a
                href={user.linkedin}
                target="_blank"
                rel="noreferrer"
                className="bg-blue-600 px-5 py-3 rounded-xl hover:bg-blue-700"
              >
                LinkedIn
              </a>
            )}

            {user.portfolio && (
              <a
                href={user.portfolio}
                target="_blank"
                rel="noreferrer"
                className="bg-purple-600 px-5 py-3 rounded-xl hover:bg-purple-700"
              >
                Portfolio
              </a>
            )}

            {!user.github && !user.linkedin && !user.portfolio && (
              <p className="text-gray-400">No portfolio links added.</p>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">Skills Offered</h2>

            <div className="flex flex-wrap gap-3">
              {user.skillsOffered?.length > 0 ? (
                user.skillsOffered.map((skill) => (
                  <div
                    key={skill._id}
                    className="bg-blue-600/20 text-blue-300 border border-blue-600/30 px-4 py-2 rounded-full"
                  >
                    {skill.name}
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No Skills Added</p>
              )}
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">Skills Wanted</h2>

            <div className="flex flex-wrap gap-3">
              {user.skillsWanted?.length > 0 ? (
                user.skillsWanted.map((skill) => (
                  <div
                    key={skill._id}
                    className="bg-green-600/20 text-green-300 border border-green-600/30 px-4 py-2 rounded-full"
                  >
                    {skill.name}
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No Skills Added</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4">Resume</h2>

          {user.resume ? (
            <a
              href={getFileUrl(user.resume)}
              target="_blank"
              rel="noreferrer"
              className="inline-block bg-green-600 px-5 py-3 rounded-xl hover:bg-green-700"
            >
              📄 View Resume
            </a>
          ) : (
            <p className="text-gray-400">No Resume Uploaded</p>
          )}
        </div>

        <ReviewList userId={user._id} />

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4">Actions</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() =>
                navigate("/chat", {
                  state: {
                    selectedUser: user,
                  },
                })
              }
              className="bg-blue-600 py-3 rounded-xl hover:bg-blue-700 transition"
            >
              💬 Start Chat
            </button>

            <button
              onClick={() =>
                navigate("/sessions", {
                  state: {
                    selectedUser: user,
                  },
                })
              }
              className="bg-green-600 py-3 rounded-xl hover:bg-green-700 transition"
            >
              📅 Book Session
            </button>

            <ConnectionButton profileUserId={user._id} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PublicProfile;