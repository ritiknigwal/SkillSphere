function UserTable({ users, onDelete, onToggleBlock }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-2xl font-bold">Users</h2>
          <p className="text-slate-400 text-sm">
            Manage platform users and account status.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full">
          <thead className="bg-slate-900">
            <tr>
              <th className="text-left py-4 px-4 text-slate-300">Name</th>
              <th className="text-left py-4 px-4 text-slate-300">Email</th>
              <th className="text-left py-4 px-4 text-slate-300">Role</th>
              <th className="text-left py-4 px-4 text-slate-300">Status</th>
              <th className="text-left py-4 px-4 text-slate-300">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr
                key={user._id}
                className="border-t border-slate-700 hover:bg-slate-700/40 transition"
              >
                <td className="py-4 px-4 font-medium">{user.fullName}</td>

                <td className="py-4 px-4 text-slate-300">{user.email}</td>

                <td className="py-4 px-4">
                  <span className="capitalize bg-slate-700 px-3 py-1 rounded-full text-sm">
                    {user.role}
                  </span>
                </td>

                <td className="py-4 px-4">
                  {user.isBlocked ? (
                    <span className="bg-red-600/20 text-red-300 border border-red-600/30 px-3 py-1 rounded-full text-sm">
                      Blocked
                    </span>
                  ) : (
                    <span className="bg-green-600/20 text-green-300 border border-green-600/30 px-3 py-1 rounded-full text-sm">
                      Active
                    </span>
                  )}
                </td>

                <td className="py-4 px-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onToggleBlock(user._id)}
                      className="bg-yellow-600 hover:bg-yellow-700 px-3 py-2 rounded-xl text-sm"
                    >
                      {user.isBlocked ? "Unblock" : "Block"}
                    </button>

                    <button
                      onClick={() => onDelete(user._id)}
                      className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-xl text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <p className="text-center text-gray-400 py-8">No users found.</p>
        )}
      </div>
    </div>
  );
}

export default UserTable;