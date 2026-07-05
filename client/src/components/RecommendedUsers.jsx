import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api/axios";

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5050"
    : "https://skillsphere-1k44.onrender.com";

const getProfileImage = (image) => {
  if (!image) return null;
  if (image.startsWith("http")) return image;
  return `${API_BASE_URL}${image}`;
};

function RecommendedUsers() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get("/user/all");
      setUsers(res.data.users);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg mb-6">
      <h2 className="text-2xl font-bold mb-5">
        Recommended Mentors
      </h2>

      <div className="grid md:grid-cols-2 gap-5">
        {users.map((user) => (
          <div
            key={user._id}
            className="bg-slate-700 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <img
                src={
                  user.profileImage
                    ? getProfileImage(user.profileImage)
                    : `https://ui-avatars.com/api/?name=${user.fullName}`
                }
                alt={user.fullName}
                className="w-16 h-16 rounded-full object-cover flex-shrink-0"
              />

              <div className="min-w-0">
                <h3 className="font-bold text-lg truncate">
                  {user.fullName}
                </h3>

                <p className="text-gray-300 line-clamp-2 break-words">
                  {user.headline || "Skill Provider"}
                </p>

                <p className="text-gray-400 text-sm truncate">
                  📍 {user.location || "India"}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate(`/user/${user._id}`)}
              className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-xl whitespace-nowrap self-start lg:self-center"
            >
              View Profile
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecommendedUsers;