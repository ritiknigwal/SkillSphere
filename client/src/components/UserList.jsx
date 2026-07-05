import { useEffect, useState } from "react";
import API from "../api/axios";

function UserList({ onSelectUser, onlineUsers = [] }) {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await API.get("/user/all");

      const sorted = [...res.data.users].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return a.fullName.localeCompare(b.fullName);
      });

      setUsers(sorted);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const pinChat = async (id) => {
    try {
      await API.put(`/user/pin-chat/${id}`);
      fetchUsers();
    } catch (err) {
      console.log(err);
    }
  };

  const archiveChat = async (id) => {
    try {
      await API.put(`/user/archive-chat/${id}`);
      fetchUsers();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="bg-slate-800 p-3 rounded mb-4">
      <h3 className="font-bold mb-3">Users</h3>

      {/* ACTIVE CHATS */}
      {users
        .filter((user) => !user.isArchived)
        .map((user) => {
          const isOnline = onlineUsers.includes(user._id);

          return (
            <div key={user._id} className="bg-slate-700 mb-2 rounded p-2">
              <div className="cursor-pointer" onClick={() => onSelectUser(user)}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">
                      {user.fullName}
                      {user.isPinned && <span className="ml-2">📌</span>}
                    </p>

                    {isOnline ? (
                      <p className="text-green-400 text-xs">● Online</p>
                    ) : (
                      <p className="text-gray-400 text-xs">
                        Last Seen:{" "}
                        {user.lastSeen
                          ? new Date(user.lastSeen).toLocaleString()
                          : "Never"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => pinChat(user._id)}
                  className="text-xs bg-yellow-600 px-2 py-1 rounded"
                >
                  {user.isPinned ? "Unpin" : "Pin"}
                </button>

                <button
                  onClick={() => archiveChat(user._id)}
                  className="text-xs bg-red-600 px-2 py-1 rounded"
                >
                  Archive
                </button>
              </div>
            </div>
          );
        })}

      {/* ARCHIVED CHATS */}
      {users.filter((user) => user.isArchived).length > 0 && (
        <>
          <h3 className="font-bold mt-6 mb-3 text-gray-300">
            📦 Archived Chats
          </h3>

          {users
            .filter((user) => user.isArchived)
            .map((user) => {
              const isOnline = onlineUsers.includes(user._id);

              return (
                <div
                  key={user._id}
                  className="bg-slate-700 mb-2 rounded p-2 opacity-80"
                >
                  <div
                    className="cursor-pointer"
                    onClick={() => onSelectUser(user)}
                  >
                    <p className="font-semibold">{user.fullName}</p>

                    {isOnline ? (
                      <p className="text-green-400 text-xs">● Online</p>
                    ) : (
                      <p className="text-gray-400 text-xs">
                        Last Seen:{" "}
                        {user.lastSeen
                          ? new Date(user.lastSeen).toLocaleString()
                          : "Never"}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => archiveChat(user._id)}
                    className="mt-2 bg-green-600 px-3 py-1 rounded text-xs"
                  >
                    Unarchive
                  </button>
                </div>
              );
            })}
        </>
      )}
    </div>
  );
}

export default UserList;