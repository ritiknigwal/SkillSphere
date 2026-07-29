import { useEffect, useState } from "react";
import API from "../api/axios";
import AdminStats from "../components/admin/AdminStats";
import UserTable from "../components/admin/UserTable";
import SkillTable from "../components/admin/SkillTable";
import { toast } from "react-toastify";

function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [skills, setSkills] = useState([]);

  const fetchDashboard = async () => {
    try {
      const statsRes = await API.get("/admin/dashboard");
      setStats(statsRes.data.stats);

      const usersRes = await API.get("/admin/users");
      setUsers(usersRes.data.users);

      const skillsRes = await API.get("/admin/skills");
      setSkills(skillsRes.data.skills);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load admin dashboard");
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      await API.delete(`/admin/users/${id}`);
      fetchDashboard();
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const toggleBlock = async (id) => {
    try {
      await API.put(`/admin/users/${id}/block`);
      fetchDashboard();
    } catch (error) {
     toast.error("Failed to update user status");
    }
  };

  const deleteSkill = async (id) => {
    if (!window.confirm("Delete this skill?")) return;

    try {
      await API.delete(`/admin/skills/${id}`);
      fetchDashboard();
    } catch (error) {
      toast.error("Failed to delete skill");
    }
  };

  return (
    <div className="min-h-screen bg-white-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-2xl p-6 shadow-2xl">
          <p className="text-orange-100 text-sm">Admin Control Panel</p>

          <h1 className="text-4xl font-bold mt-1">
            Admin Dashboard
          </h1>

          <p className="text-orange-100 mt-3 max-w-2xl">
            Monitor platform activity, manage users, and control skills from one secure admin workspace.
          </p>
        </div>

        <AdminStats stats={stats} />

        <UserTable
          users={users}
          onDelete={deleteUser}
          onToggleBlock={toggleBlock}
        />

        <SkillTable
          skills={skills}
          onDelete={deleteSkill}
        />
      </div>
    </div>
  );
}

export default AdminDashboard;