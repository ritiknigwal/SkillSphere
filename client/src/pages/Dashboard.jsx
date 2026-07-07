import RecommendedUsers from "../components/RecommendedUsers";
import TrendingCategories from "../components/TrendingCategories";
import QuickActions from "../components/QuickActions";
import WelcomeCard from "../components/WelcomeCard";
import DashboardStats from "../components/DashboardStats";
import DashboardLayout from "../layouts/DashboardLayout";
import SkillForm from "../components/SkillForm.jsx";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { toast } from "react-toastify";

function Dashboard() {
  const navigate = useNavigate();

  const [skills, setSkills] = useState([]);
  const [editSkill, setEditSkill] = useState(null);
  const [search, setSearch] = useState("");

  const getUserRole = () => {
    const savedRole = localStorage.getItem("role");
    if (savedRole) return savedRole;

    const token = localStorage.getItem("token");
    if (!token) return "";

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.role || "";
    } catch (err) {
      return "";
    }
  };

  const isAdmin = getUserRole() === "admin";

  const fetchSkills = async () => {
    try {
      const res = await API.get("/skills/my-skills");
      setSkills(res.data.skills);
    } catch (err) {
      toast.error("Failed to load skills");
    }
  };

  const searchSkills = async (query) => {
    try {
      if (!query) {
        fetchSkills();
        return;
      }

      const res = await API.get(`/skills/search?q=${query}`);
      setSkills(res.data.skills);
    } catch (err) {
      toast.error("Search failed");
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleDelete = async (id) => {
    try {
      await API.delete(`/skills/${id}`);
      toast.success("Skill deleted successfully");
      fetchSkills();
    } catch (err) {
      toast.success("Skill deleted successfully");
    }
  };

  const handleUpdate = async () => {
    try {
      const { _id, name, category, level, description } = editSkill;

      await API.put(`/skills/${_id}`, {
        name,
        category,
        level,
        description,
      });

      toast.success("Skill updated successfully");
      setEditSkill(null);
      fetchSkills();
    } catch (err) {
      toast.error("Failed to update skill");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);

    setTimeout(() => {
      searchSkills(value);
    }, 400);
  };

  return (
    <DashboardLayout onLogout={handleLogout}>
      <div className="max-w-7xl mx-auto text-white space-y-6">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 shadow-xl">
          <p className="text-blue-100 text-sm">Welcome back to</p>
          <h1 className="text-4xl font-bold mt-1">SkillSphere</h1>
          <p className="text-blue-100 mt-3 max-w-2xl">
            Manage your skills, connect with learners, schedule sessions, and
            grow your professional network from one place.
          </p>

          {isAdmin && (
            <button
              onClick={() => navigate("/admin")}
              className="mt-5 bg-red-600 hover:bg-red-700 px-5 py-3 rounded-xl font-semibold transition"
            >
              🛡️ Admin Dashboard
            </button>
          )}
        </div>

        <DashboardStats skills={skills} />
        <WelcomeCard />
        <QuickActions />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <TrendingCategories />
          <RecommendedUsers />
        </div>

        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-2xl font-bold">Skills Workspace</h2>
              <p className="text-slate-400 text-sm">
                Add, update, search and manage your learning skills.
              </p>
            </div>

            <input
              type="text"
              placeholder="Search your skills..."
              value={search}
              onChange={handleSearchChange}
              className="w-full md:w-80 p-3 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-slate-900/70 rounded-2xl p-5 border border-slate-700">
                <h2 className="text-2xl font-bold mb-5">Add New Skill</h2>
                <SkillForm onSkillAdded={fetchSkills} />
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-slate-900/70 rounded-2xl p-5 border border-slate-700">
                <h2 className="text-2xl font-bold mb-5">My Skills</h2>

                {editSkill && (
                  <div className="border border-blue-500 bg-blue-950/30 rounded-2xl p-4 mb-6">
                    <h3 className="font-bold text-xl mb-3">Edit Skill</h3>

                    <input
                      className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 mb-3 outline-none focus:border-blue-500"
                      value={editSkill.name}
                      onChange={(e) =>
                        setEditSkill({ ...editSkill, name: e.target.value })
                      }
                    />

                    <input
                      className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 mb-3 outline-none focus:border-blue-500"
                      value={editSkill.category}
                      onChange={(e) =>
                        setEditSkill({
                          ...editSkill,
                          category: e.target.value,
                        })
                      }
                    />

                    <select
                      className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 mb-3 outline-none focus:border-blue-500"
                      value={editSkill.level}
                      onChange={(e) =>
                        setEditSkill({ ...editSkill, level: e.target.value })
                      }
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>

                    <textarea
                      className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 mb-3 outline-none focus:border-blue-500"
                      value={editSkill.description}
                      onChange={(e) =>
                        setEditSkill({
                          ...editSkill,
                          description: e.target.value,
                        })
                      }
                    />

                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdate}
                        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl"
                      >
                        Update
                      </button>

                      <button
                        onClick={() => setEditSkill(null)}
                        className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-xl"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {skills.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-slate-700 rounded-2xl">
                      <p className="text-slate-400">No Skills Found</p>
                    </div>
                  ) : (
                    skills.map((skill) => (
                      <div
                        key={skill._id}
                        className="bg-slate-800 rounded-2xl p-5 border border-slate-700 hover:border-blue-500 transition"
                      >
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div>
                            <h3 className="text-2xl font-bold">
                              {skill.name}
                            </h3>

                            <div className="flex flex-wrap gap-2 mt-3">
                              <span className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-sm">
                                {skill.category}
                              </span>

                              <span className="bg-green-600/20 text-green-300 px-3 py-1 rounded-full text-sm">
                                {skill.level}
                              </span>
                            </div>

                            <p className="text-gray-400 mt-3">
                              {skill.description || "No description added."}
                            </p>
                          </div>

                          <div className="flex gap-3">
                            <button
                              onClick={() => setEditSkill(skill)}
                              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleDelete(skill._id)}
                              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;