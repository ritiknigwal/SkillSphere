function SkillTable({ skills, onDelete }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-2xl font-bold">Skills</h2>
          <p className="text-slate-400 text-sm">
            View and manage all skills available on the platform.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full">
          <thead className="bg-slate-900">
            <tr>
              <th className="text-left py-4 px-4 text-slate-300">Skill</th>
              <th className="text-left py-4 px-4 text-slate-300">Level</th>
              <th className="text-left py-4 px-4 text-slate-300">Owner</th>
              <th className="text-left py-4 px-4 text-slate-300">Action</th>
            </tr>
          </thead>

          <tbody>
            {skills.map((skill) => (
              <tr
                key={skill._id}
                className="border-t border-slate-700 hover:bg-slate-700/40 transition"
              >
                <td className="py-4 px-4 font-medium">
                  {skill.name}
                </td>

                <td className="py-4 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      skill.level === "Advanced"
                        ? "bg-red-600/20 text-red-300 border border-red-600/30"
                        : skill.level === "Intermediate"
                        ? "bg-yellow-600/20 text-yellow-300 border border-yellow-600/30"
                        : "bg-green-600/20 text-green-300 border border-green-600/30"
                    }`}
                  >
                    {skill.level}
                  </span>
                </td>

                <td className="py-4 px-4 text-slate-300">
                  {skill.user?.fullName || "Unknown"}
                </td>

                <td className="py-4 px-4">
                  <button
                    onClick={() => onDelete(skill._id)}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl text-sm transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {skills.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-400">
              No skills found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SkillTable;