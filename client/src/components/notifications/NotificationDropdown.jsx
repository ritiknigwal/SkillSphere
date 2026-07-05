import { useEffect, useState } from "react";
import API from "../../api/axios";
import NotificationList from "./NotificationList";

function NotificationDropdown({ open, onClose }) {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/notifications/my");
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  const markRead = async (id) => {
    try {
      await API.put(`/notifications/read/${id}`);
      fetchNotifications();
    } catch (err) {
      console.log(err);
    }
  };

  const markAllRead = async () => {
    try {
      await API.put("/notifications/read-all");
      fetchNotifications();
    } catch (err) {
      console.log(err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await API.delete(`/notifications/${id}`);
      fetchNotifications();
    } catch (err) {
      console.log(err);
    }
  };

  if (!open) return null;

  return (
    <div className="absolute right-0 mt-2 w-[420px] max-h-[500px] overflow-y-auto bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50">
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <h2 className="text-lg font-bold text-white">
          Notifications
        </h2>

        <button
          onClick={markAllRead}
          className="text-sm bg-blue-600 px-3 py-1 rounded text-white"
        >
          Mark All Read
        </button>
      </div>

      <div className="p-4">
        <NotificationList
          notifications={notifications}
          onRead={markRead}
          onDelete={deleteNotification}
        />
      </div>

      <div className="border-t border-slate-700 p-3 text-right">
        <button
          onClick={onClose}
          className="bg-slate-600 px-4 py-2 rounded text-white"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default NotificationDropdown;