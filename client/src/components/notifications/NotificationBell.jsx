import { useEffect, useState } from "react";
import API from "../../api/axios";
import NotificationDropdown from "./NotificationDropdown";

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const res = await API.get("/notifications/my");
      const notifications = res.data.notifications || [];

      const unread = notifications.filter(
        (notification) => !notification.isRead
      ).length;

      setUnreadCount(unread);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const toggleDropdown = () => {
    setOpen(!open);
    fetchUnreadCount();
  };

  const closeDropdown = () => {
    setOpen(false);
    fetchUnreadCount();
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="relative bg-slate-800 px-4 py-2 rounded-xl hover:bg-slate-700 transition"
      >
        🔔

        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs min-w-5 h-5 px-1 rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      <NotificationDropdown
        open={open}
        onClose={closeDropdown}
      />
    </div>
  );
}

export default NotificationBell;